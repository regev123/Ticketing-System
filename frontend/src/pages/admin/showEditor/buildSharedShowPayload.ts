import type { CreateShowRequest, SectionInput, UpdateShowRequest } from '@/types/api';
import type { SharedShowEditorInput } from './sharedTypes';

type BuildSharedShowPayloadInput = SharedShowEditorInput & {
  sections?: SectionInput[];
};

type SharedPayloadFields = Omit<CreateShowRequest, 'sections'>;

function buildSharedFields(input: SharedShowEditorInput): SharedPayloadFields {
  const trimmedCover = input.coverUrl.trim();
  const trimmedDescription = input.description.trim();

  return {
    title: input.title.trim(),
    category: input.category,
    description: trimmedDescription ? trimmedDescription : undefined,
    venue: {
      venueName: input.venueName.trim(),
      city: input.city.trim(),
      country: input.country.trim(),
      address: input.address.trim(),
      geo: {
        lat: Number(input.geoLat.trim()),
        lng: Number(input.geoLng.trim()),
      },
    },
    startTime: new Date(input.startTime).toISOString(),
    endTime: new Date(input.endTime).toISOString(),
    doorsOpenTime: new Date(input.doorsOpenTime).toISOString(),
    ...(trimmedCover ? { coverImageUrl: trimmedCover } : {}),
  };
}

export function buildSharedCreatePayload(input: BuildSharedShowPayloadInput): CreateShowRequest {
  return {
    ...buildSharedFields(input),
    sections: input.sections ?? [],
  };
}

export function buildSharedUpdatePayload(input: BuildSharedShowPayloadInput): UpdateShowRequest {
  return buildSharedFields(input);
}
