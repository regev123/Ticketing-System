import { useState } from 'react';
import type { GeoLocation } from '@/types/api';
import {
  formatAddress,
  pickCity,
  pickCountry,
  type NominatimResult,
} from '@/lib/nominatim';
import { useNominatimSearch } from '@/hooks/useNominatimSearch';
import { FORM_INPUT } from './formStyles';

type PickedLocation = {
  venueName: string;
  address: string;
  city: string;
  country: string;
  geo: GeoLocation;
};

type Props = {
  id?: string;
  label?: string;
  placeholder?: string;
  onPick: (place: PickedLocation) => void;
};

export function PlaceSearch({ id = 'place-search', label = 'Search location', placeholder, onPick }: Props) {
  const [query, setQuery] = useState('');
  const { loading, error, results, canSearch, resetResults } = useNominatimSearch(query);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <input
        id={id}
        className={FORM_INPUT}
        value={query}
        placeholder={placeholder ?? 'Type a place name...'}
        onChange={(e) => setQuery(e.target.value)}
      />

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      {canSearch ? (
        <div className="relative">
          {loading ? <p className="text-xs text-slate-500">Searching...</p> : null}
          {results.length > 0 ? (
            <ul className="mt-2 max-h-64 overflow-y-auto rounded-2xl border border-violet-100/90 bg-white p-1.5 shadow-[0_12px_48px_-8px_rgba(91,33,182,0.18),0_4px_16px_-4px_rgba(15,23,42,0.1)] ring-1 ring-violet-200/40 backdrop-blur-md">
              {results.map((r: NominatimResult) => {
                const picked: PickedLocation = {
                  venueName: (r.name ?? r.display_name).split(',')[0] ?? r.display_name,
                  address: formatAddress(r.address, r.display_name),
                  city: pickCity(r.address, (r.display_name.split(',')[1] ?? 'Unknown').trim()),
                  country: pickCountry(
                    r.address,
                    (r.display_name.split(',').pop() ?? 'Unknown').trim()
                  ),
                  geo: { lat: Number(r.lat), lng: Number(r.lon) },
                };
                const title = (r.name ?? r.display_name).split(',')[0] ?? r.display_name;
                const meta = `${picked.city ? `${picked.city}, ` : ''}${picked.country || '—'}`;

                return (
                  <li key={r.place_id} className="mb-1 last:mb-0">
                    <button
                      type="button"
                      className="w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-violet-400/50"
                      onClick={() => {
                        onPick(picked);
                        resetResults();
                      }}
                    >
                      <div className="truncate font-semibold text-slate-900">{title}</div>
                      <div className="truncate text-xs text-slate-500">{meta}</div>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : !loading && query.trim() ? (
            <p className="mt-2 text-xs text-slate-500">No results.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
