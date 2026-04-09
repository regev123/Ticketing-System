import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePagination, useShows } from '@/hooks';
import {
  ShowCard,
  ShowFiltersPanel,
  ShowsGridSkeleton,
  ShowsPagination,
  ErrorMessage,
  HeroConcertGraphic,
} from '@/components';
import {
  applyShowBrowseFilters,
  defaultShowBrowseFilterState,
  hasAnyBrowseFilterActive,
  type ShowBrowseFilterState,
} from '@/utils/showBrowseFilters';

export function HomePage() {
  const { data: shows, isLoading, error, refetch } = useShows();
  const [browse, setBrowse] = useState<ShowBrowseFilterState>(defaultShowBrowseFilterState);

  const filteredShows = useMemo(() => {
    const list = shows ?? [];
    return applyShowBrowseFilters(list, browse);
  }, [shows, browse]);

  const filteredCount = filteredShows.length;
  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    rangeStart,
    rangeEnd,
    sliceItems,
  } = usePagination(filteredCount, browse);

  const paginatedShows = useMemo(
    () => sliceItems(filteredShows),
    [filteredShows, sliceItems]
  );

  const totalCount = shows?.length ?? 0;
  const filtersActive = hasAnyBrowseFilterActive(browse);

  if (isLoading) {
    return (
      <div className="space-y-10">
        <header className="space-y-2">
          <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200/80" />
          <div className="h-10 max-w-md animate-pulse rounded-lg bg-slate-200/80" />
          <div className="h-5 max-w-lg animate-pulse rounded bg-slate-100" />
        </header>
        <ShowsGridSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg">
        <ErrorMessage
          message={error instanceof Error ? error.message : 'Failed to load shows'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-8">
      {/* Hero */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-950 via-slate-900 to-slate-950 px-6 py-10 text-white shadow-2xl shadow-violet-950/40 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="relative grid items-center gap-8 lg:grid-cols-2 lg:gap-6 xl:gap-10">
          <div className="min-w-0">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-300/90">
              Concerts & live events
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Find your next
              <span className="block bg-gradient-to-r from-white via-violet-100 to-violet-300 bg-clip-text text-transparent">
                night out
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-300/95">
              Browse upcoming shows, pick your seats, and hold tickets in seconds — all in one place.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-sm ring-1 ring-white/15">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                {totalCount} show{totalCount === 1 ? '' : 's'} on sale
              </span>
              <Link
                to="/admin"
                className="text-sm font-medium text-violet-200 underline-offset-4 transition hover:text-white hover:underline"
              >
                Admin · add a show
              </Link>
            </div>
          </div>
          <div className="flex min-h-[200px] justify-center lg:min-h-[240px] lg:justify-end">
            <HeroConcertGraphic />
          </div>
        </div>
      </header>

      {totalCount > 0 && <ShowFiltersPanel browse={browse} setBrowse={setBrowse} />}

      {/* Grid */}
      {totalCount > 0 ? (
        <section aria-labelledby="shows-heading">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="shows-heading" className="font-display text-2xl font-bold text-slate-900">
                Upcoming shows
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {filtersActive ? (
                  <>
                    Showing {filteredCount} of {totalCount} show{totalCount === 1 ? '' : 's'}
                    {filteredCount === 0
                      ? ' — try adjusting search, sort, date, location, category, or price'
                      : ''}
                  </>
                ) : (
                  'Tap a card to choose seats'
                )}
              </p>
            </div>
          </div>
          {filteredCount > 0 ? (
            <>
              <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {paginatedShows.map((show) => (
                  <ShowCard key={show.id} show={show} />
                ))}
              </ul>
              <ShowsPagination
                page={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={filteredCount}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                idPrefix="home-shows"
              />
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center">
              <p className="font-medium text-slate-800">No shows match these filters</p>
              <p className="mt-2 text-sm text-slate-500">
                Adjust search, categories, price, availability, date, location, or clear all filters.
              </p>
            </div>
          )}
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/80 py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 9V4.5M9 15H7.5a2.25 2.25 0 01-2.25-2.25v-9A2.25 2.25 0 017.5 1.875h9A2.25 2.25 0 0118.75 4.5v9a2.25 2.25 0 01-2.25 2.25H15M9 9h3.75m-3.75 3h6m-9 3h3.375c.621 0 1.125.504 1.125 1.125v9.75a8.625 8.625 0 01-8.625-8.625V12A1.125 1.125 0 019 10.5z"
              />
            </svg>
          </div>
          <p className="font-display text-xl font-semibold text-slate-800">No shows yet</p>
          <p className="mt-2 max-w-sm text-slate-500">
            Add a concert or event from the admin panel to see it listed here.
          </p>
          <Link
            to="/admin"
            className="mt-6 inline-flex items-center rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:bg-violet-500"
          >
            Go to admin
          </Link>
        </div>
      )}
    </div>
  );
}
