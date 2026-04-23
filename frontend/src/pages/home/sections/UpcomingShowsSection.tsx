import { ShowCard, ShowsPagination } from '@/components';
import { PAGE_SIZE_OPTIONS } from '@/hooks/usePagination';
import type { SeatAvailability, Show } from '@/types/api';

type Props = {
  filtersActive: boolean;
  filteredCount: number;
  totalCount: number;
  paginatedShows: Show[];
  availabilityByShowId: Record<string, SeatAvailability | null>;
  availabilityPendingByShowId: Record<string, boolean>;
  availabilityErrorByShowId: Record<string, boolean>;
  page: number;
  totalPages: number;
  pageSize: number;
  rangeStart: number;
  rangeEnd: number;
  setPage: (page: number) => void;
  setPageSize: (size: (typeof PAGE_SIZE_OPTIONS)[number]) => void;
};

export function UpcomingShowsSection({
  filtersActive,
  filteredCount,
  totalCount,
  paginatedShows,
  availabilityByShowId,
  availabilityPendingByShowId,
  availabilityErrorByShowId,
  page,
  totalPages,
  pageSize,
  rangeStart,
  rangeEnd,
  setPage,
  setPageSize,
}: Props) {
  return (
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
              <ShowCard
                key={show.id}
                show={show}
                availability={availabilityByShowId[show.id] ?? undefined}
                isAvailabilityPending={availabilityPendingByShowId[show.id] ?? false}
                isAvailabilityError={availabilityErrorByShowId[show.id] ?? false}
              />
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
  );
}
