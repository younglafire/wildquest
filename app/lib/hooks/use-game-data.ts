"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import useSWR from "swr";
import {
  fetchAllMaybeQuest,
  fetchAllMaybeQuestCompletion,
  fetchMaybePlayer,
  findPlayerPda,
  findQuestCompletionPda,
  findQuestPda,
} from "../../generated/wildquest";
import { useCluster } from "../../components/cluster-context";
import { buildCollectionCards, fetchPlayerDiscoveries } from "../collection";
import { fetchOwnedCreatures } from "../creatures";
import { fetchCatalogue } from "../catalogue-client";
import {
  loadConfirmedDiscovery,
  loadPendingIdentification,
} from "../expedition";
import {
  calculatePlayerProgress,
  calculateQuestProgress,
  getActiveQuest,
  getCompletedQuestCount,
  QUEST_IDS,
} from "../game";
import { fetchMatches, getPlayerMatches } from "../matches";
import { useSolanaClient } from "../solana-client-context";
import { useWallet } from "../wallet/context";

const REFRESH_INTERVAL_MS = 30_000;
const subscribeToHydration = () => () => undefined;

export function useGameData(options: { live?: boolean } = {}) {
  const live = options.live ?? true;
  const client = useSolanaClient();
  const { cluster } = useCluster();
  const { wallet, status } = useWallet();
  const address = wallet?.account.address;
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  const catalogue = useSWR(["species-catalogue", cluster], fetchCatalogue, {
    revalidateOnFocus: true,
  });
  const player = useSWR(
    address ? (["player", cluster, address] as const) : null,
    async () => {
      const [playerAddress] = await findPlayerPda({ payer: address! });
      return fetchMaybePlayer(client.rpc, playerAddress, {
        commitment: "confirmed",
      });
    },
    {
      refreshInterval: live ? REFRESH_INTERVAL_MS : 0,
      revalidateOnFocus: live,
    },
  );
  const { mutate: mutatePlayer } = player;
  const discoveries = useSWR(
    address ? (["player-discoveries", cluster, address] as const) : null,
    () => fetchPlayerDiscoveries(client.rpc, address!),
    {
      refreshInterval: live ? REFRESH_INTERVAL_MS : 0,
      revalidateOnFocus: live,
    },
  );
  const creatures = useSWR(
    address ? (["owned-creatures", cluster, address] as const) : null,
    () => fetchOwnedCreatures(client.rpc, address!),
    {
      refreshInterval: live ? REFRESH_INTERVAL_MS : 0,
      revalidateOnFocus: live,
    },
  );
  const quests = useSWR(
    ["quests", cluster],
    async () => {
      const addresses = await Promise.all(
        QUEST_IDS.map(async (questId) => (await findQuestPda({ questId }))[0]),
      );
      const accounts = await fetchAllMaybeQuest(client.rpc, addresses, {
        commitment: "confirmed",
      });
      return accounts.filter((account) => account.exists);
    },
    {
      refreshInterval: live ? REFRESH_INTERVAL_MS : 0,
      revalidateOnFocus: live,
    },
  );
  const questCompletions = useSWR(
    address && quests.data
      ? (["quest-completions", cluster, address] as const)
      : null,
    async () => {
      const addresses = await Promise.all(
        quests.data!.map(async (quest) => {
          return (
            await findQuestCompletionPda({
              quest: quest.address,
              payer: address!,
            })
          )[0];
        }),
      );
      const accounts = await fetchAllMaybeQuestCompletion(
        client.rpc,
        addresses,
        {
          commitment: "confirmed",
        },
      );
      return accounts.filter((account) => account.exists);
    },
    {
      refreshInterval: live ? REFRESH_INTERVAL_MS : 0,
      revalidateOnFocus: live,
    },
  );
  const matches = useSWR(
    address ? (["player-matches", cluster, address] as const) : null,
    async () => getPlayerMatches(await fetchMatches(client.rpc), address!),
    {
      refreshInterval: live ? REFRESH_INTERVAL_MS : 0,
      revalidateOnFocus: live,
    },
  );

  useEffect(() => {
    if (!live || !address) return;
    const abortController = new AbortController();

    const subscribe = async () => {
      const [playerAddress] = await findPlayerPda({ payer: address });
      try {
        const notifications = await client.rpcSubscriptions
          .accountNotifications(playerAddress, { commitment: "confirmed" })
          .subscribe({ abortSignal: abortController.signal });
        for await (const notification of notifications) {
          void notification;
          await mutatePlayer();
        }
      } catch {
        // Focus revalidation and polling keep the account current if WebSockets fail.
      }
    };

    void subscribe();
    return () => abortController.abort();
  }, [address, client, live, mutatePlayer]);

  const confirmed = hydrated ? loadConfirmedDiscovery() : null;
  const pending = !hydrated || !address ? null : loadPendingIdentification();
  const optimistic = confirmed?.wallet === address ? confirmed : null;
  const cards =
    catalogue.data && discoveries.data
      ? buildCollectionCards(catalogue.data, discoveries.data, optimistic)
      : [];
  const playerProgress = player.data?.exists
    ? calculatePlayerProgress(player.data.data.xp)
    : null;
  const activeQuest =
    quests.data && questCompletions.data
      ? getActiveQuest(quests.data, questCompletions.data)
      : null;
  const activeQuestProgress =
    activeQuest && creatures.data && matches.data && address
      ? calculateQuestProgress(
          activeQuest,
          creatures.data,
          matches.data,
          address,
        )
      : null;

  const refresh = useCallback(async () => {
    await Promise.all([
      player.mutate(),
      discoveries.mutate(),
      creatures.mutate(),
      quests.mutate(),
      questCompletions.mutate(),
      matches.mutate(),
      catalogue.mutate(),
    ]);
  }, [
    catalogue,
    creatures,
    discoveries,
    matches,
    player,
    questCompletions,
    quests,
  ]);

  return {
    address,
    status,
    catalogue,
    player,
    discoveries,
    creatures,
    quests,
    questCompletions,
    matches,
    activeQuest,
    activeQuestProgress,
    completedQuestCount: questCompletions.data
      ? getCompletedQuestCount(questCompletions.data)
      : 0,
    cards,
    playerProgress,
    pending: pending?.wallet === address ? pending : null,
    isLoading:
      status === "connected" &&
      (catalogue.isLoading || player.isLoading || creatures.isLoading),
    error: catalogue.error ?? player.error ?? creatures.error,
    refresh,
  };
}
