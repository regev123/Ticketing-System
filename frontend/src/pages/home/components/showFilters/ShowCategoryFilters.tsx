import { EVENT_CATEGORY_OPTIONS } from '@/data/eventCategories';
import type { EventCategory } from '@/types/api';

type Props = {
  selected: EventCategory[];
  onChange: (next: EventCategory[]) => void;
  idPrefix?: string;
};

function toggle(selected: EventCategory[], cat: EventCategory): EventCategory[] {
  if (selected.includes(cat)) return selected.filter((c) => c !== cat);
  return [...selected, cat];
}

export function ShowCategoryFilters({ selected, onChange, idPrefix = 'cat-filter' }: Props) {
  return (
    <div className="space-y-5" role="group" aria-label="Event categories">
      <p className="text-sm leading-relaxed text-slate-600">
        Tap one or more types.{' '}
        <span className="font-medium text-slate-800">Leave empty</span> to include every category.
      </p>
      <div className="flex flex-wrap gap-2.5">
        {EVENT_CATEGORY_OPTIONS.map((opt) => {
          const isOn = selected.includes(opt.value);
          const id = `${idPrefix}-${opt.value}`;
          return (
            <label
              key={opt.value}
              htmlFor={id}
              className={`group inline-flex cursor-pointer items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-sm transition-all duration-200 ${
                isOn
                  ? 'border-violet-400/80 bg-gradient-to-br from-violet-50 to-fuchsia-50/80 text-violet-950 shadow-md shadow-violet-500/10 ring-2 ring-violet-500/25'
                  : 'border-slate-200/90 bg-white/80 text-slate-700 shadow-sm hover:border-violet-200 hover:bg-violet-50/40 hover:shadow-md'
              }`}
            >
              <input
                id={id}
                type="checkbox"
                checked={isOn}
                onChange={() => onChange(toggle(selected, opt.value))}
                className="sr-only"
              />
              <span
                className={`font-semibold ${isOn ? 'text-violet-900' : 'text-slate-800 group-hover:text-violet-900'}`}
              >
                {opt.label}
              </span>
            </label>
          );
        })}
      </div>
      {selected.length > 0 ? (
        <button
          type="button"
          onClick={() => onChange([])}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 underline-offset-4 transition hover:text-violet-500 hover:underline"
        >
          Clear selection
        </button>
      ) : null}
    </div>
  );
}
