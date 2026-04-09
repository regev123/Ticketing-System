import { ModernDateField } from '@/components/forms';
import { parseDateOnlyString } from '@/utils/datetimeLocal';
import type { ShowDateTimeFilterState, TimeOfDayFilter } from '@/utils/showDateTimeFilters';
import { hasActiveDateTimeFilters } from '@/utils/showDateTimeFilters';

type Props = {
  value: ShowDateTimeFilterState;
  onChange: (next: ShowDateTimeFilterState) => void;
  idPrefix?: string;
  /** When true, render inner fields only (no outer card or section clear — use inside ShowFiltersPanel). */
  embedded?: boolean;
};

const TIME_OPTIONS: { value: TimeOfDayFilter; label: string; hint: string }[] = [
  { value: 'any', label: 'Any time', hint: 'All start times' },
  { value: 'matinee', label: 'Matinee', hint: 'Before 5:00 PM' },
  { value: 'evening', label: 'Evening', hint: '5:00 PM & later' },
];

export function ShowDateTimeFilters({ value, onChange, idPrefix = 'show-filter', embedded = false }: Props) {
  const active = hasActiveDateTimeFilters(value);

  const toDate = value.dateTo ? parseDateOnlyString(value.dateTo) : null;
  const fromDate = value.dateFrom ? parseDateOnlyString(value.dateFrom) : null;

  const inner = (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:flex lg:flex-1 lg:flex-wrap lg:gap-6">
          <div className="min-w-0 sm:max-w-md">
            <ModernDateField
              id={`${idPrefix}-from`}
              heading="From"
              hint="Shows on or after this day"
              value={value.dateFrom}
              onChange={(next) => onChange({ ...value, dateFrom: next })}
              maxDate={toDate ?? undefined}
            />
          </div>
          <div className="min-w-0 sm:max-w-md">
            <ModernDateField
              id={`${idPrefix}-to`}
              heading="To"
              hint="Shows on or before this day"
              value={value.dateTo}
              onChange={(next) => onChange({ ...value, dateTo: next })}
              minDate={fromDate ?? undefined}
            />
          </div>
        </div>

        <fieldset className="min-w-0 lg:max-w-md lg:flex-1">
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Time of day</legend>
          <div className="flex flex-wrap gap-2">
            {TIME_OPTIONS.map((opt) => {
              const id = `${idPrefix}-tod-${opt.value}`;
              const selected = value.timeOfDay === opt.value;
              return (
                <label
                  key={opt.value}
                  htmlFor={id}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                    selected
                      ? 'border-violet-500 bg-violet-50 text-violet-900 ring-2 ring-violet-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <input
                    id={id}
                    type="radio"
                    name={`${idPrefix}-timeOfDay`}
                    value={opt.value}
                    checked={selected}
                    onChange={() => onChange({ ...value, timeOfDay: opt.value })}
                    className="sr-only"
                  />
                  <span className="font-medium">{opt.label}</span>
                  <span className="hidden text-xs text-slate-500 sm:inline">({opt.hint})</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      {!embedded && active && (
        <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() =>
              onChange({
                dateFrom: '',
                dateTo: '',
                timeOfDay: 'any',
              })
            }
            className="text-sm font-medium text-violet-600 underline-offset-2 transition hover:text-violet-500 hover:underline"
          >
            Clear date &amp; time filters
          </button>
        </div>
      )}
    </>
  );

  if (embedded) {
    return (
      <div className="space-y-4" role="group" aria-label="Date and time filters">
        {inner}
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm sm:p-5"
      role="search"
      aria-label="Filter shows by date and time"
    >
      {inner}
    </div>
  );
}
