import type { Dispatch, SetStateAction } from 'react';
import { SHOW_FILTER_TABS } from '@/config/showFilterTabs';
import { ShowCategoryFilters } from '@/components/ShowCategoryFilters';
import { ShowDateTimeFilters } from '@/components/ShowDateTimeFilters';
import { ShowLocationFilters } from '@/components/ShowLocationFilters';
import { ShowPriceAvailabilityFilters } from '@/components/ShowPriceAvailabilityFilters';
import type { ShowBrowseFilterState } from '@/utils/showBrowseFilters';
import type { useShowFiltersRefine } from '@/hooks/useShowFiltersRefine';
import { IconChevronDown, IconSliders } from './ShowFiltersIcons';

type RefineHook = ReturnType<typeof useShowFiltersRefine>;

type Props = {
  baseId: string;
  browse: ShowBrowseFilterState;
  setBrowse: Dispatch<SetStateAction<ShowBrowseFilterState>>;
  refine: RefineHook;
};

export function ShowFiltersRefineBlock({ baseId, browse, setBrowse, refine }: Props) {
  const {
    activeTab,
    setActiveTab,
    refineOpen,
    setRefineOpen,
    refineGroups,
    summaryChips,
    openRefine,
    tabHasFilters,
  } = refine;

  return (
    <>
      <div className="mt-5">
        <button
          type="button"
          id={`${baseId}-refine-trigger`}
          aria-expanded={refineOpen}
          aria-controls={`${baseId}-refine-region`}
          onClick={() => setRefineOpen((o) => !o)}
          className="group relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-2xl border border-violet-200/70 bg-gradient-to-r from-violet-50/90 via-white to-fuchsia-50/40 px-4 py-4 text-left shadow-sm ring-1 ring-violet-100/60 transition hover:border-violet-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 sm:px-5"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm ring-1 ring-violet-100 transition group-hover:bg-violet-50">
              <IconSliders className="h-6 w-6" />
            </span>
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-display text-base font-bold text-slate-900 sm:text-lg">Refine results</span>
                {refineGroups > 0 ? (
                  <span className="inline-flex items-center rounded-full bg-violet-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm tabular-nums">
                    {refineGroups} active
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                    Optional
                  </span>
                )}
              </span>
              <span className="mt-0.5 block text-sm text-slate-600">
                {refineOpen
                  ? 'Date, location, categories, and price — press Esc to close'
                  : 'Tap to show advanced filters'}
              </span>
            </span>
          </span>
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 text-violet-600 shadow-sm ring-1 ring-slate-200/80 transition duration-300 group-hover:bg-violet-50 ${refineOpen ? 'rotate-180' : ''}`}
            aria-hidden
          >
            <IconChevronDown />
          </span>
        </button>

        {!refineOpen && summaryChips.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Active:</span>
            {summaryChips.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => openRefine(c.id)}
                className="inline-flex items-center gap-1.5 rounded-full border border-violet-200/80 bg-violet-50/80 px-3 py-1.5 text-xs font-semibold text-violet-900 shadow-sm transition hover:border-violet-300 hover:bg-violet-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
              >
                {c.label}
                <span className="text-violet-500" aria-hidden>
                  →
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div
        id={`${baseId}-refine-region`}
        role="region"
        aria-labelledby={`${baseId}-refine-trigger`}
        aria-hidden={!refineOpen}
        className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none ${refineOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className={`min-h-0 overflow-hidden ${!refineOpen ? 'pointer-events-none' : ''}`}>
          <div
            className={`pt-5 transition-opacity duration-200 motion-reduce:transition-none ${refineOpen ? 'opacity-100' : 'opacity-0'}`}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Choose a filter group</p>
            <div
              role="tablist"
              aria-label="Filter category"
              className="flex flex-wrap gap-1.5 rounded-2xl bg-slate-100/90 p-1.5 ring-1 ring-slate-200/80"
            >
              {SHOW_FILTER_TABS.map((tab) => {
                const selected = activeTab === tab.id;
                const dot = tabHasFilters(tab.id);
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    id={`${baseId}-tab-${tab.id}`}
                    aria-selected={selected}
                    aria-controls={`${baseId}-panel-${tab.id}`}
                    tabIndex={selected ? 0 : -1}
                    title={tab.description}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 sm:flex-none sm:justify-start sm:px-4 ${
                      selected
                        ? 'bg-white text-violet-900 shadow-md shadow-slate-900/10 ring-1 ring-slate-200/80'
                        : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate">{tab.label}</span>
                    {dot ? (
                      <span
                        className="h-2 w-2 shrink-0 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-sm ring-2 ring-white"
                        aria-label="Filters active in this category"
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 min-h-[8rem] rounded-2xl border border-dashed border-slate-200/90 bg-white/40 p-4 backdrop-blur-[2px] sm:p-5">
              {activeTab === 'datetime' && (
                <div
                  role="tabpanel"
                  id={`${baseId}-panel-datetime`}
                  aria-labelledby={`${baseId}-tab-datetime`}
                >
                  <ShowDateTimeFilters
                    embedded
                    idPrefix="home-filter-dt"
                    value={browse.dateTime}
                    onChange={(dateTime) => setBrowse((s) => ({ ...s, dateTime }))}
                  />
                </div>
              )}
              {activeTab === 'location' && (
                <div
                  role="tabpanel"
                  id={`${baseId}-panel-location`}
                  aria-labelledby={`${baseId}-tab-location`}
                >
                  <ShowLocationFilters
                    embedded
                    idPrefix="home-filter-loc"
                    value={browse.location}
                    onChange={(location) => setBrowse((s) => ({ ...s, location }))}
                  />
                </div>
              )}
              {activeTab === 'category' && (
                <div
                  role="tabpanel"
                  id={`${baseId}-panel-category`}
                  aria-labelledby={`${baseId}-tab-category`}
                >
                  <ShowCategoryFilters
                    idPrefix="home-filter-cat"
                    selected={browse.categories}
                    onChange={(categories) => setBrowse((s) => ({ ...s, categories }))}
                  />
                </div>
              )}
              {activeTab === 'price' && (
                <div role="tabpanel" id={`${baseId}-panel-price`} aria-labelledby={`${baseId}-tab-price`}>
                  <ShowPriceAvailabilityFilters
                    idPrefix="home-filter-price"
                    priceMin={browse.priceMin}
                    priceMax={browse.priceMax}
                    minCatalogSeats={browse.minCatalogSeats}
                    excludeEmptyInventory={browse.excludeEmptyInventory}
                    onPriceMinChange={(priceMin) => setBrowse((s) => ({ ...s, priceMin }))}
                    onPriceMaxChange={(priceMax) => setBrowse((s) => ({ ...s, priceMax }))}
                    onMinCatalogSeatsChange={(minCatalogSeats) =>
                      setBrowse((s) => ({ ...s, minCatalogSeats }))
                    }
                    onExcludeEmptyInventoryChange={(excludeEmptyInventory) =>
                      setBrowse((s) => ({ ...s, excludeEmptyInventory }))
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
