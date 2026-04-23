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

/** Request body for updating editable show fields (admin). */
export interface UpdateShowRequest {
  title: string;
  category: EventCategory;
  description?: string;
  venue: VenueLocation;
  startTime: string;
  endTime: string;
  doorsOpenTime: string;
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
  seats: string[];
}

export interface CreateOrderRequest {
  holdId: string;
  showId: string;
  seatIds: string[];
  amount: number;
  currency: string;
  userEmail?: string;
  showTitle?: string;
  venueName?: string;
  startTime?: string;
}

export interface OrderResponse {
  id: string;
  holdId: string;
  showId: string;
  seatIds: string[];
  userId: string;
  userEmail?: string;
  showTitle?: string;
  venueName?: string;
  startTime?: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export interface PagedResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export type ScanTicketResult = 'SCANNED' | 'ALREADY_USED' | 'INVALID';

export interface ScanTicketRequest {
  qrToken: string;
  gateId?: string;
}

export interface ScanTicketResponse {
  result: ScanTicketResult;
  message: string;
  orderId?: string;
  seatId?: string;
  showId?: string;
  scannedAt?: string;
}

export interface AdminEventMetrics {
  showId: string;
  showTitle: string;
  totalOrders: number;
  confirmedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  partiallyCancelledOrders: number;
  activeTickets: number;
  scansSuccessful: number;
  revenueEstimated: number;
  revenue: number;
}

export interface AdminGlobalMetrics {
  totalOrders: number;
  confirmedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  partiallyCancelledOrders: number;
  ticketsActive: number;
  scansSuccessful: number;
  revenueConfirmed: number;
  revenueEstimated: number;
}

export interface AdminMetricsResponse {
  windowDays: number;
  global: AdminGlobalMetrics;
  perEventMetrics: AdminEventMetrics[];
  topEventsByRevenue: AdminEventMetrics[];
}

export interface ErrorResponse {
  message?: string;
  status?: number;
}

export type AuthRole = 'USER' | 'ADMIN' | 'SCANNER';

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthTokensResponse {
  token: string;
}

export interface AuthMeResponse {
  id: string;
  email: string;
  role: AuthRole;
  active: boolean;
  emailVerified: boolean;
  firstName?: string | null;
  lastName?: string | null;
}

export interface ScannerAccountResponse {
  id: string;
  email: string;
  role: AuthRole;
  active: boolean;
  firstName?: string | null;
  lastName?: string | null;
  scannerEventId?: string | null;
  scannerEventTitle?: string | null;
  scannerEventEndAt?: string | null;
  temporaryPassword?: string | null;
  createdAt?: string | null;
  lastLoginAt?: string | null;
}

export interface AdminCreateScannerRequest {
  scannerName: string;
  showId: string;
  showTitle: string;
  eventEndAt: string;
}
