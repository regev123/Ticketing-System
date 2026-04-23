import type { CreateShowFormErrors, ValidateUpdateShowInput } from './types';
import { validateSharedShowFields } from '@/pages/admin/showEditor/validateSharedShowFields';

export function validateUpdateShowForm(input: ValidateUpdateShowInput): { ok: true } | { ok: false; errors: CreateShowFormErrors } {
  const result = validateSharedShowFields(input);
  if (result.ok) return { ok: true };
  return { ok: false, errors: result.errors };
}
