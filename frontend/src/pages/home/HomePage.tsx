import { useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { usePagination, useShows } from '@/hooks';
import { availabilityApi } from '@/api/availability';
import { queryKeys } from '@/config/queryKeys';
import { ShowsGridSkeleton, ErrorMessage } from '@/components';
import {
  applyShowBrowseFilters,
  defaultShowBrowseFilterState,
  hasAnyBrowseFilterActive,
  type ShowBrowseFilterState,
} from '@/utils/showBrowseFilters';
import { HomeFiltersSection, HomeHeroSection, PastShowsSection, UpcomingShowsSection } from './sections';

type ShowsTab = 'upcoming' | 'past';

export function HomePage() {
  const { data: shows, isLoading, error, refetch } = useShows();
  const [browse, setBrowse] = useState<ShowBrowseFilterState>(defaultShowBrowseFilterState);
  const [activeTab, setActiveTab] = useState<ShowsTab>('upcoming');

  const filteredShows = useMemo(() => {
    const list = shows ?? [];
    return applyShowBrowseFilters(list, browse);
  }, [shows, browse]);
  const { upcomingShows, pastShows } = useMemo(() => {
    const now = Date.now();
    const upcoming: typeof filteredShows = [];
    const past: typeof filteredShows = [];
    for (const show of filteredShows) {
      const startMs = Date.parse(show.startTime);
      if (Number.isFinite(startMs) && startMs <= now) {
        past.push(show);
      } else {
        upcoming.push(show);
      }
    }
    return { upcomingShows: upcoming, pastShows: past };
  }, [filteredShows]);

  const upcomingFilteredCount = upcomingShows.length;
  const {
    page: upcomingPage,
    setPage: setUpcomingPage,
    pageSize: upcomingPageSize,
    setPageSize: setUpcomingPageSize,
    totalPages: upcomingTotalPages,
    rangeStart: upcomingRangeStart,
    rangeEnd: upcomingRangeEnd,
    sliceItems: sliceUpcomingItems,
  } = usePagination(upcomingFilteredCount, browse);

  const paginatedShows = useMemo(
    () => sliceUpcomingItems(upcomingShows),
    [upcomingShows, sliceUpcomingItems]
  );
  const pastFilteredCount = pastShows.length;
  const {
    page: pastPage,
    setPage: setPastPage,
    pageSize: pastPageSize,
    setPageSize: setPastPageSize,
    totalPages: pastTotalPages,
    rangeStart: pastRangeStart,
    rangeEnd: pastRangeEnd,
    sliceItems: slicePastItems,
  } = usePagination(pastFilteredCount, browse);
  const paginatedPastShows = useMemo(
    () => slicePastItems(pastShows),
    [pastShows, slicePastItems]
  );

  const totalCount = shows?.length ?? 0;
  const filtersActive = hasAnyBrowseFilterActive(browse);
  const availabilityQueries = useQueries({
    queries: paginatedShows.map((show) => ({
      queryKey: queryKeys.availability(show.id),
      queryFn: () => availabilityApi.getByShowId(show.id),
      staleTime: 0,
    })),
  });
  const availabilityByShowId = useMemo(
    () => Object.fromEntries(
      paginatedShows.map((show, index) => [show.id, availabilityQueries[index]?.data ?? null])
    ),
    [availabilityQueries, paginatedShows]
  );
  const availabilityPendingByShowId = useMemo(
    () => Object.fromEntries(
      paginatedShows.map((show, index) => [show.id, Boolean(availabilityQueries[index]?.isPending)])
    ),
    [availabilityQueries, paginatedShows]
  );
  const availabilityErrorByShowId = useMemo(
    () => Object.fromEntries(
      paginatedShows.map((show, index) => [show.id, Boolean(availabilityQueries[index]?.isError)])
    ),
    [availabilityQueries, paginatedShows]
  );

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
      <HomeHeroSection totalCount={totalCount} />
      <HomeFiltersSection totalCount={totalCount} browse={browse} setBrowse={setBrowse} />

      {totalCount > 0 ? (
        <>
          <section
            aria-label="Show timeline tabs"
            className="inline-flex w-fit rounded-xl border border-slate-200/80 bg-white/80 p-1 shadow-sm"
          >
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('upcoming')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === 'upcoming'
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                Upcoming shows
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('past')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === 'past'
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                Past events
              </button>
            </div>
          </section>

          {activeTab === 'upcoming' ? (
            <UpcomingShowsSection
              filtersActive={filtersActive}
              filteredCount={upcomingFilteredCount}
              totalCount={totalCount}
              paginatedShows={paginatedShows}
              availabilityByShowId={availabilityByShowId}
              availabilityPendingByShowId={availabilityPendingByShowId}
              availabilityErrorByShowId={availabilityErrorByShowId}
              page={upcomingPage}
              totalPages={upcomingTotalPages}
              pageSize={upcomingPageSize}
              rangeStart={upcomingRangeStart}
              rangeEnd={upcomingRangeEnd}
              setPage={setUpcomingPage}
              setPageSize={setUpcomingPageSize}
            />
          ) : (
            <PastShowsSection
              shows={paginatedPastShows}
              page={pastPage}
              totalPages={pastTotalPages}
              pageSize={pastPageSize}
              rangeStart={pastRangeStart}
              rangeEnd={pastRangeEnd}
              totalItems={pastFilteredCount}
              setPage={setPastPage}
              setPageSize={setPastPageSize}
            />
          )}
        </>
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
