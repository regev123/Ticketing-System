/**
 * Hook: create show mutation (admin). Single responsibility.
 */

import { useMutation } from '@tanstack/react-query';
import { showsApi } from '@/api/shows';
import type { CreateShowRequest } from '@/types/api';

export function useCreateShow() {
  return useMutation({
    mutationFn: (body: CreateShowRequest) => showsApi.create(body),
  });
}
