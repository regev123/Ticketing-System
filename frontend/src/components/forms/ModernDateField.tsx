import { forwardRef, useMemo, type ComponentPropsWithoutRef } from 'react';
import DatePicker from 'react-datepicker';
import { formatDateOnlyLocal, parseDateOnlyString } from '@/utils/datetimeLocal';
import { FORM_INPUT } from './formStyles';
import 'react-datepicker/dist/react-datepicker.css';
import './datepicker-theme.css';

type Props = {
  id: string;
  /** YYYY-MM-DD or empty */
  value: string;
  onChange: (next: string) => void;
  required?: boolean;
  hint?: string;
  heading?: string;
  minDate?: Date;
  maxDate?: Date;
};

type TriggerProps = Omit<ComponentPropsWithoutRef<'div'>, 'onClick'> & {
  /** Set by react-datepicker customInput; not forwarded to the div. */
  value?: string;
  onClick?: () => void;
  disabled?: boolean;
  onClear?: () => void;
};

function formatDateLabel(yyyyMmDd: string): string {
  const d = parseDateOnlyString(yyyyMmDd);
  if (!d) return '';
  return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

/**
 * Date-only picker (same look as admin). Value: `YYYY-MM-DD` local.
 */
export function ModernDateField({
  id,
  value,
  onChange,
  required,
  hint,
  heading,
  minDate,
  maxDate,
}: Props) {
  const selected = useMemo(() => parseDateOnlyString(value), [value]);
  const label = value ? formatDateLabel(value) : '';

  const handleChange = (date: Date | null) => {
    if (!date) {
      onChange('');
      return;
    }
    onChange(formatDateOnlyLocal(date));
  };

  const handleClear = () => handleChange(null);

  return (
    <div className="ticketing-datetime-field w-full min-w-0 space-y-1.5" role="group" aria-labelledby={`${id}-heading`}>
      <p id={`${id}-heading`} className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {heading ?? 'Date'}
      </p>

      <DatePicker
        id={id}
        selected={selected}
        onChange={handleChange}
        showTimeSelect={false}
        dateFormat="yyyy-MM-dd"
        placeholderText="Choose date…"
        autoComplete="off"
        showPopperArrow={false}
        popperClassName="ticketing-datepicker-popper"
        calendarClassName="ticketing-datepicker-calendar"
        minDate={minDate}
        maxDate={maxDate}
        shouldCloseOnSelect
        customInput={<DateTrigger displayValue={label} onClear={selected ? handleClear : undefined} />}
        required={required}
        ariaLabelledBy={`${id}-heading`}
      />

      {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

const DateTrigger = forwardRef<HTMLDivElement, TriggerProps & { displayValue: string }>(
  (
    { displayValue, onClick, onClear, disabled, className, onBlur, onKeyDown, id, tabIndex, value: _libraryValue, ...rest },
    ref
  ) => (
    <div
      ref={ref}
      id={id}
      role="button"
      tabIndex={disabled ? -1 : (tabIndex ?? 0)}
      onClick={disabled ? undefined : onClick}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      aria-disabled={disabled}
      className={`flex w-full min-w-0 cursor-pointer items-center gap-2 text-left transition hover:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/25 disabled:cursor-not-allowed disabled:opacity-60 ${FORM_INPUT} ${className ?? ''}`}
      {...rest}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center text-violet-600" aria-hidden>
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </span>
      <span
        className={`min-w-0 flex-1 truncate leading-normal ${displayValue ? 'text-slate-900' : 'text-slate-400'}`}
        title={displayValue || undefined}
      >
        {displayValue || 'Choose date…'}
      </span>
      <span className="flex h-5 w-8 shrink-0 items-center justify-center">
        {onClear ? (
          <button
            type="button"
            tabIndex={-1}
            aria-label="Clear date"
            className="flex h-5 w-5 items-center justify-center rounded-md text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClear();
            }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6M9 9l6 6" />
            </svg>
          </button>
        ) : null}
      </span>
    </div>
  )
);
DateTrigger.displayName = 'DateTrigger';
