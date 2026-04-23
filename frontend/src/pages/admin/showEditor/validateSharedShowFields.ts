import {
  CREATE_SHOW_COVER_PATTERN,
  CREATE_SHOW_GEO_BOUNDS,
  CREATE_SHOW_VALIDATION_LIMITS as LIMITS,
  CREATE_SHOW_VALIDATION_MESSAGES as MSG,
} from '@/pages/admin/createShow/constants';
import type { CreateShowFormErrors } from '@/pages/admin/createShow/types';
import type { SharedShowEditorInput, SharedValidationResult } from './sharedTypes';

function parseInstant(isoOrLocal: string): Date | null {
  if (!isoOrLocal.trim()) return null;
  const d = new Date(isoOrLocal);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function validateSharedShowFields(input: SharedShowEditorInput): SharedValidationResult {
  const errors: CreateShowFormErrors = {};

  const title = input.title.trim();
  if (!title) errors.title = MSG.titleRequired;
  else if (title.length > LIMITS.titleMax) errors.title = MSG.titleTooLong(LIMITS.titleMax);

  const desc = input.description.trim();
  if (desc.length > LIMITS.descriptionMax) errors.description = MSG.descriptionTooLong(LIMITS.descriptionMax);

  const doors = parseInstant(input.doorsOpenTime);
  const start = parseInstant(input.startTime);
  const end = parseInstant(input.endTime);

  if (!input.doorsOpenTime.trim()) errors.doorsOpenTime = MSG.doorsRequired;
  else if (!doors) errors.doorsOpenTime = MSG.doorsInvalid;

  if (!input.startTime.trim()) errors.startTime = MSG.startRequired;
  else if (!start) errors.startTime = MSG.startInvalid;

  if (!input.endTime.trim()) errors.endTime = MSG.endRequired;
  else if (!end) errors.endTime = MSG.endInvalid;

  if (doors && start && end) {
    if (start.getTime() < doors.getTime()) errors.startTime = MSG.startBeforeDoors;
    if (end.getTime() <= start.getTime()) errors.endTime = MSG.endBeforeStart;
  }

  const vn = input.venueName.trim();
  const city = input.city.trim();
  const country = input.country.trim();
  const addr = input.address.trim();

  if (!vn) errors.venueName = MSG.venueRequired;
  else if (vn.length > LIMITS.venueNameMax) errors.venueName = MSG.venueTooLong(LIMITS.venueNameMax);

  if (!city) errors.city = MSG.cityRequired;
  else if (city.length > LIMITS.cityMax) errors.city = MSG.cityTooLong(LIMITS.cityMax);

  if (!country) errors.country = MSG.countryRequired;
  else if (country.length > LIMITS.countryMax) errors.country = MSG.countryTooLong(LIMITS.countryMax);

  if (!addr) errors.address = MSG.addressRequired;
  else if (addr.length > LIMITS.addressMax) errors.address = MSG.addressTooLong(LIMITS.addressMax);

  const latStr = input.geoLat.trim();
  const lngStr = input.geoLng.trim();
  if (!latStr) errors.geoLat = MSG.latRequired;
  if (!lngStr) errors.geoLng = MSG.lngRequired;

  const lat = Number(latStr);
  const lng = Number(lngStr);
  if (latStr && !Number.isFinite(lat)) errors.geoLat = MSG.latInvalid;
  if (lngStr && !Number.isFinite(lng)) errors.geoLng = MSG.lngInvalid;
  if (Number.isFinite(lat) && (lat < CREATE_SHOW_GEO_BOUNDS.latMin || lat > CREATE_SHOW_GEO_BOUNDS.latMax)) {
    errors.geoLat = MSG.latRange(CREATE_SHOW_GEO_BOUNDS.latMin, CREATE_SHOW_GEO_BOUNDS.latMax);
  }
  if (Number.isFinite(lng) && (lng < CREATE_SHOW_GEO_BOUNDS.lngMin || lng > CREATE_SHOW_GEO_BOUNDS.lngMax)) {
    errors.geoLng = MSG.lngRange(CREATE_SHOW_GEO_BOUNDS.lngMin, CREATE_SHOW_GEO_BOUNDS.lngMax);
  }

  const cover = input.coverUrl.trim();
  if (cover.length > LIMITS.coverUrlMax) errors.coverImageUrl = MSG.coverTooLong(LIMITS.coverUrlMax);
  else if (cover && !CREATE_SHOW_COVER_PATTERN.test(cover)) errors.coverImageUrl = MSG.coverInvalid;

  if (Object.keys(errors).length === 0) return { ok: true };
  return { ok: false, errors };
}
