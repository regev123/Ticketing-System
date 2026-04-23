import type { EventCategory } from '@/types/api';
import type { CreateShowFormErrors } from '@/pages/admin/createShow/types';

export type ValidateUpdateShowInput = {
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
};

export type { CreateShowFormErrors };
