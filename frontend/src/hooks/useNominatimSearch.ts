import { useCallback, useEffect, useRef, useState } from 'react';
import { buildNominatimSearchUrl, type NominatimFeatureType, type NominatimResult } from '@/lib/nominatim';

const DEBOUNCE_MS = 400;

export function useNominatimSearch(
  query: string,
  options?: { featureType?: NominatimFeatureType; /** Min-length check uses this string (e.g. raw venue input while query is biased). */ minLengthSource?: string }
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const requestIdRef = useRef(0);

  const trimmed = query.trim();
  const gate = (options?.minLengthSource ?? query).trim();
  const canSearch = gate.length >= 3;
  const featureType = options?.featureType;

  const resetResults = useCallback(() => {
    setResults([]);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!canSearch) {
      resetResults();
      return;
    }

    const reqId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    const t = window.setTimeout(async () => {
      try {
        const url = buildNominatimSearchUrl(trimmed, { featureType });
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept-Language': 'en',
          },
        });
        if (!res.ok) throw new Error(`Search failed (${res.status})`);
        const json = (await res.json()) as NominatimResult[];
        if (requestIdRef.current !== reqId) return;
        setResults(json);
      } catch (e) {
        if (requestIdRef.current !== reqId) return;
        setError(e instanceof Error ? e.message : 'Search failed');
      } finally {
        if (requestIdRef.current === reqId) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(t);
  }, [canSearch, trimmed, featureType, resetResults]);

  return {
    loading,
    error,
    results,
    canSearch,
    resetResults,
  };
}
