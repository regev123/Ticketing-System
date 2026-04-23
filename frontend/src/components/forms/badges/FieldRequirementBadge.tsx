import { PillBadge } from './PillBadge';

type Props = {
  required?: boolean;
  showOptional?: boolean;
};

export function FieldRequirementBadge({ required = false, showOptional = false }: Props) {
  if (required) {
    return (
      <PillBadge className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-violet-700 ring-1 ring-violet-100">
        Required
      </PillBadge>
    );
  }

  if (showOptional) {
    return (
      <PillBadge className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-slate-600 ring-1 ring-slate-200/80">
        Optional
      </PillBadge>
    );
  }

  return null;
}
