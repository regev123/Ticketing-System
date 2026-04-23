import type { EventCategory, UpdateShowRequest } from '@/types/api';
import { buildSharedUpdatePayload } from '@/pages/admin/showEditor/buildSharedShowPayload';

export type BuildUpdateShowPayloadInput = {
  title: string;
  category: EventCategory;
  description: string;
  venueName: string;
  city: string;
  country: string;
  address: string;
  geoLat: string;
  geoLng: string;
  startTime: string;
  endTime: string;
  doorsOpenTime: string;
  coverUrl: string;
};

export function buildUpdateShowPayload(input: BuildUpdateShowPayloadInput): UpdateShowRequest {
  return buildSharedUpdatePayload(input);
}
