/** Skeleton placeholders while shows load — aligned with compact ShowCard layout. */
export function ShowsGridSkeleton() {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <li
          key={i}
          className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_24px_-8px_rgba(15,23,42,0.09)] ring-1 ring-slate-200/70 sm:rounded-[1.2rem]"
        >
          <div className="aspect-[2/1] animate-pulse bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 sm:aspect-[2.2/1]" />
          <div className="space-y-2 p-3.5 sm:p-4">
            <div className="h-5 w-[88%] animate-pulse rounded-md bg-slate-200/90 sm:h-6" />
            <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
            <div className="mt-3 space-y-2">
              <div className="flex gap-2 rounded-xl border border-slate-100 p-2 sm:gap-2.5 sm:p-2.5">
                <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-violet-100 sm:h-9 sm:w-9 sm:rounded-xl" />
                <div className="flex-1 space-y-1.5 pt-0.5">
                  <div className="h-2 w-14 animate-pulse rounded bg-slate-200" />
                  <div className="h-3.5 w-full animate-pulse rounded bg-slate-200" />
                </div>
              </div>
              <div className="flex gap-2 rounded-xl border border-slate-100 p-2 sm:gap-2.5 sm:p-2.5">
                <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-slate-200 sm:h-9 sm:w-9 sm:rounded-xl" />
                <div className="flex-1 space-y-1.5 pt-0.5">
                  <div className="h-2 w-10 animate-pulse rounded bg-slate-200" />
                  <div className="h-3.5 w-full animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
              <div className="h-9 w-9 animate-pulse rounded-xl bg-violet-200 sm:h-10 sm:w-10 sm:rounded-2xl" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
