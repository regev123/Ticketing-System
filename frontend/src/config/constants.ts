/**
 * App-wide constants. Single place for magic numbers and demo/config values.
 */

/** Query client: how long data is considered fresh (ms). */
export const QUERY_STALE_TIME_MS = 60 * 1000;

/** Query client: number of retries for failed requests. */
export const QUERY_RETRY_COUNT = 1;

/** Admin create-show: default venue when none entered. */
export const DEFAULT_VENUE_ID = 'venue-1';

/** Cover image upload: max file size before compression (bytes). */
export const COVER_IMAGE_MAX_FILE_BYTES = 5 * 1024 * 1024;

/** Cover image: max serialized data URL length after compression (JSON body safety). */
export const COVER_IMAGE_MAX_DATA_URL_CHARS = 1_200_000;

/** Default section row for new shows (admin). */
export const DEFAULT_SECTION_ROWS = 5;

export const DEFAULT_SECTION_SEATS_PER_ROW = 10;

export const DEFAULT_SECTION_PRICE = 49.99;

export const DEFAULT_SECTION_CURRENCY = 'USD';

/** Days ahead for default “start time” on create form. */
export const CREATE_SHOW_DEFAULT_DAYS_AHEAD = 7;

/** Default event duration for create form (minutes). */
export const CREATE_SHOW_DEFAULT_DURATION_MINUTES = 180;

/** Doors-open offset before start (minutes). */
export const CREATE_SHOW_DEFAULT_DOORS_OPEN_OFFSET_MINUTES = 60;

/** Business policy: cancellation closes this many hours before event start. */
export const ORDER_CANCELLATION_CUTOFF_HOURS = 24;
