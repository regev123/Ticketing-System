import type { InputHTMLAttributes } from 'react';
import { FORM_INPUT } from './formStyles';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  label: string;
  id: string;
  hint?: string;
  error?: string;
};

export function FormTextField({ label, id, hint, error, ...inputProps }: Props) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-error` : undefined;
  const describedBy = [errId, hintId].filter(Boolean).join(' ') || undefined;
  const isRequired = Boolean(inputProps.required);
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span>{label}</span>
        {isRequired ? (
          <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-violet-700 ring-1 ring-violet-100">
            Required
          </span>
        ) : null}
      </label>
      <input
        id={id}
        className={`${FORM_INPUT} ${error ? 'border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-500/20' : ''}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...inputProps}
      />
      {error ? (
        <p id={errId} className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {hint ? (
        <p id={hintId} className="text-xs text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
