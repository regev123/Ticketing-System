import { useMutation } from '@tanstack/react-query';
import { showsApi } from '@/api/shows';
import type { UpdateShowRequest } from '@/types/api';

export function useUpdateShow() {
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateShowRequest }) => showsApi.update(id, body),
  });
}
