import type { EventCategory, SectionInput } from '@/types/api';

export type SectionFieldKey = 'section' | 'rowCount' | 'seatsPerRow' | 'price' | 'currency';

export type SectionErrors = Partial<Record<SectionFieldKey, string>>;

export type CreateShowFormErrors = {
  title?: string;
  description?: string;
  doorsOpenTime?: string;
  startTime?: string;
  endTime?: string;
  venueName?: string;
  city?: string;
  country?: string;
  address?: string;
  geoLat?: string;
  geoLng?: string;
  coverImageUrl?: string;
};

export type ValidateCreateShowInput = {
  title: string;
  category: EventCategory;
  description: string;
  doorsOpenTime: string;
  startTime: string;
  endTime: string;
  venueName: string;
  city: string;
  country: string;
  address: string;
  geoLat: string;
  geoLng: string;
  coverUrl: string;
  sections: SectionInput[];
};

export type PickedPlace = {
  venueName: string;
  address: string;
  city: string;
  country: string;
  geo: { lat: number; lng: number };
};
