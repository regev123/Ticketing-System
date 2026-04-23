import { Card } from '@/components';
import type { SeatInfo, Show } from '@/types/api';

type Props = {
  show: Show;
  selectedSeats: SeatInfo[];
};

export function CheckoutEventSection({ show, selectedSeats }: Props) {
  return (
    <Card className="rounded-3xl border border-slate-200/80 p-6 shadow-sm sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Event</p>
      <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900">{show.title}</h2>
      <p className="mt-2 text-sm text-slate-600">
        {show.venue.venueName} - {show.venue.city}, {show.venue.country}
      </p>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Selected seats</p>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {selectedSeats.map((seat) => (
            <span
              key={seat.id}
              className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-800"
            >
              {seat.section}-{seat.row}-{seat.number}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Why this step matters</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          Checkout gives you a final review before purchase, prevents wrong-seat mistakes, and confirms pricing while your hold is still active.
        </p>
      </div>
    </Card>
  );
}
