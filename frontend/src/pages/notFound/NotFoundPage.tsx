import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="relative isolate min-h-[78vh] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-30 bg-[radial-gradient(ellipse_75%_55%_at_50%_-10%,rgba(124,58,237,0.2),transparent)]" />
      <div className="pointer-events-none absolute -left-24 top-24 -z-20 h-64 w-64 rounded-full bg-fuchsia-300/25 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -right-24 bottom-24 -z-20 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl animate-pulse" />

      <section className="mx-auto flex max-w-5xl flex-col items-center px-4 pb-14 pt-14 sm:px-6 lg:px-8">
        <div className="relative mb-7 flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-violet-300/60 animate-[spin_8s_linear_infinite]" />
          <div className="absolute inset-3 rounded-full border border-fuchsia-300/60 animate-[spin_6s_linear_infinite_reverse]" />
          <div className="absolute h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-xl shadow-violet-500/40 animate-bounce" />
          <div className="absolute h-7 w-7 rounded-md bg-white/25 backdrop-blur-sm animate-pulse" />
        </div>

        <div className="w-full rounded-3xl border border-white/60 bg-white/85 p-8 text-center shadow-[0_8px_30px_rgba(15,23,42,0.08),0_24px_80px_-30px_rgba(91,33,182,0.5)] backdrop-blur-xl sm:p-11">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-700">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
            Error 404
          </div>

          <h1 className="mt-5 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Lost in the spotlight.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-slate-600 sm:text-base">
            This page does not exist anymore, or the URL is incorrect. Return to the homepage to continue browsing
            events.
          </p>

          <Link
            to="/"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:bg-violet-500 hover:shadow-violet-500/40"
          >
            Go to homepage
          </Link>
        </div>
      </section>
    </div>
  );
}
