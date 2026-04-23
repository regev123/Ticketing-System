import { useState } from 'react';
import { FormSelect, NominatimFilterField } from '@/components/forms';
import { FORM_SELECT_SM } from '@/components/forms/formStyles';
import { cityLabelFromNominatimResult, venueNameFromResult } from '@/lib/nominatim';
import {
  defaultShowLocationFilterState,
  hasActiveLocationFilters,
  type ShowLocationFilterState,
} from '@/utils/showLocationFilters';

type Props = {
  value: ShowLocationFilterState;
  onChange: (next: ShowLocationFilterState) => void;
  idPrefix?: string;
  /** When true, render inner fields only (no outer card or section clear — use inside ShowFiltersPanel). */
  embedded?: boolean;
};

const RADIUS_OPTIONS = [10, 25, 50, 100] as const;

const RADIUS_SELECT_OPTIONS = RADIUS_OPTIONS.map((km) => ({
  value: String(km),
  label: `${km} km`,
  triggerLabel: `Within ${km} km`,
}));

export function ShowLocationFilters({ value, onChange, idPrefix = 'loc-filter', embedded = false }: Props) {
  const active = hasActiveLocationFilters(value);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const nearMeOn =
    value.nearMeLat != null &&
    value.nearMeLng != null &&
    Number.isFinite(value.nearMeLat) &&
    Number.isFinite(value.nearMeLng);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Location is not supported in this browser.');
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({
          ...value,
          nearMeLat: pos.coords.latitude,
          nearMeLng: pos.coords.longitude,
        });
        setGeoLoading(false);
      },
      () => {
        setGeoError('Could not get your location. Check browser permissions.');
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 }
    );
  };

  const clearNearMe = () => {
    onChange({ ...value, nearMeLat: null, nearMeLng: null });
    setGeoError(null);
  };

  const grid = (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:items-start">
      <NominatimFilterField
        id={`${idPrefix}-city`}
        mode="city"
        label="City"
        placeholder="e.g. Tel Aviv"
        value={value.city}
        onChange={(city) => onChange({ ...value, city })}
        onCityPick={(r) =>
          onChange({
            ...value,
            city: cityLabelFromNominatimResult(r),
            venueQuery: '',
          })
        }
        hint="Pick a city to limit venue search, or type to match catalog"
      />
      <NominatimFilterField
        id={`${idPrefix}-venue`}
        mode="venue"
        label="Venue"
        placeholder="Type a venue or place..."
        value={value.venueQuery}
        onChange={(venueQuery) => onChange({ ...value, venueQuery })}
        cityContext={value.city}
        onVenuePick={(r) =>
          onChange({
            ...value,
            venueQuery: venueNameFromResult(r),
            city: cityLabelFromNominatimResult(r).trim() || value.city,
          })
        }
        hint={
          value.city.trim()
            ? 'Suggestions are limited to the city above; picking a venue fills the city if needed'
            : 'Pick a venue to set the city automatically, or choose a city first to narrow venues'
        }
      />

      <div className="space-y-1.5">
        <label
          id={`${idPrefix}-nearme-label`}
          htmlFor={nearMeOn ? `${idPrefix}-radius` : `${idPrefix}-nearme-action`}
          className="block text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          Near me
        </label>
        {!nearMeOn ? (
          <button
            id={`${idPrefix}-nearme-action`}
            type="button"
            onClick={requestLocation}
            disabled={geoLoading}
            className={`${FORM_SELECT_SM} flex h-[42px] w-full items-center justify-center gap-2 text-center font-medium transition hover:border-violet-300 hover:bg-violet-50/80 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {geoLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
                Locating...
              </>
            ) : (
              <>
                <svg className="h-4 w-4 shrink-0 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-4.5-7-11a7 7 0 1114 0c0 6.5-7 11-7 11z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                Use my location
              </>
            )}
          </button>
        ) : (
          <FormSelect
            id={`${idPrefix}-radius`}
            value={String(value.radiusKm)}
            options={RADIUS_SELECT_OPTIONS}
            onChange={(v) => onChange({ ...value, radiusKm: Number(v) || 50 })}
            ariaLabelledBy={`${idPrefix}-nearme-label`}
          />
        )}
        <p className="text-xs text-slate-400">
          {geoError ? (
            <span className="text-red-600">{geoError}</span>
          ) : nearMeOn ? (
            <>
              Showing events within the selected distance of your position.{' '}
              <button
                type="button"
                onClick={clearNearMe}
                className="font-medium text-violet-600 underline-offset-2 transition hover:text-violet-500 hover:underline"
              >
                Clear location
              </button>
            </>
          ) : (
            'Tap to use your browser location, then choose a search radius.'
          )}
        </p>
      </div>
    </div>
  );

  const footer =
    !embedded && active ? (
      <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => {
            onChange(defaultShowLocationFilterState());
            setGeoError(null);
          }}
          className="text-sm font-medium text-violet-600 underline-offset-2 transition hover:text-violet-500 hover:underline"
        >
          Clear location filters
        </button>
      </div>
    ) : null;

  if (embedded) {
    return (
      <div className="space-y-4" role="group" aria-label="Location filters">
        {grid}
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm sm:p-5"
      role="search"
      aria-label="Filter shows by location"
    >
      {grid}
      {footer}
    </div>
  );
}
