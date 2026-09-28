"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import useSWR from "swr";
import {
  fetchMaybePlayer,
  fetchAllMaybeQuest,
  fetchAllMaybeQuestCompletion,
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
import { fetchPlayerMatches } from "../matches";
import { useSolanaClient } from "../solana-client-context";
import { useWallet } from "../wallet/context";

const REFRESH_INTERVAL_MS = 30_000;
const subscribeToHydration = () => () => undefined;

export type GameDataOptions = {
  catalogue?: boolean;
  player?: boolean;
  discoveries?: boolean;
  creatures?: boolean;
  quests?: boolean;
  matches?: boolean;
};

const ALL_GAME_DATA: Required<GameDataOptions> = {
  catalogue: true,
  player: true,
  discoveries: true,
  creatures: true,
  quests: true,
  matches: true,
};
const NO_GAME_DATA: Required<GameDataOptions> = {
  catalogue: false,
  player: false,
  discoveries: false,
  creatures: false,
  quests: false,
  matches: false,
};

export function useGameData(options: GameDataOptions = ALL_GAME_DATA) {
  const enabled =
    options === ALL_GAME_DATA ? ALL_GAME_DATA : { ...NO_GAME_DATA, ...options };
  const client = useSolanaClient();
  const { cluster } = useCluster();
  const { wallet, status } = useWallet();
  const address = wallet?.account.address;
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  const catalogue = useSWR(
    enabled.catalogue ? ["species-catalogue", cluster] : null,
    fetchCatalogue,
    { revalidateOnFocus: true },
  );
  const player = useSWR(
    enabled.player && address ? (["player", cluster, address] as const) : null,
    async () => {
      const [playerAddress] = await findPlayerPda({ payer: address! });
      return fetchMaybePlayer(client.rpc, playerAddress, {
        commitment: "confirmed",
      });
    },
    { refreshInterval: REFRESH_INTERVAL_MS, revalidateOnFocus: true },
  );
  const discoveries = useSWR(
    enabled.discoveries && address
      ? (["player-discoveries", cluster, address] as const)
      : null,
    () => fetchPlayerDiscoveries(client.rpc, address!),
    { refreshInterval: REFRESH_INTERVAL_MS, revalidateOnFocus: true },
  );
  const creatures = useSWR(
    enabled.creatures && address
      ? (["owned-creatures", cluster, address] as const)
      : null,
    () => fetchOwnedCreatures(client.rpc, address!),
    { refreshInterval: REFRESH_INTERVAL_MS, revalidateOnFocus: true },
  );
  const quests = useSWR(
    enabled.quests ? ["quests", cluster] : null,
    async () => {
      const addresses = await Promise.all(
        QUEST_IDS.map(async (questId) => (await findQuestPda({ questId }))[0]),
      );
      const accounts = await fetchAllMaybeQuest(client.rpc, addresses, {
        commitment: "confirmed",
      });
      return accounts.filter((account) => account.exists);
    },
    { refreshInterval: REFRESH_INTERVAL_MS, revalidateOnFocus: true },
  );
  const questCompletions = useSWR(
    address && quests.data
      ? (["quest-completions", cluster, address] as const)
      : null,
    async () => {
      const addresses = await Promise.all(
        quests.data!.map(
          async (quest) =>
            (
              await findQuestCompletionPda({
                quest: quest.address,
                payer: address!,
              })
            )[0],
        ),
      );
      const accounts = await fetchAllMaybeQuestCompletion(
        client.rpc,
        addresses,
        { commitment: "confirmed" },
      );
      return accounts.filter((account) => account.exists);
    },
    { refreshInterval: REFRESH_INTERVAL_MS, revalidateOnFocus: true },
  );
  const matches = useSWR(
    enabled.matches && address
      ? (["player-matches", cluster, address] as const)
      : null,
    async () => fetchPlayerMatches(client.rpc, address!),
    { refreshInterval: REFRESH_INTERVAL_MS, revalidateOnFocus: true },
  );

  useEffect(() => {
    if (!enabled.player || !address) return;
    const abortController = new AbortController();

    const subscribe = async () => {
      const [playerAddress] = await findPlayerPda({ payer: address });
      try {
        const notifications = await client.rpcSubscriptions
          .accountNotifications(playerAddress, { commitment: "confirmed" })
          .subscribe({ abortSignal: abortController.signal });
        for await (const notification of notifications) {
          void notification;
          await player.mutate();
        }
      } catch {
        // Focus revalidation and polling keep the account current if WebSockets fail.
      }
    };

    void subscribe();
    return () => abortController.abort();
  }, [address, client, enabled.player, player]);

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
      ((enabled.catalogue && catalogue.isLoading) ||
        (enabled.player && player.isLoading) ||
        (enabled.discoveries && discoveries.isLoading) ||
        (enabled.creatures && creatures.isLoading) ||
        (enabled.quests && quests.isLoading) ||
        (enabled.matches && matches.isLoading)),
    error:
      catalogue.error ??
      player.error ??
      discoveries.error ??
      creatures.error ??
      quests.error ??
      questCompletions.error ??
      matches.error,
    refresh,
  };
}
