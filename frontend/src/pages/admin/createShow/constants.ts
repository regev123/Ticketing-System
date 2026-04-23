/**
 * Defaults for the admin "create show" flow only (SRP).
 */
import { toISOLocal } from '@/utils';
import {
  CREATE_SHOW_DEFAULT_DAYS_AHEAD,
  CREATE_SHOW_DEFAULT_DURATION_MINUTES,
  CREATE_SHOW_DEFAULT_DOORS_OPEN_OFFSET_MINUTES,
  DEFAULT_SECTION_CURRENCY,
  DEFAULT_SECTION_PRICE,
  DEFAULT_SECTION_ROWS,
  DEFAULT_SECTION_SEATS_PER_ROW,
} from '@/config/constants';
import type { SectionInput } from '@/types/api';

export const DEFAULT_SECTION: SectionInput = {
  section: 'A',
  rowCount: DEFAULT_SECTION_ROWS,
  seatsPerRow: DEFAULT_SECTION_SEATS_PER_ROW,
  price: DEFAULT_SECTION_PRICE,
  currency: DEFAULT_SECTION_CURRENCY,
};

/** Mirrors catalog-service `CreateShowRequest` constraints (BFF validation). */
export const CREATE_SHOW_VALIDATION_LIMITS = {
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

export const CREATE_SHOW_GEO_BOUNDS = {
  latMin: -90,
  latMax: 90,
  lngMin: -180,
  lngMax: 180,
} as const;

export const CREATE_SHOW_COVER_PATTERN = /^(https?:\/\/|data:image\/)/i;

export const CREATE_SHOW_VALIDATION_MESSAGES = {
  titleRequired: 'Event title is required.',
  titleTooLong: (max: number) => `Title must be at most ${max} characters.`,
  descriptionTooLong: (max: number) => `Description must be at most ${max} characters.`,
  doorsRequired: 'Choose doors open date and time.',
  doorsInvalid: 'Doors open time is not a valid date.',
  startRequired: 'Choose start date and time.',
  startInvalid: 'Start time is not a valid date.',
  startBeforeDoors: 'Start time must be on or after doors open.',
  endRequired: 'Choose end date and time.',
  endInvalid: 'End time is not a valid date.',
  endBeforeStart: 'End time must be after start time.',
  venueRequired: 'Venue name is required.',
  venueTooLong: (max: number) => `Venue name must be at most ${max} characters.`,
  cityRequired: 'City is required.',
  cityTooLong: (max: number) => `City must be at most ${max} characters.`,
  countryRequired: 'Country is required.',
  countryTooLong: (max: number) => `Country must be at most ${max} characters.`,
  addressRequired: 'Address is required.',
  addressTooLong: (max: number) => `Address must be at most ${max} characters.`,
  latRequired: 'Latitude is required.',
  lngRequired: 'Longitude is required.',
  latInvalid: 'Enter a valid latitude number.',
  lngInvalid: 'Enter a valid longitude number.',
  latRange: (min: number, max: number) => `Latitude must be between ${min} and ${max}.`,
  lngRange: (min: number, max: number) => `Longitude must be between ${min} and ${max}.`,
  coverTooLong: (max: number) =>
    `Cover URL or data is too long (max ${max.toLocaleString()} characters).`,
  coverInvalid: 'Use an https URL or an uploaded image (data URL).',
  sectionsRequired: 'Add at least one seating zone (or use the default section).',
  sectionLabelRequired: 'Section label is required.',
  sectionLabelTooLong: (max: number) => `At most ${max} characters.`,
  rowsNan: 'Rows must be a number.',
  rowsNotInteger: 'Rows must be a whole number.',
  rowsTooSmall: 'Rows must be greater than 1.',
  seatsPerRowNan: 'Seats per row must be a number.',
  seatsPerRowNotInteger: 'Seats per row must be a whole number.',
  seatsPerRowTooSmall: 'Seats per row must be greater than 1.',
  priceNan: 'Price must be a number.',
  priceTooSmall: 'Price must be greater than 0.',
  currencyRequired: 'Currency is required.',
  currencyTooLong: (max: number) => `At most ${max} characters.`,
} as const;

export function defaultStartTime(): string {
  const d = new Date();
  d.setDate(d.getDate() + CREATE_SHOW_DEFAULT_DAYS_AHEAD);
  return toISOLocal(d);
}

export function defaultEndTime(): string {
  const base = new Date();
  base.setDate(base.getDate() + CREATE_SHOW_DEFAULT_DAYS_AHEAD);
  const end = new Date(base.getTime() + CREATE_SHOW_DEFAULT_DURATION_MINUTES * 60 * 1000);
  return toISOLocal(end);
}

export function defaultDoorsOpenTime(): string {
  const base = new Date();
  base.setDate(base.getDate() + CREATE_SHOW_DEFAULT_DAYS_AHEAD);
  const doorsOpen = new Date(
    base.getTime() - CREATE_SHOW_DEFAULT_DOORS_OPEN_OFFSET_MINUTES * 60 * 1000
  );
  return toISOLocal(doorsOpen);
}
