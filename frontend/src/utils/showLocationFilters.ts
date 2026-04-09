/**
 * Client-side location filters for shows (#2: city, venue name, near me + radius).
 */

import type { Show } from '@/types/api';

export interface ShowLocationFilterState {
  /** Substring match on `venue.city` (case-insensitive). */
  city: string;
  /** Substring match on `venue.venueName` (case-insensitive). */
  venueQuery: string;
  /** When both set, keep shows whose venue is within `radiusKm` of this point. */
  nearMeLat: number | null;
  nearMeLng: number | null;
  radiusKm: number;
}

export const defaultShowLocationFilterState = (): ShowLocationFilterState => ({
  city: '',
  venueQuery: '',
  nearMeLat: null,
  nearMeLng: null,
  radiusKm: 50,
});

const EARTH_RADIUS_KM = 6371;

/** Haversine distance in kilometers. */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function filterShowsByLocation(shows: Show[], state: ShowLocationFilterState): Show[] {
  const cityQ = state.city.trim().toLowerCase();
  const venueQ = state.venueQuery.trim().toLowerCase();
  const useNearMe =
    state.nearMeLat != null &&
    state.nearMeLng != null &&
    Number.isFinite(state.nearMeLat) &&
    Number.isFinite(state.nearMeLng);
  const radius = Math.max(1, state.radiusKm);

  return shows.filter((show) => {
    const v = show.venue;
    if (!v) {
      return false;
    }

    if (cityQ && !v.city.toLowerCase().includes(cityQ)) {
      return false;
    }

    if (venueQ && !v.venueName.toLowerCase().includes(venueQ)) {
      return false;
    }

    if (useNearMe) {
      const geo = v.geo;
      if (!geo || typeof geo.lat !== 'number' || typeof geo.lng !== 'number') {
        return false;
      }
      const km = haversineKm(state.nearMeLat!, state.nearMeLng!, geo.lat, geo.lng);
      if (km > radius) {
        return false;
      }
    }

    return true;
  });
}

export function hasActiveLocationFilters(state: ShowLocationFilterState): boolean {
  const cityQ = state.city.trim();
  const venueQ = state.venueQuery.trim();
  const nearMe =
    state.nearMeLat != null &&
    state.nearMeLng != null &&
    Number.isFinite(state.nearMeLat) &&
    Number.isFinite(state.nearMeLng);
  return cityQ !== '' || venueQ !== '' || nearMe;
}
