import { HeroConcertGraphic } from '@/components';

type Props = {
  totalCount: number;
};

export function HomeHeroSection({ totalCount }: Props) {
  return (
    <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-950 via-slate-900 to-slate-950 px-6 py-10 text-white shadow-2xl shadow-violet-950/40 sm:px-10 sm:py-14">
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-fuchsia-500/15 blur-3xl" />
      <div className="relative grid items-center gap-8 lg:grid-cols-2 lg:gap-6 xl:gap-10">
        <div className="min-w-0">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-300/90">
            Concerts & live events
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Find your next
            <span className="block bg-gradient-to-r from-white via-violet-100 to-violet-300 bg-clip-text">
              night out
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-slate-300/95">
            Browse upcoming shows, pick your seats, and hold tickets in seconds — all in one place.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-sm ring-1 ring-white/15">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              {totalCount} show{totalCount === 1 ? '' : 's'} on sale
            </span>
          </div>
        </div>
        <div className="flex min-h-[200px] justify-center lg:min-h-[240px] lg:justify-end">
          <HeroConcertGraphic />
        </div>
      </div>
    </header>
  );
}
