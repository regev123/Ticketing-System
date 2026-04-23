import type { CurrencyOption } from '@/data/currencies';
import { FormSelect } from './FormSelect';

type Props = {
  id: string;
  /** ISO code — shown on the closed trigger only. */
  value: string;
  options: CurrencyOption[];
  onChange: (code: string) => void;
  /** Associates the listbox with the visible field label (accessibility). */
  ariaLabelledBy?: string;
  className?: string;
};

export function CurrencySelect({ id, value, options, onChange, ariaLabelledBy, className }: Props) {
  return (
    <FormSelect
      id={id}
      value={value}
      options={options.map((opt) => ({ value: opt.code, label: opt.label, triggerLabel: opt.code }))}
      onChange={onChange}
      ariaLabelledBy={ariaLabelledBy}
      className={className}
    />
  );
}
