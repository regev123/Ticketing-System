/**
 * Combined browse filters: category, price range, catalog inventory, text search, and sort.
 */

import type { EventCategory, Show } from '@/types/api';
import {
  defaultShowDateTimeFilterState,
  filterShowsByDateTime,
  hasActiveDateTimeFilters,
  type ShowDateTimeFilterState,
} from '@/utils/showDateTimeFilters';
import {
  defaultShowLocationFilterState,
  filterShowsByLocation,
  hasActiveLocationFilters,
  type ShowLocationFilterState,
} from '@/utils/showLocationFilters';

export type ShowSortOption =
  | 'date-asc'
  | 'date-desc'
  | 'price-asc'
  | 'price-desc'
  | 'title-asc'
  | 'title-desc';

export interface ShowBrowseFilterState {
  dateTime: ShowDateTimeFilterState;
  location: ShowLocationFilterState;
  /** Empty = any category. Otherwise show must match one of these. */
  categories: EventCategory[];
  /** Inclusive min price (same currency as listing; compared numerically). */
  priceMin: string;
  /** Inclusive max price. */
  priceMax: string;
  /** Minimum total seats in catalog (capacity floor). */
  minCatalogSeats: string;
  /** When true, hide shows with zero seats in the catalog. */
  excludeEmptyInventory: boolean;
  textQuery: string;
  sort: ShowSortOption;
}

export const defaultShowBrowseFilterState = (): ShowBrowseFilterState => ({
  dateTime: defaultShowDateTimeFilterState(),
  location: defaultShowLocationFilterState(),
  categories: [],
  priceMin: '',
  priceMax: '',
  minCatalogSeats: '',
  excludeEmptyInventory: false,
  textQuery: '',
  sort: 'date-asc',
});

export function hasActiveCategoryFilters(categories: EventCategory[]): boolean {
  return categories.length > 0;
}

export function hasActivePriceOrInventoryFilters(state: Pick<
  ShowBrowseFilterState,
  'priceMin' | 'priceMax' | 'minCatalogSeats' | 'excludeEmptyInventory'
>): boolean {
  return (
    state.priceMin.trim() !== '' ||
    state.priceMax.trim() !== '' ||
    state.minCatalogSeats.trim() !== '' ||
    state.excludeEmptyInventory
  );
}

export function hasActiveTextFilter(textQuery: string): boolean {
  return textQuery.trim() !== '';
}

export function hasNonDefaultSort(sort: ShowSortOption): boolean {
  return sort !== 'date-asc';
}

export function hasAnyBrowseFilterActive(state: ShowBrowseFilterState): boolean {
  const { dateTime, location, categories, textQuery, sort, ...rest } = state;
  return (
    hasActiveDateTimeFilters(dateTime) ||
    hasActiveLocationFilters(location) ||
    hasActiveCategoryFilters(categories) ||
    hasActivePriceOrInventoryFilters(rest) ||
    hasActiveTextFilter(textQuery) ||
    hasNonDefaultSort(sort)
  );
}

function seatPriceBounds(show: Show): { min: number; max: number } | null {
  if (!show.seats?.length) return null;
  const prices = show.seats.map((s) => s.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function filterShowsByCategory(shows: Show[], categories: EventCategory[]): Show[] {
  if (categories.length === 0) return shows;
  return shows.filter((show) => {
    const c = (show.category ?? 'live') as EventCategory;
    return categories.includes(c);
  });
}

export function filterShowsByPriceRange(shows: Show[], priceMin: string, priceMax: string): Show[] {
  const min = parseFloat(priceMin);
  const max = parseFloat(priceMax);
  const hasMin = priceMin.trim() !== '' && Number.isFinite(min);
  const hasMax = priceMax.trim() !== '' && Number.isFinite(max);
  if (!hasMin && !hasMax) return shows;

  return shows.filter((show) => {
    const b = seatPriceBounds(show);
    if (!b) return false;
    if (hasMin && b.max < min) return false;
    if (hasMax && b.min > max) return false;
    return true;
  });
}

export function filterShowsByCatalogInventory(
  shows: Show[],
  minCatalogSeats: string,
  excludeEmptyInventory: boolean
): Show[] {
  const minSeats = parseInt(minCatalogSeats, 10);
  const hasMinSeats = minCatalogSeats.trim() !== '' && Number.isFinite(minSeats) && minSeats > 0;

  return shows.filter((show) => {
    const n = show.seats?.length ?? 0;
    if (excludeEmptyInventory && n === 0) return false;
    if (hasMinSeats && n < minSeats) return false;
    return true;
  });
}

export function filterShowsByTextQuery(shows: Show[], q: string): Show[] {
  const t = q.trim().toLowerCase();
  if (!t) return shows;
  return shows.filter((show) => {
    const title = (show.title ?? '').toLowerCase();
    const desc = (show.description ?? '').toLowerCase();
    return title.includes(t) || desc.includes(t);
  });
}

function minSeatPrice(show: Show): number {
  if (!show.seats?.length) return Number.POSITIVE_INFINITY;
  return Math.min(...show.seats.map((s) => s.price));
}

export function sortShows(shows: Show[], sort: ShowSortOption): Show[] {
  const copy = [...shows];
  switch (sort) {
    case 'date-asc':
      return copy.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    case 'date-desc':
      return copy.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    case 'price-asc':
      return copy.sort((a, b) => minSeatPrice(a) - minSeatPrice(b));
    case 'price-desc':
      return copy.sort((a, b) => minSeatPrice(b) - minSeatPrice(a));
    case 'title-asc':
      return copy.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
    case 'title-desc':
      return copy.sort((a, b) => b.title.localeCompare(a.title, undefined, { sensitivity: 'base' }));
    default:
      return copy;
  }
}

export function applyShowBrowseFilters(shows: Show[], state: ShowBrowseFilterState): Show[] {
  let list = filterShowsByDateTime(shows, state.dateTime);
  list = filterShowsByLocation(list, state.location);
  list = filterShowsByCategory(list, state.categories);
  list = filterShowsByPriceRange(list, state.priceMin, state.priceMax);
  list = filterShowsByCatalogInventory(list, state.minCatalogSeats, state.excludeEmptyInventory);
  list = filterShowsByTextQuery(list, state.textQuery);
  return sortShows(list, state.sort);
}
