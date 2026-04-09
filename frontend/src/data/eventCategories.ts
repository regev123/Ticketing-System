import type { EventCategory } from '@/types/api';

export type EventCategoryOption = {
  value: EventCategory;
  label: string;
};

export const EVENT_CATEGORY_OPTIONS: EventCategoryOption[] = [
  { value: 'music', label: 'Music event' },
  { value: 'sports', label: 'Sports event' },
  { value: 'live', label: 'Live event' },
  { value: 'standup', label: 'Stand-up comedy' },
  { value: 'theater', label: 'Theater' },
  { value: 'comedy', label: 'Comedy show' },
  { value: 'festival', label: 'Festival' },
  { value: 'conference', label: 'Conference' },
  { value: 'expo', label: 'Expo / Exhibition' },
  { value: 'family', label: 'Family event' },
  { value: 'kids', label: 'Kids event' },
  { value: 'dance', label: 'Dance performance' },
  { value: 'opera', label: 'Opera' },
  { value: 'classical', label: 'Classical music' },
  { value: 'electronic', label: 'Electronic music' },
  { value: 'hiphop', label: 'Hip-hop / Rap' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'rock', label: 'Rock' },
  { value: 'pop', label: 'Pop' },
  { value: 'cinema', label: 'Cinema / Screening' },
  { value: 'gaming', label: 'Gaming event' },
  { value: 'esports', label: 'Esports tournament' },
  { value: 'other', label: 'Other' },
];

const EVENT_CATEGORY_LABELS = new Map<EventCategory, string>(
  EVENT_CATEGORY_OPTIONS.map((option) => [option.value, option.label])
);

export function getEventCategoryLabel(category: EventCategory | null | undefined): string {
  if (!category) return 'Live event';
  return EVENT_CATEGORY_LABELS.get(category) ?? 'Live event';
}
