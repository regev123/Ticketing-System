import { Button, Card, ErrorMessage } from '@/components';
import { formatPrice } from '@/utils';

type Props = {
  seatCount: number;
  amount: number;
  currency: string;
  isError: boolean;
  errorMessage: string;
  isPending: boolean;
  secondsLeft: number;
  onPlaceOrder: () => void;
  onBackToSeatSelection: () => void;
};

export function CheckoutOrderSummarySection({
  seatCount,
  amount,
  currency,
  isError,
  errorMessage,
  isPending,
  secondsLeft,
  onPlaceOrder,
  onBackToSeatSelection,
}: Props) {
  return (
    <Card className="rounded-3xl border border-slate-200/90 p-6 shadow-sm sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Order summary</p>
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Tickets</span>
          <span className="font-semibold text-slate-800">{seatCount}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Subtotal</span>
          <span className="font-semibold text-slate-800">{formatPrice(amount, currency)}</span>
        </div>
        <div className="border-t border-slate-200 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Total</span>
            <span className="text-2xl font-bold tracking-tight text-slate-900">{formatPrice(amount, currency)}</span>
          </div>
        </div>
      </div>

      <p className="mt-5 rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-2 text-xs font-medium text-blue-800">
        Seats remain reserved only while the timer is active.
      </p>

      {isError ? (
        <div className="mt-4">
          <ErrorMessage message={errorMessage} />
        </div>
      ) : null}

      <Button
        className="mt-5 w-full"
        onClick={onPlaceOrder}
        disabled={isPending || secondsLeft <= 0}
        loading={isPending}
      >
        {secondsLeft <= 0 ? 'Seat hold expired' : 'Place order securely'}
      </Button>
      <button
        type="button"
        onClick={onBackToSeatSelection}
        className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Back to seat selection
      </button>
    </Card>
  );
}
