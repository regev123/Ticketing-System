import type { ReactNode } from 'react';
import { FieldRequirementBadge } from './badges';

type Props = {
  id?: string;
  htmlFor?: string;
  children: ReactNode;
  required?: boolean;
  optional?: boolean;
  className?: string;
};

export function FormFieldLabel({
  id,
  htmlFor,
  children,
  required = false,
  optional = false,
  className,
}: Props) {
  return (
    <label
      id={id}
      htmlFor={htmlFor}
      className={
        className ??
        'flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500'
      }
    >
      <span>{children}</span>
      <FieldRequirementBadge required={required} showOptional={optional} />
    </label>
  );
}
