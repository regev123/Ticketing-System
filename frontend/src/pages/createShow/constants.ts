/**
 * Defaults for the admin “create show” flow only (SRP).
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
