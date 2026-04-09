/**
 * Availability API. Single responsibility: availability HTTP only.
 */

import { client } from '@/api/client';
import type { SeatAvailability } from '@/types/api';

const AVAILABILITY = '/api/availability';

export const availabilityApi = {
  getByShowId: (showId: string) =>
    client.get<SeatAvailability>(`${AVAILABILITY}/${showId}`),
};
