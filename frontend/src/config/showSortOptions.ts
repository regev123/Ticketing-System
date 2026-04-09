import type { ShowSortOption } from '@/utils/showBrowseFilters';

export const SHOW_SORT_OPTIONS: {
  value: ShowSortOption;
  label: string;
  triggerLabel: string;
}[] = [
  { value: 'date-asc', label: 'Start date — soonest first', triggerLabel: 'Date · soonest' },
  { value: 'date-desc', label: 'Start date — latest first', triggerLabel: 'Date · latest' },
  { value: 'price-asc', label: 'Price — lowest first (cheapest seat)', triggerLabel: 'Price · low → high' },
  { value: 'price-desc', label: 'Price — highest first', triggerLabel: 'Price · high → low' },
  { value: 'title-asc', label: 'Title — A to Z', triggerLabel: 'Title · A–Z' },
  { value: 'title-desc', label: 'Title — Z to A', triggerLabel: 'Title · Z–A' },
];
