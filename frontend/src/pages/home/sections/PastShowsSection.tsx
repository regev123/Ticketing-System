import { ShowCard, ShowsPagination } from '@/components';
import { PAGE_SIZE_OPTIONS } from '@/hooks/usePagination';
import type { Show } from '@/types/api';

type Props = {
  shows: Show[];
  page: number;
  totalPages: number;
  pageSize: number;
  rangeStart: number;
  rangeEnd: number;
  totalItems: number;
  setPage: (page: number) => void;
  setPageSize: (size: (typeof PAGE_SIZE_OPTIONS)[number]) => void;
};

export function PastShowsSection({
  shows,
  page,
  totalPages,
  pageSize,
  rangeStart,
  rangeEnd,
  totalItems,
  setPage,
  setPageSize,
}: Props) {
  return (
    <section aria-labelledby="past-shows-heading">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="past-shows-heading" className="font-display text-2xl font-bold text-slate-900">
            Past events
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Previous events stay visible for browsing, but seat selection is closed.
          </p>
        </div>
      </div>

      {shows.length > 0 ? (
        <>
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {shows.map((show) => (
              <ShowCard key={show.id} show={show} />
            ))}
          </ul>
          <ShowsPagination
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            idPrefix="home-past-shows"
          />
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center">
          <p className="font-medium text-slate-800">No past events match these filters</p>
          <p className="mt-2 text-sm text-slate-500">
            Adjust search, categories, price, availability, date, location, or clear all filters.
          </p>
        </div>
      )}
    </section>
  );
}
