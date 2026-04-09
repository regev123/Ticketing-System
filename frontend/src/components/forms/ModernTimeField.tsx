import { forwardRef, useMemo, type ComponentPropsWithoutRef } from 'react';
import DatePicker from 'react-datepicker';
import { formatTimeHmLocal, parseTimeHmString } from '@/utils/datetimeLocal';
import { FORM_INPUT } from './formStyles';
import 'react-datepicker/dist/react-datepicker.css';
import './datepicker-theme.css';

type Props = {
  id: string;
  /** HH:mm (24h) or empty */
  value: string;
  onChange: (next: string) => void;
  required?: boolean;
  hint?: string;
  heading?: string;
};

type TriggerProps = Omit<ComponentPropsWithoutRef<'div'>, 'onClick'> & {
  /** Set by react-datepicker customInput; not forwarded to the div. */
  value?: string;
  onClick?: () => void;
  disabled?: boolean;
  onClear?: () => void;
};

/**
 * Time-only picker (same look as admin time list). Value: `HH:mm` local.
 */
export function ModernTimeField({ id, value, onChange, required, hint, heading }: Props) {
  const selected = useMemo(() => parseTimeHmString(value), [value]);

  const handleChange = (date: Date | null) => {
    if (!date) {
      onChange('');
      return;
    }
    onChange(formatTimeHmLocal(date));
  };

  const handleClear = () => handleChange(null);

  const displayValue = value || '';

  return (
    <div className="ticketing-datetime-field w-full min-w-0 space-y-1.5" role="group" aria-labelledby={`${id}-heading`}>
      <p id={`${id}-heading`} className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {heading ?? 'Time'}
      </p>

      <DatePicker
        id={id}
        selected={selected}
        onChange={handleChange}
        showTimeSelect
        showTimeSelectOnly
        showPopperArrow={false}
        timeIntervals={15}
        timeFormat="HH:mm"
        dateFormat="HH:mm"
        placeholderText="Choose time…"
        autoComplete="off"
        popperClassName="ticketing-datepicker-popper"
        calendarClassName="ticketing-datepicker-calendar"
        shouldCloseOnSelect
        customInput={<TimeTrigger displayValue={displayValue} onClear={selected ? handleClear : undefined} />}
        required={required}
        ariaLabelledBy={`${id}-heading`}
      />

      {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

const TimeTrigger = forwardRef<HTMLDivElement, TriggerProps & { displayValue: string }>(
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
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </span>
      <span
        className={`min-w-0 flex-1 truncate leading-normal ${displayValue ? 'text-slate-900' : 'text-slate-400'}`}
        title={displayValue || undefined}
      >
        {displayValue || 'Choose time…'}
      </span>
      <span className="flex h-5 w-8 shrink-0 items-center justify-center">
        {onClear ? (
          <button
            type="button"
            tabIndex={-1}
            aria-label="Clear time"
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
TimeTrigger.displayName = 'TimeTrigger';
