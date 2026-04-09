/**
 * Home page filter tabs — keep in sync with panels in ShowFiltersPanel.
 */
export type ShowFilterTabId = 'datetime' | 'location' | 'category' | 'price';

export const SHOW_FILTER_TABS: { id: ShowFilterTabId; label: string; description: string }[] = [
  { id: 'datetime', label: 'Date & time', description: 'Day range and time of day' },
  { id: 'location', label: 'Location', description: 'City, venue, and distance from you' },
  { id: 'category', label: 'Category', description: 'Event types' },
  { id: 'price', label: 'Price & tickets', description: 'Price range and catalog inventory' },
];
