/**
 * Reservations (holds) API. Single responsibility: hold HTTP only.
 */

import { client } from '@/api/client';
import type {
  BatchHoldResponse,
  BatchReleaseRequest,
  CreateHoldRequest,
  HoldResponse,
} from '@/types/api';

const RESERVATIONS = '/api/reservations';

export const reservationsApi = {
  createHold: (body: CreateHoldRequest) =>
    client.post<HoldResponse>(RESERVATIONS, { ...body, seatIds: [...body.seatIds] }),
  batchHold: (body: {
    showId: string;
    seats: string[];
    holdId?: string;
  }) =>
    client.post<BatchHoldResponse>(`${RESERVATIONS}/hold`, {
      ...body,
      seats: [...body.seats],
    }),
  batchRelease: (body: BatchReleaseRequest) =>
    client.post<{ released: string[] }>(`${RESERVATIONS}/release`, {
      ...body,
      seats: [...body.seats],
    }),
  extendHold: (body: {
    holdId: string;
    showId: string;
    seats: string[];
    ttlSeconds?: number;
  }) =>
    client.post<{ extended: number }>(`${RESERVATIONS}/extend-hold`, {
      ...body,
      seats: [...body.seats],
    }),
  releaseHold: (holdId: string) =>
    client.delete<void>(`${RESERVATIONS}/${holdId}`),
  /** 200 + hold body, or 204 → `undefined` (no active hold). */
  getMyActiveHold: (showId: string) =>
    client.get<HoldResponse | undefined>(`${RESERVATIONS}/shows/${showId}/my-hold`),
};
