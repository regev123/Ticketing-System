import type { CreateShowRequest, EventCategory, SectionInput } from '@/types/api';
import { buildSharedCreatePayload } from '@/pages/admin/showEditor/buildSharedShowPayload';

export type BuildCreateShowPayloadInput = {
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
  sections: SectionInput[];
};

export function buildCreateShowPayload(input: BuildCreateShowPayloadInput): CreateShowRequest {
  return buildSharedCreatePayload(input);
}
