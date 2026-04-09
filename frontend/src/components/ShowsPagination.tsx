import { PAGE_SIZE_OPTIONS } from '@/hooks/usePagination';

type Props = {
  page: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  rangeStart: number;
  rangeEnd: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: (typeof PAGE_SIZE_OPTIONS)[number]) => void;
  /** Optional id prefix for labels (a11y). */
  idPrefix?: string;
};

export function ShowsPagination({
  page,
  totalPages,
  pageSize,
  totalItems,
  rangeStart,
  rangeEnd,
  onPageChange,
  onPageSizeChange,
  idPrefix = 'shows-pag',
}: Props) {
  if (totalItems === 0) return null;

  const canPrev = page > 1;
  const canNext = totalPages > 0 && page < totalPages;
  const labelId = `${idPrefix}-label`;

  return (
    <nav
      className="flex flex-col gap-4 border-t border-slate-200/90 pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
      aria-labelledby={labelId}
    >
      <p id={labelId} className="text-sm text-slate-600">
        <span className="font-medium text-slate-800">
          Showing {rangeStart.toLocaleString()}–{rangeEnd.toLocaleString()}
        </span>{' '}
        of {totalItems.toLocaleString()} show{totalItems === 1 ? '' : 's'}
      </p>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <label htmlFor={`${idPrefix}-size`} className="flex items-center gap-2 text-sm text-slate-600">
          <span className="whitespace-nowrap">Per page</span>
          <select
            id={`${idPrefix}-size`}
            value={pageSize}
            onChange={(e) =>
              onPageSizeChange(Number(e.target.value) as (typeof PAGE_SIZE_OPTIONS)[number])
            }
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm outline-none ring-violet-500/0 transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
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
