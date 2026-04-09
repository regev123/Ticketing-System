/**
 * Show catalog API. Single responsibility: show-related HTTP only.
 */

import { client } from '@/api/client';
import type { Show, CreateShowRequest } from '@/types/api';

const SHOWS = '/api/shows';

export const showsApi = {
  list: () => client.get<Show[]>(SHOWS),
  getById: (id: string) => client.get<Show>(`${SHOWS}/${id}`),
  create: (body: CreateShowRequest) => client.post<Show>(SHOWS, body),
};
