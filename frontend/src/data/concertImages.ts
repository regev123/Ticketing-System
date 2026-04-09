/**
 * Pool of 100 image URLs — one picked per show (stable for same id).
 * Uses Picsum (reliable); requires network. Fallback in ShowCard if load fails.
 */
export const CONCERT_IMAGE_URLS: readonly string[] = Array.from(
  { length: 100 },
  (_, i) => `https://picsum.photos/seed/ticket-${i}/800/450`
);

export function concertImageIndexForShowId(showId: string): number {
  let hash = 0;
  for (let i = 0; i < showId.length; i++) {
    hash = (Math.imul(31, hash) + showId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % CONCERT_IMAGE_URLS.length;
}

export function getConcertImageUrl(showId: string): string {
  return CONCERT_IMAGE_URLS[concertImageIndexForShowId(showId)]!;
}

/** Use saved cover when set; otherwise a stable random image from the pool. */
export function getShowCardImageUrl(show: {
  id: string;
  coverImageUrl?: string | null;
}): string {
  const custom = show.coverImageUrl?.trim();
  if (custom) return custom;
  return getConcertImageUrl(show.id);
}
