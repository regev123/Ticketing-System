import { useCallback, useEffect, useState } from 'react';

export const PAGE_SIZE_OPTIONS = [12, 24, 48, 96] as const;

type Options = {
  /** @default 12 */
  initialPageSize?: (typeof PAGE_SIZE_OPTIONS)[number];
};

/**
 * Client-side pagination. Pass `filterKey` (e.g. browse filter state); when it changes, page resets to 1.
 */
export function usePagination(totalItems: number, filterKey: unknown, options?: Options) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(options?.initialPageSize ?? 12);

  useEffect(() => {
    setPage(1);
  }, [filterKey]);

  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const rangeStart = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalItems);

  const sliceItems = useCallback(
    <T,>(items: T[]): T[] => {
      const start = (page - 1) * pageSize;
      return items.slice(start, start + pageSize);
    },
    [page, pageSize]
  );

  const setPageSizeAndReset = useCallback((size: (typeof PAGE_SIZE_OPTIONS)[number]) => {
    setPageSize(size);
    setPage(1);
  }, []);

  return {
    page,
    setPage,
    pageSize,
    setPageSize: setPageSizeAndReset,
    totalPages,
    rangeStart,
    rangeEnd,
    sliceItems,
  };
}
