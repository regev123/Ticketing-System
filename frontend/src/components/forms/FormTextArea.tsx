import type { TextareaHTMLAttributes } from 'react';
import { FORM_INPUT } from './formStyles';
import { FormFieldLabel } from './FormFieldLabel';

type Props = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> & {
  label: string;
  id: string;
  hint?: string;
  error?: string;
  optional?: boolean;
};

export function FormTextArea({ label, id, hint, error, optional = false, ...inputProps }: Props) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-error` : undefined;
  const describedBy = [errId, hintId].filter(Boolean).join(' ') || undefined;
  const isRequired = Boolean(inputProps.required);

  return (
    <div className="space-y-1.5">
      <FormFieldLabel htmlFor={id} required={isRequired} optional={optional && !isRequired}>
        {label}
      </FormFieldLabel>
      <textarea
        id={id}
        className={`${FORM_INPUT} ${
          error ? 'border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-500/20' : ''
        }`}
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
