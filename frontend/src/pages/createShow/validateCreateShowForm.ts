import type { EventCategory, SectionInput } from '@/types/api';

/** Mirrors catalog-service `CreateShowRequest` constraints (BFF validation). */
export const LIMITS = {
  titleMax: 255,
  categoryMax: 64,
  descriptionMax: 1500,
  venueNameMax: 255,
  cityMax: 100,
  countryMax: 100,
  addressMax: 255,
  sectionLabelMax: 32,
  currencyMax: 8,
  coverUrlMax: 1_500_000,
} as const;

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

function parseInstant(isoOrLocal: string): Date | null {
  if (!isoOrLocal.trim()) return null;
  const d = new Date(isoOrLocal);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function validateCreateShowForm(input: ValidateCreateShowInput): {
  ok: true;
} | {
  ok: false;
  errors: CreateShowFormErrors;
  sectionErrors: SectionErrors[];
} {
  const errors: CreateShowFormErrors = {};
  const sectionErrors: SectionErrors[] = input.sections.map(() => ({}));

  const title = input.title.trim();
  if (!title) errors.title = 'Event title is required.';
  else if (title.length > LIMITS.titleMax)
    errors.title = `Title must be at most ${LIMITS.titleMax} characters.`;

  const desc = input.description.trim();
  if (desc.length > LIMITS.descriptionMax)
    errors.description = `Description must be at most ${LIMITS.descriptionMax} characters.`;

  if (!input.category?.trim()) {
    /* unlikely — select always has value */
  } else if (input.category.length > LIMITS.categoryMax) {
    /* unlikely */
  }

  const doors = parseInstant(input.doorsOpenTime);
  const start = parseInstant(input.startTime);
  const end = parseInstant(input.endTime);

  if (!input.doorsOpenTime.trim()) errors.doorsOpenTime = 'Choose doors open date and time.';
  else if (!doors) errors.doorsOpenTime = 'Doors open time is not a valid date.';

  if (!input.startTime.trim()) errors.startTime = 'Choose start date and time.';
  else if (!start) errors.startTime = 'Start time is not a valid date.';

  if (!input.endTime.trim()) errors.endTime = 'Choose end date and time.';
  else if (!end) errors.endTime = 'End time is not a valid date.';

  if (doors && start && end) {
    if (start.getTime() < doors.getTime()) {
      errors.startTime = 'Start time must be on or after doors open.';
    }
    if (end.getTime() <= start.getTime()) {
      errors.endTime = 'End time must be after start time.';
    }
  }

  const vn = input.venueName.trim();
  const city = input.city.trim();
  const country = input.country.trim();
  const addr = input.address.trim();

  if (!vn) errors.venueName = 'Venue name is required.';
  else if (vn.length > LIMITS.venueNameMax)
    errors.venueName = `Venue name must be at most ${LIMITS.venueNameMax} characters.`;

  if (!city) errors.city = 'City is required.';
  else if (city.length > LIMITS.cityMax) errors.city = `City must be at most ${LIMITS.cityMax} characters.`;

  if (!country) errors.country = 'Country is required.';
  else if (country.length > LIMITS.countryMax)
    errors.country = `Country must be at most ${LIMITS.countryMax} characters.`;

  if (!addr) errors.address = 'Address is required.';
  else if (addr.length > LIMITS.addressMax)
    errors.address = `Address must be at most ${LIMITS.addressMax} characters.`;

  const latStr = input.geoLat.trim();
  const lngStr = input.geoLng.trim();
  if (!latStr) errors.geoLat = 'Latitude is required.';
  if (!lngStr) errors.geoLng = 'Longitude is required.';

  const lat = Number(latStr);
  const lng = Number(lngStr);
  if (latStr && !Number.isFinite(lat)) errors.geoLat = 'Enter a valid latitude number.';
  if (lngStr && !Number.isFinite(lng)) errors.geoLng = 'Enter a valid longitude number.';
  if (Number.isFinite(lat) && (lat < -90 || lat > 90)) errors.geoLat = 'Latitude must be between −90 and 90.';
  if (Number.isFinite(lng) && (lng < -180 || lng > 180)) errors.geoLng = 'Longitude must be between −180 and 180.';

  const cover = input.coverUrl.trim();
  if (cover.length > LIMITS.coverUrlMax)
    errors.coverImageUrl = `Cover URL or data is too long (max ${LIMITS.coverUrlMax.toLocaleString()} characters).`;
  else if (cover && !/^(https?:\/\/|data:image\/)/i.test(cover)) {
    errors.coverImageUrl = 'Use an https URL or an uploaded image (data URL).';
  }

  if (!input.sections.length) {
    return {
      ok: false,
      errors,
      sectionErrors: [{ section: 'Add at least one seating zone (or use the default section).' }],
    };
  }

  input.sections.forEach((sec, i) => {
    const e = sectionErrors[i];
    const label = sec.section?.trim() ?? '';
    if (!label) e.section = 'Section label is required.';
    else if (label.length > LIMITS.sectionLabelMax)
      e.section = `At most ${LIMITS.sectionLabelMax} characters.`;

    if (!Number.isFinite(sec.rowCount)) {
      e.rowCount = 'Rows must be a number.';
    } else if (!Number.isInteger(sec.rowCount)) {
      e.rowCount = 'Rows must be a whole number.';
    } else if (sec.rowCount <= 1) {
      e.rowCount = 'Rows must be greater than 1.';
    }

    if (!Number.isFinite(sec.seatsPerRow)) {
      e.seatsPerRow = 'Seats per row must be a number.';
    } else if (!Number.isInteger(sec.seatsPerRow)) {
      e.seatsPerRow = 'Seats per row must be a whole number.';
    } else if (sec.seatsPerRow <= 1) {
      e.seatsPerRow = 'Seats per row must be greater than 1.';
    }

    if (!Number.isFinite(sec.price)) {
      e.price = 'Price must be a number.';
    } else if (sec.price <= 0) {
      e.price = 'Price must be greater than 0.';
    }

    const cur = (sec.currency ?? '').trim();
    if (!cur) e.currency = 'Currency is required.';
    else if (cur.length > LIMITS.currencyMax) e.currency = `At most ${LIMITS.currencyMax} characters.`;
  });

  const hasTop = Object.keys(errors).length > 0;
  const hasSection = sectionErrors.some((s) => Object.keys(s).length > 0);

  if (!hasTop && !hasSection) return { ok: true };
  return { ok: false, errors, sectionErrors };
}
