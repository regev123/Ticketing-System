import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCreateOrder } from '@/hooks';
import { Button, Card, ErrorMessage } from '@/components';
import { formatPrice } from '@/utils';
import type { HoldResponse, Show } from '@/types/api';

type LocationState = { hold: HoldResponse; show: Show } | null;

function computeOrderTotal(show: Show, seatIds: string[]): { amount: number; currency: string } {
  const seats = show.seats.filter((s) => seatIds.includes(s.id));
  const amount = seats.reduce((sum, s) => sum + Number(s.price), 0);
  const currency = seats[0]?.currency ?? 'USD';
  return { amount, currency };
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const [confirmed, setConfirmed] = useState(false);

  const createOrder = useCreateOrder();

  useEffect(() => {
    if (!state?.hold || !state?.show) {
      navigate('/', { replace: true });
    }
  }, [state, navigate]);

  const handlePlaceOrder = () => {
    if (!state?.hold || !state?.show) return;
    const { hold, show } = state;
    const { amount, currency } = computeOrderTotal(show, hold.seatIds);
    createOrder.mutate(
      {
        holdId: hold.holdId,
        showId: hold.showId,
        seatIds: hold.seatIds,
        userId: hold.userId,
        amount,
        currency,
      },
      {
        onSuccess: () => setConfirmed(true),
      }
    );
  };

  if (!state?.hold || !state?.show) return null;

  const { hold, show } = state;
  const { amount, currency } = computeOrderTotal(show, hold.seatIds);

  if (confirmed || createOrder.isSuccess) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <h1 className="font-display text-2xl font-bold text-violet-700">
          Order confirmed
        </h1>
        <p className="mt-2 text-slate-600">
          Your order has been placed. Payment is being processed.
        </p>
        <Button
          variant="primary"
          className="mt-6"
          onClick={() => navigate('/')}
        >
          Back to shows
        </Button>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="font-display text-2xl font-bold text-slate-900">
        Checkout
      </h1>
      <Card>
        <h2 className="font-display text-lg font-semibold">{show.title}</h2>
        <p className="mt-1 text-sm text-slate-600">
          Seats: {hold.seatIds.join(', ')}
        </p>
        <p className="mt-2 text-lg font-semibold text-slate-900">
          Total: {formatPrice(amount, currency)}
        </p>
      </Card>
      {createOrder.isError && (
        <ErrorMessage
          message={
            createOrder.error instanceof Error
              ? createOrder.error.message
              : 'Order failed'
          }
        />
      )}
      <Button
        onClick={handlePlaceOrder}
        disabled={createOrder.isPending}
        loading={createOrder.isPending}
      >
        Place order
      </Button>
    </div>
  );
}
