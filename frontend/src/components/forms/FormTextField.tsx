import type { InputHTMLAttributes } from 'react';
import { FORM_INPUT } from './formStyles';
import { FormFieldLabel } from './FormFieldLabel';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'required'> & {
  label: string;
  id: string;
  hint?: string;
  error?: string;
  /** Show “Required” badge next to the label only when true */
  required?: boolean;
  /** Show “Optional” badge next to the label only when true */
  optional?: boolean;
  /** Native HTML `required` on the input (validation); independent of badges */
  inputRequired?: boolean;
};

export function FormTextField({
  label,
  id,
  hint,
  error,
  required,
  optional,
  inputRequired,
  ...inputProps
}: Props) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-error` : undefined;
  const describedBy = [errId, hintId].filter(Boolean).join(' ') || undefined;
  return (
    <div className="space-y-1.5">
      <FormFieldLabel htmlFor={id} required={Boolean(required)} optional={Boolean(optional)}>
        {label}
      </FormFieldLabel>
      <input
        id={id}
        className={`${FORM_INPUT} ${error ? 'border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-500/20' : ''}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...inputProps}
        required={inputRequired}
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
