"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import useSWR from "swr";
import {
  fetchMaybePlayer,
  fetchMaybeQuest,
  fetchMaybeQuestCompletion,
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
  DEMO_QUEST_ID,
  getQuestTargets,
  getUniqueDiscoveryCount,
} from "../game";
import { useSolanaClient } from "../solana-client-context";
import { useWallet } from "../wallet/context";

const REFRESH_INTERVAL_MS = 30_000;
const subscribeToHydration = () => () => undefined;

export function useGameData() {
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
    { refreshInterval: REFRESH_INTERVAL_MS, revalidateOnFocus: true },
  );
  const discoveries = useSWR(
    address ? (["player-discoveries", cluster, address] as const) : null,
    () => fetchPlayerDiscoveries(client.rpc, address!),
    { refreshInterval: REFRESH_INTERVAL_MS, revalidateOnFocus: true },
  );
  const creatures = useSWR(
    address ? (["owned-creatures", cluster, address] as const) : null,
    () => fetchOwnedCreatures(client.rpc, address!),
    { refreshInterval: REFRESH_INTERVAL_MS, revalidateOnFocus: true },
  );
  const quest = useSWR(
    ["quest", cluster, DEMO_QUEST_ID.toString()],
    async () => {
      const [questAddress] = await findQuestPda({ questId: DEMO_QUEST_ID });
      return fetchMaybeQuest(client.rpc, questAddress, {
        commitment: "confirmed",
      });
    },
    { refreshInterval: REFRESH_INTERVAL_MS, revalidateOnFocus: true },
  );
  const questCompletion = useSWR(
    address && quest.data?.exists
      ? (["quest-completion", cluster, address, quest.data.address] as const)
      : null,
    async () => {
      const [completionAddress] = await findQuestCompletionPda({
        quest: quest.data!.address,
        payer: address!,
      });
      return fetchMaybeQuestCompletion(client.rpc, completionAddress, {
        commitment: "confirmed",
      });
    },
    { refreshInterval: REFRESH_INTERVAL_MS, revalidateOnFocus: true },
  );

  useEffect(() => {
    if (!address) return;
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
  }, [address, client, player]);

  const confirmed = hydrated ? loadConfirmedDiscovery() : null;
  const pending = !hydrated || !address ? null : loadPendingIdentification();
  const optimistic = confirmed?.wallet === address ? confirmed : null;
  const cards =
    catalogue.data && discoveries.data
      ? buildCollectionCards(catalogue.data, discoveries.data, optimistic)
      : [];
  const questTargets = quest.data?.exists
    ? getQuestTargets(quest.data.data.targets, cards)
    : [];
  const playerProgress = player.data?.exists
    ? calculatePlayerProgress(player.data.data.xp)
    : null;

  const refresh = useCallback(async () => {
    await Promise.all([
      player.mutate(),
      discoveries.mutate(),
      creatures.mutate(),
      quest.mutate(),
      questCompletion.mutate(),
      catalogue.mutate(),
    ]);
  }, [catalogue, creatures, discoveries, player, quest, questCompletion]);

  return {
    address,
    status,
    catalogue,
    player,
    discoveries,
    creatures,
    quest,
    questCompletion,
    cards,
    questTargets,
    playerProgress,
    pending: pending?.wallet === address ? pending : null,
    uniqueDiscoveryCount: discoveries.data
      ? getUniqueDiscoveryCount(discoveries.data)
      : 0,
    isLoading:
      status === "connected" &&
      (catalogue.isLoading ||
        player.isLoading ||
        discoveries.isLoading ||
        creatures.isLoading),
    error:
      catalogue.error ?? player.error ?? discoveries.error ?? creatures.error,
    refresh,
  };
}
