/**
 * Domain types aligned with backend DTOs/entities.
 * No behaviour; only data shapes (ISP — clients depend only on what they use).
 */

export interface Show {
  id: string;
  title: string;
  category?: EventCategory | null;
  description?: string | null;
  venue: VenueLocation;
  startTime: string;
  endTime?: string;
  doorsOpenTime?: string;
  seats: SeatInfo[];
  /** Optional poster URL (https) or data URL; omitted → client uses pool image */
  coverImageUrl?: string | null;
}

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface VenueLocation {
  venueName: string;
  city: string;
  country: string;
  address: string;
  geo: GeoLocation;
}

/** Request body for creating a show (admin). */
export interface CreateShowRequest {
  title: string;
  category: EventCategory;
  description?: string;
  venue: VenueLocation;
  startTime: string;
  endTime: string;
  doorsOpenTime: string;
  sections: SectionInput[];
  coverImageUrl?: string;
}

export type EventCategory =
  | 'music'
  | 'sports'
  | 'live'
  | 'standup'
  | 'theater'
  | 'comedy'
  | 'festival'
  | 'conference'
  | 'expo'
  | 'family'
  | 'kids'
  | 'dance'
  | 'opera'
  | 'classical'
  | 'electronic'
  | 'hiphop'
  | 'jazz'
  | 'rock'
  | 'pop'
  | 'cinema'
  | 'gaming'
  | 'esports'
  | 'other';

export interface SectionInput {
  section: string;
  rowCount: number;
  seatsPerRow: number;
  price: number;
  currency: string;
}

/** Seat in catalog or availability list — same shape (DRY). */
export interface SeatInfo {
  id: string;
  section: string;
  row: number;
  number: number;
  price: number;
  currency: string;
}

export interface SeatAvailability {
  showId: string;
  showTitle: string;
  seats: SeatInfo[];
}

export interface CreateHoldRequest {
  showId: string;
  seatIds: string[];
  userId: string;
}

export interface HoldResponse {
  holdId: string;
  showId: string;
  seatIds: string[];
  userId: string;
  expiresAt: number;
}

export interface BatchHoldResponse {
  success: string[];
  failed: string[];
  hold: HoldResponse | null;
}

export interface BatchReleaseRequest {
  holdId: string;
  showId: string;
  userId: string;
  seats: string[];
}

export interface CreateOrderRequest {
  holdId: string;
  showId: string;
  seatIds: string[];
  userId: string;
  amount: number;
  currency: string;
}

export interface OrderResponse {
  id: string;
  holdId: string;
  showId: string;
  seatIds: string[];
  userId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export interface ErrorResponse {
  message?: string;
  status?: number;
}
