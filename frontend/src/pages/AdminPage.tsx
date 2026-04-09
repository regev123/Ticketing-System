import { Link } from 'react-router-dom';

export function AdminPage() {
  return (
    <div className="relative min-h-[60vh]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_40%_at_50%_-10%,rgba(124,58,237,0.1),transparent)]" />

      <div className="mx-auto max-w-3xl px-4 pb-12 pt-2 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-600">Console</p>
          <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Admin</h1>
          <p className="mt-3 max-w-lg text-base leading-relaxed text-slate-600">
            Manage your catalog — publish events, set layouts, and keep listings in sync with your venues.
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-1">
          <Link
            to="/admin/shows/new"
            className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-violet-50/40 to-fuchsia-50/30 p-1 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_12px_40px_-8px_rgba(91,33,182,0.12)] ring-1 ring-slate-900/[0.04] transition hover:border-violet-200/90 hover:shadow-[0_12px_48px_-8px_rgba(91,33,182,0.18)]"
          >
            <div className="rounded-[0.9rem] bg-white/60 p-6 backdrop-blur-sm sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/35">
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold text-slate-900">Create new event</h2>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">
                      Add a show with title, schedule, optional cover image, and seat sections with per-zone pricing.
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {['Schedule', 'Artwork', 'Seating'].map((tag) => (
                        <li
                          key={tag}
                          className="rounded-full bg-slate-100/90 px-2.5 py-0.5 text-xs font-medium text-slate-600"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <span className="flex shrink-0 items-center justify-center self-end rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-500/25 transition group-hover:bg-violet-500 sm:self-center">
                  Start
                  <svg className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">StagePass admin · catalog service</p>
      </div>
    </div>
  );
}
