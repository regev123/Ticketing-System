import { useNavigate } from 'react-router-dom';
import { OrderConfirmedSection } from './sections/OrderConfirmedSection';
import { CheckoutEventSection } from './sections/CheckoutEventSection';
import { CheckoutOrderSummarySection } from './sections/CheckoutOrderSummarySection';
import { SecureCheckoutHeroSection } from './sections/SecureCheckoutHeroSection';
import { useCheckoutPageState } from './useCheckoutPageState';

export function CheckoutPage() {
  const navigate = useNavigate();
  const {
    hasValidState,
    confirmed,
    show,
    hold,
    selectedSeats,
    amount,
    currency,
    secondsLeft,
    holdTotalSeconds,
    holdState,
    createOrder,
    handlePlaceOrder,
  } = useCheckoutPageState();

  if (!hasValidState || !show || !hold) return null;

  if (confirmed || createOrder.isSuccess) {
    return <OrderConfirmedSection onBackToShows={() => navigate('/')} />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <SecureCheckoutHeroSection
        secondsLeft={secondsLeft}
        holdTotalSeconds={holdTotalSeconds}
        holdState={holdState}
      />

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <CheckoutEventSection show={show} selectedSeats={selectedSeats} />

        <CheckoutOrderSummarySection
          seatCount={hold.seatIds.length}
          amount={amount}
          currency={currency}
          isError={createOrder.isError}
          errorMessage={createOrder.error instanceof Error ? createOrder.error.message : 'Order failed'}
          isPending={createOrder.isPending}
          secondsLeft={secondsLeft}
          onPlaceOrder={handlePlaceOrder}
          onBackToSeatSelection={() => navigate(-1)}
        />
      </div>
    </div>
  );
}
