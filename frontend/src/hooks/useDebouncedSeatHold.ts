/**
 * Optimistic seat selection with debounced batch /hold and /release (no API per click).
 * Re-hydrates from GET /my-hold when returning to a show with an active hold.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { reservationsApi } from '@/api/reservations';
import { queryKeys } from '@/config/queryKeys';
import type { HoldResponse } from '@/types/api';

const DEBOUNCE_MS = 400;

export function useDebouncedSeatHold(showId: string | undefined, enabled = true) {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [serverSynced, setServerSynced] = useState<Set<string>>(new Set());
  const [holdId, setHoldId] = useState<string | null>(null);
  const [lastHold, setLastHold] = useState<HoldResponse | null>(null);
  const lastHoldRef = useRef<HoldResponse | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const selectedRef = useRef(selectedIds);
  const serverSyncedRef = useRef(serverSynced);
  const holdIdRef = useRef<string | null>(null);
  /** Browser `setTimeout` id (numeric); avoid `NodeJS.Timeout` from `@types/node` clashing with DOM typings. */
  const timerRef = useRef<number | null>(null);
  const syncGen = useRef(0);
  /** One hydration pass per (showId) while enabled, so login → logout → login re-fetches correctly. */
  const hydratedForShowIdRef = useRef<string | null>(null);

  selectedRef.current = selectedIds;
  serverSyncedRef.current = serverSynced;
  holdIdRef.current = holdId;

  const { data: myHoldData, isFetched: myHoldIsFetched } = useQuery({
    queryKey: queryKeys.myActiveHold(showId),
    queryFn: async () => {
      const h = await reservationsApi.getMyActiveHold(showId!);
      return h ?? null;
    },
    enabled: Boolean(showId && enabled),
    staleTime: 0,
  });

  useEffect(() => {
    hydratedForShowIdRef.current = null;
  }, [showId]);

  useEffect(() => {
    if (!enabled) {
      hydratedForShowIdRef.current = null;
    }
  }, [enabled]);

  useEffect(() => {
    if (!showId || !enabled || !myHoldIsFetched) return;
    if (hydratedForShowIdRef.current === showId) return;
    hydratedForShowIdRef.current = showId;

    if (myHoldData && myHoldData.showId === showId && (myHoldData.seatIds?.length ?? 0) > 0) {
      const ids = new Set(myHoldData.seatIds);
      setSelectedIds(ids);
      selectedRef.current = ids;
      setServerSynced(ids);
      serverSyncedRef.current = ids;
      setHoldId(myHoldData.holdId);
      holdIdRef.current = myHoldData.holdId;
      setLastHold(myHoldData);
      lastHoldRef.current = myHoldData;
    }
  }, [showId, enabled, myHoldIsFetched, myHoldData]);

  const runSync = useCallback(async () => {
    if (!showId || !enabled) return;
    const gen = ++syncGen.current;
    let selected = new Set(selectedRef.current);
    let synced = new Set(serverSyncedRef.current);
    const toRelease = [...synced].filter((id) => !selected.has(id));
    let toHold = [...selected].filter((id) => !synced.has(id));
    if (toRelease.length === 0 && toHold.length === 0) return;

    setSyncing(true);
    setHint(null);
    try {
      let hid = holdIdRef.current;

      if (toRelease.length > 0) {
        if (!hid) {
          setSyncing(false);
          return;
        }
        await reservationsApi.batchRelease({
          holdId: hid,
          showId,
          seats: toRelease,
        });
        toRelease.forEach((id) => synced.delete(id));
        serverSyncedRef.current = new Set(synced);
        setServerSynced(new Set(synced));
        if (synced.size === 0) {
          hid = null;
          setHoldId(null);
          setLastHold(null);
          lastHoldRef.current = null;
          holdIdRef.current = null;
        }
      }

      if (gen !== syncGen.current) return;

      selected = new Set(selectedRef.current);
      synced = new Set(serverSyncedRef.current);
      toHold = [...selected].filter((id) => !synced.has(id));

      if (toHold.length > 0) {
        const res = await reservationsApi.batchHold({
          showId,
          seats: toHold,
          holdId: hid ?? undefined,
        });
        if (gen !== syncGen.current) return;

        const bad = new Set(res.failed);
        if (bad.size > 0) {
          setSelectedIds((prev) => {
            const n = new Set(prev);
            bad.forEach((id) => n.delete(id));
            selectedRef.current = n;
            return n;
          });
          setHint('Some seats were just taken by someone else.');
        }

        res.success.forEach((id) => synced.add(id));
        serverSyncedRef.current = new Set(synced);
        setServerSynced(new Set(synced));

        if (res.hold) {
          setHoldId(res.hold.holdId);
          holdIdRef.current = res.hold.holdId;
          lastHoldRef.current = res.hold;
          setLastHold(res.hold);
        }
      }

      await queryClient.invalidateQueries({ queryKey: queryKeys.availabilityAll });
      await queryClient.invalidateQueries({ queryKey: queryKeys.myActiveHold(showId) });
    } catch (e) {
      if (gen === syncGen.current) {
        setHint(e instanceof Error ? e.message : 'Sync failed');
      }
    } finally {
      if (gen === syncGen.current) setSyncing(false);
    }
  }, [showId, enabled, queryClient]);

  useEffect(() => {
    if (!showId || !enabled) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      void runSync();
    }, DEBOUNCE_MS);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [showId, enabled, selectedIds, runSync]);

  useEffect(() => {
    if (enabled) return;
    syncGen.current++;
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setSelectedIds(new Set());
    selectedRef.current = new Set();
    setServerSynced(new Set());
    serverSyncedRef.current = new Set();
    setHoldId(null);
    holdIdRef.current = null;
    setLastHold(null);
    lastHoldRef.current = null;
    setSyncing(false);
    setHint(null);
  }, [enabled]);

  const toggleSeat = useCallback((seatId: string) => {
    if (!enabledRef.current) return;
    setHint(null);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(seatId)) next.delete(seatId);
      else next.add(seatId);
      selectedRef.current = next;
      return next;
    });
  }, []);

  const flush = useCallback(async (): Promise<HoldResponse | null> => {
    if (!enabledRef.current) return null;
    syncGen.current++;
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    await runSync();
    return lastHoldRef.current;
  }, [runSync]);

  return {
    selectedIds,
    toggleSeat,
    serverSynced,
    holdId,
    lastHold,
    syncing,
    hint,
    flush,
  };
}
