import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getEventCategoryLabel } from '@/data/eventCategories';
import { formatDate, formatPrice, lowestPricedSeat } from '@/utils';
import { getShowCardImageUrl } from '@/data/concertImages';
import { useAvailability } from '@/hooks';
import type { Show } from '@/types/api';

function hueFromId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i) * (i + 1)) % 360;
  return h;
}

interface ShowCardProps {
  show: Show;
}

const badgeGlass =
  'inline-flex max-w-full items-center justify-center gap-0.5 rounded-full border px-2 py-1 text-[10px] font-semibold leading-none shadow-md backdrop-blur-md transition duration-300 sm:gap-1 sm:px-2.5 sm:py-1.5 sm:text-[11px]';

export function ShowCard({ show }: ShowCardProps) {
  const { data: availability, isPending, isError, isSuccess } = useAvailability(show.id);
  const startingOffer = isSuccess && availability ? lowestPricedSeat(availability.seats) : null;

  const hue = hueFromId(show.id);
  const catalogSeatTotal = show.seats?.length ?? 0;
  const availableCount = isSuccess && availability ? availability.seats.length : null;
  const imageUrl = getShowCardImageUrl(show);
  const categoryLabel = getEventCategoryLabel(show.category);
  const [imgFailed, setImgFailed] = useState(false);
  const v = show.venue;
  const cityCountry = [v?.city, v?.country].filter((s) => s?.trim()).join(', ');
  const addressLine = v?.address?.trim();

  return (
    <li className="h-full [contain:layout]">
      <Link
        to={`/shows/${show.id}`}
        className="group/card relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_24px_-8px_rgba(15,23,42,0.09),0_0_0_1px_rgba(15,23,42,0.04)] outline-none ring-1 ring-slate-200/70 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-[0_18px_36px_-10px_rgba(109,40,217,0.18),0_0_0_1px_rgba(139,92,246,0.1)] hover:ring-violet-200/90 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 sm:rounded-[1.2rem]"
      >
        {/* Accent bar — appears on hover */}
        <span
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[3px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 opacity-0 transition duration-500 group-hover/card:opacity-100"
          aria-hidden
        />

        <div className="relative aspect-[2/1] overflow-hidden sm:aspect-[2.2/1]">
          {!imgFailed && (
            <img
              src={imageUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out will-change-transform group-hover/card:scale-[1.06]"
              onError={() => setImgFailed(true)}
            />
          )}
          {imgFailed && (
            <div
              className="absolute inset-0 transition duration-700 ease-out group-hover/card:scale-[1.04]"
              style={{
                backgroundImage: `
                  linear-gradient(145deg, hsl(${hue}, 70%, 38%) 0%, hsl(${(hue + 45) % 360}, 60%, 26%) 45%, hsl(${(hue + 200) % 360}, 50%, 18%) 100%)
                `,
              }}
            />
          )}

          {/* Film grain + vignette */}
          <div className="absolute inset-0 opacity-[0.11] mix-blend-overlay" aria-hidden>
            <div
              className="h-full w-full"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              }}
            />
          </div>
          {/* Neutral vignette: read lift for badges without color-casting the photo */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/28 to-transparent"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_0%,rgba(255,255,255,0.07)_0%,transparent_55%)]"
            aria-hidden
          />

          {/* Subtle edge darkening (natural lens falloff) */}
          <div
            className="absolute inset-0 ring-1 ring-inset ring-black/10"
            aria-hidden
          />

          {/* Badge row */}
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/50 to-transparent px-2.5 pb-2 pt-8 sm:px-3 sm:pb-2.5 sm:pt-10">
            <div className="flex flex-wrap items-end justify-between gap-1.5 sm:flex-nowrap sm:gap-2">
              <span
                className={`${badgeGlass} shrink-0 border-white/25 bg-white/15 uppercase tracking-[0.08em] text-white shadow-black/20 sm:tracking-[0.06em]`}
              >
                {categoryLabel}
              </span>

              <span className="order-last flex min-w-0 flex-[1_1_8rem] justify-center sm:order-none">
                {isPending ? (
                  <span
                    className={`${badgeGlass} border-white/20 bg-slate-950/55 text-white/95`}
                  >
                    From …
                  </span>
                ) : isError ? (
                  <span className={`${badgeGlass} border-white/15 bg-slate-950/50 text-white/60`}>—</span>
                ) : startingOffer ? (
                  <span
                    className={`${badgeGlass} border-emerald-400/35 bg-emerald-950/55 text-emerald-50 shadow-emerald-950/40`}
                  >
                    <span className="text-[9px] font-medium text-emerald-200/90 sm:text-[10px]">From</span>
                    <span className="tabular-nums text-[10px] sm:text-[11px]">
                      {formatPrice(startingOffer.price, startingOffer.currency)}
                    </span>
                  </span>
                ) : (
                  <span
                    className={`${badgeGlass} border-rose-400/40 bg-rose-950/70 text-[10px] text-rose-50 shadow-rose-950/50 sm:text-[11px]`}
                  >
                    Sold out
                  </span>
                )}
              </span>

              <span
                className={`${badgeGlass} shrink-0 border-cyan-300/25 bg-slate-950/60 text-cyan-50 tabular-nums`}
                title={
                  availableCount !== null
                    ? `${availableCount} seat${availableCount === 1 ? '' : 's'} available`
                    : catalogSeatTotal > 0
                      ? `${catalogSeatTotal} seat${catalogSeatTotal === 1 ? '' : 's'} in catalog`
                      : undefined
                }
              >
                {isPending ? (
                  <span className="text-white/75">…</span>
                ) : isError ? (
                  '—'
                ) : availableCount !== null ? (
                  <>
                    <TicketGlyph className="h-2.5 w-2.5 shrink-0 opacity-90 sm:h-3 sm:w-3" />
                    <span>
                      {availableCount} {availableCount === 1 ? 'seat' : 'seats'}
                    </span>
                  </>
                ) : (
                  <>
                    <TicketGlyph className="h-2.5 w-2.5 shrink-0 opacity-90 sm:h-3 sm:w-3" />
                    <span>
                      {catalogSeatTotal} {catalogSeatTotal === 1 ? 'seat' : 'seats'}
                    </span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="relative flex flex-1 flex-col bg-gradient-to-b from-white via-slate-50/30 to-white p-3.5 sm:p-4">
          <div
            className="pointer-events-none absolute inset-0 bg-mesh opacity-0 transition duration-500 group-hover/card:opacity-100"
            aria-hidden
          />

          <div className="relative">
            <h2 className="font-display text-base font-bold leading-snug tracking-tight text-slate-900 transition duration-300 group-hover/card:bg-gradient-to-r group-hover/card:from-violet-600 group-hover/card:to-fuchsia-600 group-hover/card:bg-clip-text group-hover/card:text-transparent sm:text-[1.05rem]">
              {show.title}
            </h2>
            {show.description ? (
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500 sm:text-[13px]">
                {show.description}
              </p>
            ) : null}
          </div>

          <div className="relative mt-3 space-y-2">
            <div className="flex gap-2 rounded-xl border border-slate-100/90 bg-white/80 p-2 shadow-sm shadow-slate-200/20 backdrop-blur-sm transition duration-300 group-hover/card:border-violet-100 group-hover/card:shadow-violet-500/5 sm:gap-2.5 sm:p-2.5">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 text-violet-600 ring-1 ring-violet-500/10 sm:h-9 sm:w-9 sm:rounded-xl"
                aria-hidden
              >
                <CalendarIcon />
              </span>
              <div className="min-w-0 pt-px">
                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:text-[10px] sm:tracking-[0.14em]">
                  Date & time
                </p>
                <p className="text-xs font-semibold leading-snug text-slate-800 sm:text-sm">
                  {formatDate(show.startTime)}
                </p>
              </div>
            </div>

            <div className="flex gap-2 rounded-xl border border-slate-100/90 bg-white/80 p-2 shadow-sm shadow-slate-200/20 backdrop-blur-sm transition duration-300 group-hover/card:border-violet-100 group-hover/card:shadow-violet-500/5 sm:gap-2.5 sm:p-2.5">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 text-slate-600 ring-1 ring-slate-200/80 sm:h-9 sm:w-9 sm:rounded-xl"
                aria-hidden
              >
                <MapPinIcon />
              </span>
              <div className="min-w-0 space-y-px pt-px">
                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:text-[10px] sm:tracking-[0.14em]">
                  Venue
                </p>
                <p className="text-xs font-semibold leading-snug text-slate-900 sm:text-[13px]">
                  {v?.venueName ?? 'Venue'}
                </p>
                {addressLine ? (
                  <p className="text-[11px] leading-snug text-slate-600 sm:text-xs">{addressLine}</p>
                ) : null}
                {cityCountry ? (
                  <p className="text-[11px] text-slate-500 sm:text-xs">{cityCountry}</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="relative mt-3 flex items-center justify-between gap-2 border-t border-slate-100/90 pt-3 sm:mt-3.5 sm:pt-3.5">
            <span className="text-xs font-semibold text-violet-600 opacity-0 transition duration-300 group-hover/card:translate-x-0.5 group-hover/card:opacity-100 sm:text-sm">
              Get tickets
            </span>
            <span
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/25 ring-1 ring-white/20 transition duration-300 group-hover/card:scale-105 group-hover/card:shadow-lg group-hover/card:shadow-violet-500/30 sm:h-10 sm:w-10 sm:rounded-2xl"
              aria-hidden
            >
              <ArrowIcon />
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}

function TicketGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 5v2a2 2 0 01-2 2h-2a2 2 0 00-2 2v2a2 2 0 01-2 2H5m14-9a2 2 0 11-4 0m4 0a2 2 0 10-4 0m4 0v9a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2h10z"
      />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s-7-4.5-7-11a7 7 0 1114 0c0 6.5-7 11-7 11z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10a2 2 0 100-4 2 2 0 000 4z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="h-4 w-4 sm:h-[1.125rem] sm:w-[1.125rem]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}
