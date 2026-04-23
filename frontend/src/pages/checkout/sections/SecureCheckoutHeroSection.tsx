import { CountdownCircleTimer } from '@/components';

type Props = {
  secondsLeft: number;
  holdTotalSeconds: number;
  holdState: 'expired' | 'ending-soon' | 'active';
};

export function SecureCheckoutHeroSection({ secondsLeft, holdTotalSeconds, holdState }: Props) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-950 via-slate-900 to-slate-950 px-6 py-7 text-white shadow-2xl shadow-violet-950/40 sm:px-8 sm:py-9">
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-fuchsia-500/15 blur-3xl" />
      <div className="relative grid items-center gap-5 lg:grid-cols-2 lg:gap-5 xl:gap-8">
        <div className="min-w-0">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-300/90">Secure checkout</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight whitespace-nowrap sm:text-4xl lg:text-5xl">
            Complete your booking
          </h1>
          <p className="mt-2.5 max-w-xl text-base text-slate-300/95 sm:text-lg">
            Review your selected seats, confirm your order, and lock in your tickets before the hold expires.
          </p>
        </div>
        <div className="flex min-h-[120px] items-center justify-center lg:min-h-[140px] lg:justify-end">
          <div className="rounded-2xl border border-white/25 bg-white/10 p-2.5 backdrop-blur-sm">
            <p className="pb-1 text-center text-[10px] font-semibold uppercase tracking-wide text-violet-100">
              Hold timer
            </p>
            <CountdownCircleTimer
              secondsLeft={secondsLeft}
              totalSeconds={holdTotalSeconds}
              size={64}
              strokeWidth={4}
              hideWhenComplete={false}
              textClassName="fill-white"
              trackColor="rgba(255,255,255,0.35)"
              activeRingColor="#ffffff"
              expiredRingColor="#94a3b8"
            />
            <p
              className={`pt-1 text-center text-[11px] font-semibold ${
                holdState === 'expired'
                  ? 'text-slate-300'
                  : holdState === 'ending-soon'
                    ? 'text-amber-200'
                    : 'text-emerald-200'
              }`}
            >
              {holdState === 'expired'
                ? 'Hold expired'
                : holdState === 'ending-soon'
                  ? 'Ending soon'
                  : 'Hold active'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
