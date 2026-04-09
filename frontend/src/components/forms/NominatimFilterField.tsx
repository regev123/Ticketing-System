import { useEffect, useId, useMemo, useRef } from 'react';
import { useNominatimSearch } from '@/hooks/useNominatimSearch';
import {
  nominatimResultMatchesCity,
  pickCity,
  venueNameFromResult,
  type NominatimFeatureType,
  type NominatimResult,
} from '@/lib/nominatim';
import { FORM_INPUT } from './formStyles';

type Mode = 'city' | 'venue';

type Props = {
  id?: string;
  label: string;
  hint: string;
  value: string;
  onChange: (next: string) => void;
  mode: Mode;
  placeholder?: string;
  /** When set (venue mode), search is biased to this city and results are narrowed to it. */
  cityContext?: string;
  /** If set, called when the user picks a city from the list (clears venue in parent). */
  onCityPick?: (r: NominatimResult) => void;
  /** If set, called when the user picks a venue from the list (fills city in parent). */
  onVenuePick?: (r: NominatimResult) => void;
};

function mapPick(mode: Mode, r: NominatimResult): string {
  if (mode === 'city') {
    const fallback = (r.display_name.split(',')[0] ?? r.display_name).trim();
    return pickCity(r.address, fallback);
  }
  return venueNameFromResult(r);
}

function suggestionMeta(mode: Mode, r: NominatimResult): string {
  if (mode === 'city') {
    const country = r.address?.country ?? (r.display_name.split(',').pop() ?? '').trim();
    return country || r.display_name;
  }
  const city = pickCity(r.address, '');
  const country = r.address?.country ?? '';
  return [city, country].filter(Boolean).join(', ') || r.display_name;
}

function featureTypeForMode(mode: Mode): NominatimFeatureType | undefined {
  return mode === 'city' ? 'city' : undefined;
}

export function NominatimFilterField({
  id: propId,
  label,
  hint,
  value,
  onChange,
  mode,
  placeholder,
  cityContext,
  onCityPick,
  onVenuePick,
}: Props) {
  const autoId = useId();
  const id = propId ?? `nominatim-filter-${autoId}`;
  const listId = `${id}-listbox`;

  const rawInput = value.trim();
  const biasedQuery =
    mode === 'venue' && cityContext?.trim()
      ? `${rawInput}, ${cityContext.trim()}`
      : rawInput;

  const { loading, error, results, canSearch, resetResults } = useNominatimSearch(biasedQuery, {
    featureType: featureTypeForMode(mode),
    minLengthSource: mode === 'venue' ? value : biasedQuery,
  });

  const displayResults = useMemo(() => {
    if (mode !== 'venue' || !cityContext?.trim()) return results;
    return results.filter((r) => nominatimResultMatchesCity(r, cityContext));
  }, [results, mode, cityContext]);

  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (!el?.contains(e.target as Node)) {
        resetResults();
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [resetResults]);

  const handlePick = (r: NominatimResult) => {
    if (mode === 'city' && onCityPick) {
      onCityPick(r);
    } else if (mode === 'venue' && onVenuePick) {
      onVenuePick(r);
    } else {
      onChange(mapPick(mode, r));
    }
    resetResults();
  };

  const showList = Boolean(canSearch && (loading || displayResults.length > 0 || error));
  const showNoMatches =
    canSearch &&
    !loading &&
    rawInput.length >= 3 &&
    results.length > 0 &&
    displayResults.length === 0 &&
    mode === 'venue' &&
    Boolean(cityContext?.trim());

  return (
    <div ref={wrapRef} className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <input
        id={id}
        type="search"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={showList ? listId : undefined}
        autoComplete={mode === 'city' ? 'address-level2' : 'off'}
        className={FORM_INPUT}
        value={value}
        placeholder={placeholder ?? (mode === 'city' ? 'Type to search cities…' : 'Type to search venues…')}
        onChange={(e) => onChange(e.target.value)}
      />

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      {canSearch ? (
        <div className="relative">
          {loading ? <p className="text-xs text-slate-500">Searching…</p> : null}
          {displayResults.length > 0 ? (
            <ul
              id={listId}
              role="listbox"
              className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-2xl border border-violet-100/90 bg-white p-1.5 shadow-[0_12px_48px_-8px_rgba(91,33,182,0.18),0_4px_16px_-4px_rgba(15,23,42,0.1)] ring-1 ring-violet-200/40 backdrop-blur-md"
            >
              {displayResults.map((r) => {
                const primary = mode === 'city' ? mapPick('city', r) : mapPick('venue', r);
                const meta = suggestionMeta(mode, r);
                return (
                  <li key={r.place_id} role="option" className="mb-1 last:mb-0">
                    <button
                      type="button"
                      className="w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-violet-400/50"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handlePick(r)}
                    >
                      <div className="truncate font-semibold text-slate-900">{primary}</div>
                      <div className="truncate text-xs text-slate-500">{meta}</div>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
          {showNoMatches ? (
            <p className="mt-1 text-xs text-amber-700">
              No venues in “{cityContext?.trim()}” matched — try another search or widen the city.
            </p>
          ) : null}
          {!loading && rawInput.length >= 3 && results.length === 0 && !error ? (
            <p className="mt-1 text-xs text-slate-500">No results.</p>
          ) : null}
        </div>
      ) : null}

      <p className="text-xs text-slate-400">{hint}</p>
    </div>
  );
}
