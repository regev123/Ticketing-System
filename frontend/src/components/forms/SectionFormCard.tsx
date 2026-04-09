import { useMemo } from 'react';
import type { SectionInput } from '@/types/api';
import type { SectionErrors } from '@/pages/createShow/validateCreateShowForm';
import { Button } from '@/components/Button';
import { CURRENCY_OPTIONS } from '@/data/currencies';
import { CurrencySelect } from './CurrencySelect';
import { FORM_INPUT_SM } from './formStyles';

type Props = {
  section: SectionInput;
  canRemove: boolean;
  onChange: (index: number, patch: Partial<SectionInput>) => void;
  onRemove: (index: number) => void;
  index: number;
  fieldErrors?: SectionErrors;
};

const inputErr = 'border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-red-500/20';

export function SectionFormCard({ section, index, canRemove, onChange, onRemove, fieldErrors }: Props) {
  const totalSeats = section.rowCount * section.seatsPerRow;

  const currencyCode = (section.currency || 'USD').toUpperCase();
  const currencyOptions = useMemo(() => {
    const known = CURRENCY_OPTIONS.some((c) => c.code === currencyCode);
    if (known) return CURRENCY_OPTIONS;
    return [{ code: currencyCode, label: `${currencyCode} (current)` }, ...CURRENCY_OPTIONS];
  }, [currencyCode]);

  return (
    <div className="group relative rounded-xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/[0.03] transition hover:ring-violet-200/60">
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-violet-500 to-fuchsia-500 opacity-90" aria-hidden />
      <div className="pl-5 pr-4 pt-4">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 font-display text-sm font-bold text-violet-700">
              {String.fromCharCode(65 + index)}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Section</p>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-display text-base font-semibold text-slate-900">{section.section}</p>
                <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-violet-700 ring-1 ring-violet-100">
                  All fields required
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-100">
              {totalSeats} seats
            </span>
            {canRemove ? (
              <Button type="button" variant="ghost" className="!px-2 text-slate-500 hover:text-red-600" onClick={() => onRemove(index)}>
                Remove
              </Button>
            ) : null}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 pb-4 md:grid-cols-[minmax(0,4fr)_minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(0,1.5fr)] md:gap-3 [&>*]:min-w-0">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Label</label>
            <input
              className={`${FORM_INPUT_SM} ${fieldErrors?.section ? inputErr : ''}`}
              aria-invalid={fieldErrors?.section ? true : undefined}
              value={section.section}
              onChange={(e) => onChange(index, { section: e.target.value })}
            />
            {fieldErrors?.section ? (
              <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.section}</p>
            ) : null}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Rows</label>
            <input
              type="number"
              min={2}
              step={1}
              className={`${FORM_INPUT_SM} ${fieldErrors?.rowCount ? inputErr : ''}`}
              aria-invalid={fieldErrors?.rowCount ? true : undefined}
              value={section.rowCount}
              onChange={(e) => onChange(index, { rowCount: Number(e.target.value) })}
            />
            {fieldErrors?.rowCount ? (
              <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.rowCount}</p>
            ) : null}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Seats per row</label>
            <input
              type="number"
              min={2}
              step={1}
              className={`${FORM_INPUT_SM} ${fieldErrors?.seatsPerRow ? inputErr : ''}`}
              aria-invalid={fieldErrors?.seatsPerRow ? true : undefined}
              value={section.seatsPerRow}
              onChange={(e) => onChange(index, { seatsPerRow: Number(e.target.value) })}
            />
            {fieldErrors?.seatsPerRow ? (
              <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.seatsPerRow}</p>
            ) : null}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Price</label>
            <input
              type="number"
              min={0.01}
              step="0.01"
              className={`${FORM_INPUT_SM} ${fieldErrors?.price ? inputErr : ''}`}
              aria-invalid={fieldErrors?.price ? true : undefined}
              value={section.price}
              onChange={(e) => onChange(index, { price: Number(e.target.value) })}
            />
            {fieldErrors?.price ? (
              <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.price}</p>
            ) : null}
          </div>
          <div>
            <label
              id={`section-${index}-currency-label`}
              htmlFor={`section-${index}-currency`}
              className="mb-1.5 block text-xs font-medium text-slate-500"
            >
              Currency
            </label>
            <CurrencySelect
              id={`section-${index}-currency`}
              value={currencyCode}
              options={currencyOptions}
              onChange={(code) => onChange(index, { currency: code })}
              ariaLabelledBy={`section-${index}-currency-label`}
              className={fieldErrors?.currency ? inputErr : undefined}
            />
            {fieldErrors?.currency ? (
              <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.currency}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
