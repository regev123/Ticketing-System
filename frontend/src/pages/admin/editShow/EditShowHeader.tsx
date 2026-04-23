import { Link } from 'react-router-dom';

export function EditShowHeader() {
  return (
    <nav className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Link
          to="/admin/shows"
          className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 transition hover:text-violet-500"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </span>
          Back to show list
        </Link>
        <h1 className="font-display mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Update event
        </h1>
        <p className="mt-2 max-w-xl text-base text-slate-600">
          Update event details, schedule, location, and cover artwork. Seating and pricing are read-only in this
          version.
        </p>
      </div>
    </nav>
  );
}
