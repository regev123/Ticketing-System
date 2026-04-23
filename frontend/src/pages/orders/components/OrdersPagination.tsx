import { PAGE_SIZE_OPTIONS } from '@/hooks/usePagination';

type Props = {
  page: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: (typeof PAGE_SIZE_OPTIONS)[number]) => void;
};

export function OrdersPagination({
  page,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: Props) {
  if (totalItems <= 0) return null;

  const canPrev = page > 1;
  const canNext = page < Math.max(totalPages, 1);
  const rangeStart = (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalItems);

  return (
    <nav className="flex flex-col gap-4 border-t border-slate-200/90 pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <p className="text-sm text-slate-600">
        <span className="font-medium text-slate-800">
          Showing {rangeStart.toLocaleString()}–{rangeEnd.toLocaleString()}
        </span>{' '}
        of {totalItems.toLocaleString()} order{totalItems === 1 ? '' : 's'}
      </p>
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <label htmlFor="orders-page-size" className="flex items-center gap-2 text-sm text-slate-600">
          <span className="whitespace-nowrap">Per page</span>
          <select
            id="orders-page-size"
            value={pageSize}
            onChange={(event) =>
              onPageSizeChange(Number(event.target.value) as (typeof PAGE_SIZE_OPTIONS)[number])
            }
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm outline-none ring-violet-500/0 transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30"
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={!canPrev}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="First page"
          >
            «
          </button>
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={!canPrev}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            Previous
          </button>
          <span className="min-w-[7rem] px-2 text-center text-sm tabular-nums text-slate-600">
            Page {page} of {Math.max(totalPages, 1)}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={!canNext}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            Next
          </button>
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={!canNext}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Last page"
          >
            »
          </button>
        </div>
      </div>
    </nav>
  );
}
