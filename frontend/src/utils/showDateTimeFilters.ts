/**
 * Client-side filters for shows (filter #1: date range + time of day).
 * Dates are calendar days only (YYYY-MM-DD local); matinee/evening refine by start time.
 */

import type { Show } from '@/types/api';

export type TimeOfDayFilter = 'any' | 'matinee' | 'evening';

/** Matinee = show starts before this local time (17:00). */
const MATINEE_END_MINUTES = 17 * 60;

export interface ShowDateTimeFilterState {
  /** Inclusive start calendar day (YYYY-MM-DD). Empty = no lower bound. */
  dateFrom: string;
  /** Inclusive end calendar day (YYYY-MM-DD). Empty = no upper bound. */
  dateTo: string;
  timeOfDay: TimeOfDayFilter;
}

export const defaultShowDateTimeFilterState = (): ShowDateTimeFilterState => ({
  dateFrom: '',
  dateTo: '',
  timeOfDay: 'any',
});

function parseDateInput(yyyyMmDd: string): Date {
  const [y, m, d] = yyyyMmDd.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function startOfLocalDay(d: Date): Date {
  const x = new Date(d.getTime());
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfLocalDay(d: Date): Date {
  const x = new Date(d.getTime());
  x.setHours(23, 59, 59, 999);
  return x;
}

function minutesSinceLocalMidnight(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

/**
 * Keeps shows whose {@link Show.startTime} falls in the optional date range (inclusive days)
 * and matches matinee/evening when not `any`.
 */
export function filterShowsByDateTime(shows: Show[], state: ShowDateTimeFilterState): Show[] {
  return shows.filter((show) => {
    const start = new Date(show.startTime);
    if (Number.isNaN(start.getTime())) {
      return false;
    }

    if (state.dateFrom) {
      const from = startOfLocalDay(parseDateInput(state.dateFrom));
      if (start < from) {
        return false;
      }
    }
    if (state.dateTo) {
      const to = endOfLocalDay(parseDateInput(state.dateTo));
      if (start > to) {
        return false;
      }
    }

    const mins = minutesSinceLocalMidnight(start);
    if (state.timeOfDay === 'matinee' && mins >= MATINEE_END_MINUTES) {
      return false;
    }
    if (state.timeOfDay === 'evening' && mins < MATINEE_END_MINUTES) {
      return false;
    }

    return true;
  });
}

export function hasActiveDateTimeFilters(state: ShowDateTimeFilterState): boolean {
  return state.dateFrom !== '' || state.dateTo !== '' || state.timeOfDay !== 'any';
}
