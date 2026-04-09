/**
 * Pure helpers for the home "Refine" panel (badge counts, summary chips, tab flags).
 * Separates domain logic from React components (SRP, testable).
 */

import type { ShowFilterTabId } from '@/config/showFilterTabs';
import type { ShowBrowseFilterState } from '@/utils/showBrowseFilters';
import {
  hasActiveCategoryFilters,
  hasActivePriceOrInventoryFilters,
} from '@/utils/showBrowseFilters';
import { hasActiveDateTimeFilters } from '@/utils/showDateTimeFilters';
import { hasActiveLocationFilters } from '@/utils/showLocationFilters';

export type RefineSummaryChip = { id: ShowFilterTabId; label: string };

export type RefineTabActiveFlags = Record<ShowFilterTabId, boolean>;

export function getRefineTabActiveFlags(browse: ShowBrowseFilterState): RefineTabActiveFlags {
  return {
    datetime: hasActiveDateTimeFilters(browse.dateTime),
    location: hasActiveLocationFilters(browse.location),
    category: hasActiveCategoryFilters(browse.categories),
    price: hasActivePriceOrInventoryFilters(browse),
  };
}

/** How many refine groups (date / location / category / price) have at least one active constraint. */
export function countRefineGroupsActive(browse: ShowBrowseFilterState): number {
  const f = getRefineTabActiveFlags(browse);
  return (Object.keys(f) as ShowFilterTabId[]).filter((k) => f[k]).length;
}

export function buildRefineSummaryChips(browse: ShowBrowseFilterState): RefineSummaryChip[] {
  const chips: RefineSummaryChip[] = [];
  if (hasActiveDateTimeFilters(browse.dateTime)) {
    chips.push({ id: 'datetime', label: 'Date & time' });
  }
  if (hasActiveLocationFilters(browse.location)) {
    chips.push({ id: 'location', label: 'Location' });
  }
  if (hasActiveCategoryFilters(browse.categories)) {
    const n = browse.categories.length;
    chips.push({ id: 'category', label: n === 1 ? '1 category' : `${n} categories` });
  }
  if (hasActivePriceOrInventoryFilters(browse)) {
    chips.push({ id: 'price', label: 'Price & tickets' });
  }
  return chips;
}
