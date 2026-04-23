import { Button, Card } from '@/components';
import { PillBadge } from '@/components/forms';

type Props = {
  onBackToShows: () => void;
};

export function OrderConfirmedSection({ onBackToShows }: Props) {
  return (
    <Card className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60 sm:p-10">

      <div className="relative text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white text-emerald-700 shadow-md shadow-slate-200/60">
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Booking successful</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Order confirmed
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
          Your order has been placed and payment is now being processed. You can return to shows and continue exploring events.
        </p>
        <p className="mx-auto mt-3 max-w-xl rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 sm:text-base">
          Tickets for all selected seats, your order summary, and confirmation details will be sent to your email shortly.
        </p>
      </div>

      <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <PillBadge className="rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          Seats reserved
        </PillBadge>
        <PillBadge className="rounded-xl bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
          Order created
        </PillBadge>
      </div>

      <div className="relative mt-8 flex justify-center">
        <Button
          variant="primary"
          className="min-w-[220px]"
          onClick={onBackToShows}
        >
          Back to shows
        </Button>
      </div>
    </Card>
  );
}
