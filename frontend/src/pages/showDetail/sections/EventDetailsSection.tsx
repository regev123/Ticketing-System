import { formatDate } from '@/utils';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  SeatsIcon,
  TagIcon,
  TicketIcon,
} from '@/components/icons';
import type { Show } from '@/types/api';
import type { ComponentType, SVGProps } from 'react';

type Props = {
  show: Show;
  categoryLabel: string;
  descriptionLines: string[];
  doorsOpenText: string;
  endsAtText: string;
  cityCountry: string;
  addressLine?: string;
};

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

function IconTile({ icon: Icon }: { icon: IconComponent }) {
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/[0.12] to-indigo-600/[0.08] text-violet-700 shadow-sm ring-1 ring-violet-200/50"
      aria-hidden
    >
      <Icon className="h-5 w-5" />
    </div>
  );
}

function ScheduleRow({
  icon,
  label,
  value,
}: {
  icon: IconComponent;
  label: string;
  value: string;
}) {
  return (
    <li className="flex gap-4 py-4 first:pt-0">
      <IconTile icon={icon} />
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
        <p className="mt-1 text-[15px] font-semibold leading-snug text-slate-900">{value}</p>
      </div>
    </li>
  );
}

export function EventDetailsSection({
  show,
  categoryLabel,
  descriptionLines,
  doorsOpenText,
  endsAtText,
  cityCountry,
  addressLine,
}: Props) {
  const v = show.venue;
  const seatTotal = show.seats?.length ?? 0;

  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-slate-50/80 to-violet-50/35 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.25)] ring-1 ring-white/60"
      aria-labelledby="show-detail-title"
    >
      <div className="relative">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-12 h-72 w-72 rounded-full bg-violet-400/[0.12] blur-3xl" />
          <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-indigo-400/[0.1] blur-3xl" />
        </div>

        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-12 lg:gap-10 lg:p-10">
          <div className="min-w-0 lg:col-span-7">
            <h1
              id="show-detail-title"
              className="max-w-4xl font-display text-2xl font-bold tracking-tight text-black sm:text-3xl sm:leading-snug lg:text-[1.875rem] lg:leading-snug"
            >
              {show.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-5 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold tracking-wide text-white shadow-sm shadow-violet-600/25">
                <TicketIcon className="h-3.5 w-3.5 shrink-0 opacity-95" aria-hidden />
                Reserve seats
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
                <TagIcon className="h-3.5 w-3.5 shrink-0 text-violet-600" aria-hidden />
                {categoryLabel}
              </span>
            </div>
            {descriptionLines.length > 0 ? (
              <div className="mt-6 max-w-prose">
                <div className="relative pl-5 sm:pl-6">
                  <div
                    className="absolute bottom-2 left-0 top-2 w-[3px] rounded-full bg-gradient-to-b from-violet-400/70 via-violet-300/40 to-violet-200/25"
                    aria-hidden
                  />
                  <div className="space-y-4 text-[15px] font-normal leading-[1.72] tracking-[-0.01em] text-slate-600 antialiased selection:bg-violet-100/90 selection:text-slate-900 sm:text-[17px] sm:leading-[1.75] sm:tracking-[-0.012em]">
                    {descriptionLines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <aside
            className="min-w-0 lg:col-span-5 lg:sticky lg:top-24 lg:self-start"
            aria-label="Date, time, and venue"
          >
            <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-1 shadow-lg shadow-slate-900/[0.04] backdrop-blur-md">
              <div className="rounded-[0.875rem] bg-gradient-to-b from-slate-50/90 to-white p-5 sm:p-6">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                    <CalendarIcon className="h-4 w-4" aria-hidden />
                  </span>
                  When &amp; where
                </p>
                <ul className="mt-4 list-none divide-y divide-slate-100 p-0">
                  <ScheduleRow icon={ClockIcon} label="Doors open" value={doorsOpenText} />
                  <ScheduleRow
                    icon={CalendarIcon}
                    label="Start time"
                    value={formatDate(show.startTime)}
                  />
                  <ScheduleRow icon={ClockIcon} label="End time" value={endsAtText} />
                  <li className="flex gap-4 pb-0 pt-4">
                    <IconTile icon={MapPinIcon} />
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Venue
                      </p>
                      <div className="mt-1 space-y-1">
                        <p className="text-[15px] font-semibold leading-snug text-slate-900">
                          {v.venueName}
                        </p>
                        {addressLine ? (
                          <p className="text-sm leading-relaxed text-slate-600">{addressLine}</p>
                        ) : null}
                        {cityCountry ? (
                          <p className="text-xs font-medium text-slate-500">{cityCountry}</p>
                        ) : null}
                      </div>
                    </div>
                  </li>
                </ul>

                {seatTotal > 0 ? (
                  <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/90 px-3 py-2.5 text-sm text-slate-600">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-violet-600 shadow-sm ring-1 ring-slate-200/80">
                      <SeatsIcon className="h-4 w-4" aria-hidden />
                    </span>
                    <span>
                      <span className="font-semibold text-slate-800">{seatTotal}</span>
                      <span className="text-slate-600"> seats</span>
                      <span className="text-slate-500"> in this layout</span>
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
