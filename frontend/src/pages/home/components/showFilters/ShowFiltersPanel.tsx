import type { Dispatch, SetStateAction } from 'react';
import { useId } from 'react';
import { SHOW_SORT_OPTIONS } from '@/config/showSortOptions';
import { FormSelect } from '@/components/forms';
import { FORM_INPUT_SM } from '@/components/forms/formStyles';
import { RotateIcon, SearchIcon, SlidersIcon } from '@/components/icons';
import { useShowFiltersRefine } from '@/hooks/useShowFiltersRefine';
import {
  defaultShowBrowseFilterState,
  hasActiveTextFilter,
  hasAnyBrowseFilterActive,
  hasNonDefaultSort,
  type ShowBrowseFilterState,
} from '@/utils/showBrowseFilters';
import { ShowFiltersRefineBlock } from './ShowFiltersRefineBlock';

type Props = {
  browse: ShowBrowseFilterState;
  setBrowse: Dispatch<SetStateAction<ShowBrowseFilterState>>;
};

export function ShowFiltersPanel({ browse, setBrowse }: Props) {
  const baseId = useId();
  const refine = useShowFiltersRefine(browse);

  const searchActive = hasActiveTextFilter(browse.textQuery);
  const sortActive = hasNonDefaultSort(browse.sort);
  const anyActive = hasAnyBrowseFilterActive(browse);

  const clearAll = () => {
    setBrowse(defaultShowBrowseFilterState());
  };

  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-violet-50/[0.35] to-slate-50/90 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.08),0_4px_16px_-4px_rgba(91,33,182,0.06)] ring-1 ring-slate-900/[0.03]"
      aria-labelledby={`${baseId}-filters-title`}
    >
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-violet-400/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-fuchsia-400/10 blur-3xl"
        aria-hidden
      />

      <div className="relative p-5 sm:p-6 lg:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-600/25 ring-2 ring-white/30"
              aria-hidden
            >
              <SlidersIcon />
            </div>
            <div className="min-w-0 pt-0.5">
              <h2
                id={`${baseId}-filters-title`}
                className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
              >
                Find your show
              </h2>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">
                Search and sort are always here. Open <span className="font-medium text-slate-800">Refine</span> when
                you want dates, place, categories, or price.
              </p>
            </div>
          </div>
          {anyActive ? (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-slate-200/90 bg-white/90 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
            >
              <RotateIcon />
              Reset all
            </button>
          ) : null}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200/60 bg-white/60 p-4 shadow-inner shadow-slate-900/[0.03] backdrop-blur-sm sm:p-5">
          <div className="grid gap-5 lg:grid-cols-[1fr_minmax(220px,280px)] lg:items-end">
            <div className="space-y-2">
              <label
                htmlFor={`${baseId}-search`}
                className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"
              >
                Search
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <SearchIcon className="h-4 w-4" />
                </span>
                <input
                  id={`${baseId}-search`}
                  type="search"
                  autoComplete="off"
                  placeholder="Title or description..."
                  value={browse.textQuery}
                  onChange={(e) => setBrowse((s) => ({ ...s, textQuery: e.target.value }))}
                  className={`${FORM_INPUT_SM} placeholder:text-slate-400 min-h-[44px] w-full border-slate-200/90 bg-white/90 pl-10 font-medium shadow-sm transition focus:border-violet-400 focus:ring-violet-500/20`}
                />
              </div>
              <p className="min-h-[2.5rem] text-xs leading-snug text-slate-500">
                {searchActive ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-800 ring-1 ring-emerald-200/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Matching title or description
                  </span>
                ) : (
                  'Optional — narrows the list instantly'
                )}
              </p>
            </div>

            <div className="space-y-2">
              <label
                id={`${baseId}-sort-label`}
                htmlFor={`${baseId}-sort`}
                className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"
              >
                Sort by
              </label>
              <FormSelect
                id={`${baseId}-sort`}
                value={browse.sort}
                options={SHOW_SORT_OPTIONS}
                onChange={(value) =>
                  setBrowse((s) => ({ ...s, sort: value as ShowBrowseFilterState['sort'] }))
                }
                ariaLabelledBy={`${baseId}-sort-label`}
                className="min-h-[44px] border-slate-200/90 bg-white/90 shadow-sm"
              />
              <p className="min-h-[2.5rem] text-xs leading-snug text-slate-500">
                {sortActive ? (
                  <span className="text-violet-700">Custom order applied to results</span>
                ) : (
                  '\u00a0'
                )}
              </p>
            </div>
          </div>
        </div>

        <ShowFiltersRefineBlock baseId={baseId} browse={browse} setBrowse={setBrowse} refine={refine} />
      </div>
    </section>
  );
}
