/**
 * Shared Nominatim (OpenStreetMap) types and helpers for PlaceSearch and location filters.
 */

export type NominatimAddress = {
  road?: string;
  house_number?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  hamlet?: string;
  county?: string;
  country?: string;
};

export type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
  address?: NominatimAddress;
};

export type NominatimFeatureType = 'country' | 'state' | 'city' | 'settlement';

export function pickCity(address: NominatimAddress | undefined, fallback: string): string {
  return (
    address?.city ??
    address?.town ??
    address?.village ??
    address?.hamlet ??
    address?.county ??
    fallback
  );
}

export function pickCountry(address: NominatimAddress | undefined, fallback: string): string {
  return address?.country ?? fallback;
}

export function formatAddress(address: NominatimAddress | undefined, fallback: string): string {
  const road = address?.road ?? address?.suburb ?? '';
  const houseNumber = address?.house_number ?? '';
  const parts = [houseNumber, road].filter(Boolean);
  return parts.join(' ').trim() || fallback;
}

export function venueNameFromResult(r: NominatimResult): string {
  return (r.name ?? r.display_name).split(',')[0]?.trim() ?? r.display_name;
}

/** City/town label for filters and picks — same logic as city mode in NominatimFilterField. */
export function cityLabelFromNominatimResult(r: NominatimResult): string {
  const fallback = (r.display_name.split(',')[0] ?? r.display_name).trim();
  return pickCity(r.address, fallback);
}

/**
 * Whether a Nominatim result plausibly belongs to the chosen city (handles OSM naming differences).
 */
export function nominatimResultMatchesCity(r: NominatimResult, filterCity: string): boolean {
  const f = filterCity.trim().toLowerCase();
  if (!f) return true;
  const label = pickCity(r.address, '').trim().toLowerCase();
  const display = r.display_name.toLowerCase();
  if (!label) return display.includes(f);
  return label.includes(f) || f.includes(label) || display.includes(f);
}

export function buildNominatimSearchUrl(
  query: string,
  options?: { featureType?: NominatimFeatureType }
): string {
  const params = new URLSearchParams({
    format: 'json',
    addressdetails: '1',
    limit: '5',
    'accept-language': 'en',
    q: query.trim(),
  });
  if (options?.featureType) {
    params.set('featuretype', options.featureType);
  }
  return `https://nominatim.openstreetmap.org/search?${params.toString()}`;
}
