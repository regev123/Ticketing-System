import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useCountdownTarget, useCreateOrder } from '@/hooks';
import type { HoldResponse, SeatInfo, Show } from '@/types/api';

type LocationState = { hold: HoldResponse; show: Show } | null;
const CHECKOUT_STATE_STORAGE_KEY = 'ticketing:checkout-state';

type PersistedCheckoutState = {
  hold: HoldResponse;
  show: Show;
};

function computeOrderTotal(show: Show, seatIds: string[]): { amount: number; currency: string } {
  const seats = show.seats.filter((s) => seatIds.includes(s.id));
  const amount = seats.reduce((sum, s) => sum + Number(s.price), 0);
  const currency = seats[0]?.currency ?? 'USD';
  return { amount, currency };
}

type HoldState = 'expired' | 'ending-soon' | 'active';

type CheckoutPageState = {
  hasValidState: boolean;
  confirmed: boolean;
  show: Show | null;
  hold: HoldResponse | null;
  selectedSeats: SeatInfo[];
  amount: number;
  currency: string;
  secondsLeft: number;
  holdTotalSeconds: number;
  holdState: HoldState;
  createOrder: ReturnType<typeof useCreateOrder>;
  handlePlaceOrder: () => void;
  setConfirmed: Dispatch<SetStateAction<boolean>>;
};

export function useCheckoutPageState(): CheckoutPageState {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as LocationState;
  const [confirmed, setConfirmed] = useState(false);
  const [restoredState, setRestoredState] = useState<PersistedCheckoutState | null>(() => readPersistedCheckoutState());
  const createOrder = useCreateOrder();
  const { user } = useAuth();
  const state = routeState?.hold && routeState?.show ? routeState : restoredState;

  useEffect(() => {
    if (!state?.hold || !state?.show) {
      navigate('/', { replace: true });
    }
  }, [state, navigate]);

  useEffect(() => {
    if (!routeState?.hold || !routeState?.show) return;
    persistCheckoutState(routeState);
    setRestoredState(routeState);
  }, [routeState]);

  const handlePlaceOrder = () => {
    if (!state?.hold || !state?.show) return;
    const { hold, show } = state;
    const { amount, currency } = computeOrderTotal(show, hold.seatIds);
    createOrder.mutate(
      {
        holdId: hold.holdId,
        showId: hold.showId,
        seatIds: hold.seatIds,
        amount,
        currency,
        userEmail: user?.email,
        showTitle: show.title,
        venueName: show.venue.venueName,
        startTime: show.startTime,
      },
      {
        onSuccess: () => setConfirmed(true),
      }
    );
  };

  const hasValidState = Boolean(state?.hold && state?.show);
  const hold = state?.hold ?? null;
  const show = state?.show ?? null;
  const amount = show && hold ? computeOrderTotal(show, hold.seatIds).amount : 0;
  const currency = show && hold ? computeOrderTotal(show, hold.seatIds).currency : 'USD';
  const selectedSeats = useMemo(() => {
    if (!show || !hold) return [];
    const seatsById = new Map(show.seats.map((seat) => [seat.id, seat]));
    return hold.seatIds
      .map((seatId) => seatsById.get(seatId))
      .filter((seat): seat is NonNullable<typeof seat> => Boolean(seat));
  }, [show, hold]);
  const secondsLeft = useCountdownTarget({ targetTimeMs: hold?.expiresAt ?? Date.now() });
  const holdTotalSeconds = 300;
  const holdState: HoldState = secondsLeft <= 0 ? 'expired' : secondsLeft <= 60 ? 'ending-soon' : 'active';

  if (!hasValidState) {
    return {
      hasValidState: false,
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
      setConfirmed,
    };
  }

  return {
    hasValidState: true,
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
    setConfirmed,
  };
}

function persistCheckoutState(state: PersistedCheckoutState) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(CHECKOUT_STATE_STORAGE_KEY, JSON.stringify(state));
}

function readPersistedCheckoutState(): PersistedCheckoutState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(CHECKOUT_STATE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedCheckoutState;
    if (!parsed?.hold?.holdId || !parsed?.show?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}
