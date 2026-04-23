import { useCallback, useState } from 'react';
import type { CreateShowFormErrors, SectionErrors } from './types';
import type { validateCreateShowForm } from './validateCreateShowForm';

type ValidationFailure = Extract<ReturnType<typeof validateCreateShowForm>, { ok: false }>;

const LOCATION_ERROR_KEYS: Array<keyof CreateShowFormErrors> = [
  'venueName',
  'address',
  'city',
  'country',
  'geoLat',
  'geoLng',
];

export function useCreateShowValidationState() {
  const [fieldErrors, setFieldErrors] = useState<CreateShowFormErrors>({});
  const [sectionErrors, setSectionErrors] = useState<SectionErrors[]>([]);

  const applyValidationFailure = useCallback((result: ValidationFailure) => {
    setFieldErrors(result.errors);
    setSectionErrors(result.sectionErrors);
  }, []);

  const resetValidationErrors = useCallback(() => {
    setFieldErrors({});
    setSectionErrors([]);
  }, []);

  const clearFieldError = useCallback((key: keyof CreateShowFormErrors) => {
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  }, []);

  const clearLocationErrors = useCallback(() => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      LOCATION_ERROR_KEYS.forEach((k) => {
        next[k] = undefined;
      });
      return next;
    });
  }, []);

  return {
    fieldErrors,
    sectionErrors,
    applyValidationFailure,
    resetValidationErrors,
    clearFieldError,
    clearLocationErrors,
  };
}
