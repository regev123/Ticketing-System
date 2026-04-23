import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShowsPagination } from '@/components';
import { ArrowRightIcon, CalendarIcon, MapPinIcon, SearchIcon } from '@/components/icons';
import { usePagination, useShows } from '@/hooks';
import { formatDate } from '@/utils';

export function ManageShowsPage() {
  const { data: shows, isLoading, isError } = useShows();
  const [searchQuery, setSearchQuery] = useState('');
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredShows = useMemo(() => {
    if (!shows) return [];
    if (!normalizedQuery) return shows;
    return shows.filter((show) => {
      const haystack = [
        show.title,
        show.venue?.venueName,
        show.venue?.city,
        show.venue?.country,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [shows, normalizedQuery]);

  const totalItems = filteredShows.length;
  const { page, setPage, pageSize, setPageSize, totalPages, rangeStart, rangeEnd, sliceItems } =
    usePagination(totalItems, normalizedQuery);
  const paginatedShows = sliceItems(filteredShows);

  return (
    <div className="relative min-h-[70vh]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_75%_45%_at_50%_-10%,rgba(124,58,237,0.16),transparent)]" />
      <div className="mx-auto max-w-4xl px-4 pb-12 pt-2 sm:px-6 lg:px-8">
        <nav className="mb-6">
          <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-violet-50/40 to-fuchsia-50/30 p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_16px_48px_-12px_rgba(91,33,182,0.15)] sm:p-8">
            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Update existing show
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Find an event quickly, review key details, and jump into the edit flow.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/85 px-3 py-1.5 text-xs font-medium text-violet-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {totalItems} matching show{totalItems === 1 ? '' : 's'}
            </div>
          </div>
        </nav>

        <div className="mb-4 rounded-2xl border border-slate-200/80 bg-white/90 p-2 shadow-sm backdrop-blur">
          <label htmlFor="manage-shows-search" className="sr-only">
            Search shows
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/25">
            <SearchIcon className="h-4 w-4 text-violet-500" />
            <input
              id="manage-shows-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, venue, city, or country..."
              className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_1px_3px_rgba(15,23,42,0.05),0_16px_40px_-16px_rgba(91,33,182,0.2)]">
          {isLoading ? <p className="p-5 text-sm text-slate-500">Loading shows…</p> : null}
          {isError ? <p className="p-5 text-sm text-red-600">Could not load shows.</p> : null}
          {!isLoading && !isError && (!shows || shows.length === 0) ? (
            <p className="p-5 text-sm text-slate-500">No shows found.</p>
          ) : null}
          {!isLoading && !isError && shows && shows.length > 0 && filteredShows.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">No shows match your search.</p>
          ) : null}

          {!isLoading && !isError && filteredShows.length > 0 ? (
            <>
              <ul className="space-y-3 p-3 sm:p-4">
                {paginatedShows.map((show) => (
                  <li
                    key={show.id}
                    className="group flex flex-col gap-4 rounded-xl border border-slate-200/80 bg-gradient-to-r from-white to-violet-50/35 p-4 transition hover:border-violet-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{show.title}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarIcon className="h-3.5 w-3.5 text-violet-500" />
                          {formatDate(show.startTime)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPinIcon className="h-3.5 w-3.5 text-violet-500" />
                          {show.venue.venueName}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/admin/shows/${show.id}/edit`}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
                    >
                      Edit show
                      <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="border-t border-slate-100 p-5 pt-4">
                <ShowsPagination
                  page={page}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={totalItems}
                  rangeStart={rangeStart}
                  rangeEnd={rangeEnd}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                  idPrefix="admin-manage-shows"
                />
              </div>
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
}
