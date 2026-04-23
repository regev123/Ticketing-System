import {
  CREATE_SHOW_VALIDATION_LIMITS as LIMITS,
  CREATE_SHOW_VALIDATION_MESSAGES as MSG,
} from './constants';
import type { CreateShowFormErrors, SectionErrors, ValidateCreateShowInput } from './types';
import { validateSharedShowFields } from '@/pages/admin/showEditor/validateSharedShowFields';

export function validateCreateShowForm(input: ValidateCreateShowInput): {
  ok: true;
} | {
  ok: false;
  errors: CreateShowFormErrors;
  sectionErrors: SectionErrors[];
} {
  const shared = validateSharedShowFields(input);
  const errors: CreateShowFormErrors = shared.ok ? {} : shared.errors;
  const sectionErrors: SectionErrors[] = input.sections.map(() => ({}));

  if (!input.sections.length) {
    return {
      ok: false,
      errors,
      sectionErrors: [{ section: MSG.sectionsRequired }],
    };
  }

  input.sections.forEach((sec, i) => {
    const e = sectionErrors[i];
    const label = sec.section?.trim() ?? '';
    if (!label) e.section = MSG.sectionLabelRequired;
    else if (label.length > LIMITS.sectionLabelMax) e.section = MSG.sectionLabelTooLong(LIMITS.sectionLabelMax);

    if (!Number.isFinite(sec.rowCount)) {
      e.rowCount = MSG.rowsNan;
    } else if (!Number.isInteger(sec.rowCount)) {
      e.rowCount = MSG.rowsNotInteger;
    } else if (sec.rowCount <= 1) {
      e.rowCount = MSG.rowsTooSmall;
    }

    if (!Number.isFinite(sec.seatsPerRow)) {
      e.seatsPerRow = MSG.seatsPerRowNan;
    } else if (!Number.isInteger(sec.seatsPerRow)) {
      e.seatsPerRow = MSG.seatsPerRowNotInteger;
    } else if (sec.seatsPerRow <= 1) {
      e.seatsPerRow = MSG.seatsPerRowTooSmall;
    }

    if (!Number.isFinite(sec.price)) {
      e.price = MSG.priceNan;
    } else if (sec.price <= 0) {
      e.price = MSG.priceTooSmall;
    }

    const cur = (sec.currency ?? '').trim();
    if (!cur) e.currency = MSG.currencyRequired;
    else if (cur.length > LIMITS.currencyMax) e.currency = MSG.currencyTooLong(LIMITS.currencyMax);
  });

  const hasTop = Object.keys(errors).length > 0;
  const hasSection = sectionErrors.some((s) => Object.keys(s).length > 0);

  if (!hasTop && !hasSection) return { ok: true };
  return { ok: false, errors, sectionErrors };
}
