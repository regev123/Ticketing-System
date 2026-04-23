import { Link, useParams } from 'react-router-dom';
import { ErrorMessage } from '@/components';
import { useCancelOrder, useCancelOrderSeats, useDownloadOrderTicket, useMyOrder, useShow } from '@/hooks';
import { getEventCategoryLabel } from '@/data/eventCategories';
import { emitGlobalSuccess } from '@/lib/globalSuccessBus';
import { ORDER_CANCELLATION_CUTOFF_HOURS } from '@/config/constants';
import { formatDate, formatPrice } from '@/utils';
import { OrderStatusBadge } from './components';

export function OrderDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const query = useMyOrder(orderId);
  const downloadTicket = useDownloadOrderTicket();
  const cancelSeatMutation = useCancelOrderSeats();
  const cancelOrderMutation = useCancelOrder();
  const order = query.data;
  const showQuery = useShow(order?.showId);
  const show = showQuery.data;
  const shortRef = order?.id.replace(/-/g, '').slice(0, 8).toUpperCase();
  const eventTimeCandidate = show?.startTime ?? order?.startTime ?? order?.createdAt;
  const eventStartMs = eventTimeCandidate ? Date.parse(eventTimeCandidate) : Number.NaN;
  const isPastEvent = Number.isFinite(eventStartMs) ? eventStartMs <= Date.now() : false;
  const cancellationCutoffMs = Number.isFinite(eventStartMs)
    ? eventStartMs - ORDER_CANCELLATION_CUTOFF_HOURS * 60 * 60 * 1000
    : Number.NaN;
  const isCancellationWindowOpen = Number.isFinite(cancellationCutoffMs)
    ? Date.now() <= cancellationCutoffMs
    : true;
  const canCancel =
    !isPastEvent &&
    isCancellationWindowOpen &&
    (order?.status ?? 'CANCELLED') !== 'CANCELLED' &&
    (order?.seatIds.length ?? 0) > 0;

  const handleCancelSingleSeat = (seatId: string) => {
    if (!order) return;
    const approved = window.confirm(`Cancel seat ${seatId} from this order?`);
    if (!approved) return;
    cancelSeatMutation.mutate(
      { orderId: order.id, seatIds: [seatId] },
      {
        onSuccess: () => {
          emitGlobalSuccess('Seat cancelled successfully.');
        },
      }
    );
  };

  const handleCancelOrder = () => {
    if (!order) return;
    const approved = window.confirm(
      `Cancel all remaining ${order.seatIds.length} seat${order.seatIds.length === 1 ? '' : 's'} from this order?`
    );
    if (!approved) return;
    cancelOrderMutation.mutate(
      { orderId: order.id },
      {
        onSuccess: () => {
          emitGlobalSuccess('Order cancelled successfully.');
        },
      }
    );
  };

  return (
    <div className="space-y-8 pb-8">
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <Link to="/orders" className="inline-flex items-center text-sm font-medium text-violet-700 hover:text-violet-600">
          ← Back to all orders
        </Link>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900">Order details</h1>
        {shortRef ? (
          <p className="mt-2 text-sm text-slate-600">
            Order reference: <span className="font-mono font-semibold text-slate-800">#{shortRef}</span>
          </p>
        ) : null}
      </section>

      {query.isPending ? (
        <div className="space-y-4">
          <div className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-slate-100/80" />
          <div className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-slate-100/80" />
        </div>
      ) : query.isError ? (
        <div className="mx-auto max-w-lg">
          <ErrorMessage
            message={query.error instanceof Error ? query.error.message : 'Failed to load order'}
            onRetry={() => query.refetch()}
          />
        </div>
      ) : order ? (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Event</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">
                  {show?.title ?? order.showTitle ?? 'Event'}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {show?.venue?.venueName ?? order.venueName ?? 'Venue TBD'}
                </p>
                <p className="mt-1 text-sm text-slate-500">{formatDate(show?.startTime ?? order.startTime ?? order.createdAt)}</p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            <dl className="mt-5 grid gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-slate-500">Amount paid</dt>
                <dd className="mt-1 font-semibold text-slate-900">{formatPrice(order.amount, order.currency)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Seats</dt>
                <dd className="mt-1 font-semibold text-slate-900">
                  {order.seatIds.length} seat{order.seatIds.length === 1 ? '' : 's'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Order created</dt>
                <dd className="mt-1 font-semibold text-slate-900">{formatDate(order.createdAt)}</dd>
              </div>
            </dl>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Show details</h3>
              {showQuery.isPending ? (
                <p className="mt-3 text-sm text-slate-500">Loading show details...</p>
              ) : show ? (
                <div className="mt-3 space-y-3 text-sm text-slate-700">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Category</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {show.category ? getEventCategoryLabel(show.category) : 'Other'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Event time</p>
                      <p className="mt-1 font-semibold text-slate-900">{formatDate(show.startTime)}</p>
                    </div>
                    {show.doorsOpenTime ? (
                      <div>
                        <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Doors open</p>
                        <p className="mt-1 font-semibold text-slate-900">{formatDate(show.doorsOpenTime)}</p>
                      </div>
                    ) : null}
                    {show.endTime ? (
                      <div>
                        <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Event ends</p>
                        <p className="mt-1 font-semibold text-slate-900">{formatDate(show.endTime)}</p>
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Venue address</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {show.venue.address}, {show.venue.city}, {show.venue.country}
                    </p>
                  </div>

                  {show.description ? (
                    <div>
                      <p className="text-xs uppercase tracking-[0.1em] text-slate-500">About this show</p>
                      <p className="mt-1 leading-relaxed text-slate-700">{show.description}</p>
                    </div>
                  ) : null}

                  <div className="pt-1">
                    <Link
                      to={`/shows/${show.id}`}
                      className="inline-flex items-center rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
                    >
                      Open show page
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  Full show details are unavailable, but your order details are still valid.
                </p>
              )}
            </div>
          </section>

          {!isPastEvent ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-lg font-semibold text-slate-900">Seat tickets</h3>
              <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-600">
                  Download each seat ticket as PDF. Present the PDF or QR code at entry.
                </p>
                {canCancel ? (
                  <button
                    type="button"
                    onClick={handleCancelOrder}
                    disabled={cancelOrderMutation.isPending || cancelSeatMutation.isPending}
                    className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {cancelOrderMutation.isPending ? 'Cancelling...' : 'Cancel all seats'}
                  </button>
                ) : null}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Cancellation policy: free cancellation is available up to {ORDER_CANCELLATION_CUTOFF_HOURS} hours
                before event start.
              </p>
              {!isPastEvent && !isCancellationWindowOpen ? (
                <p className="mt-1 text-xs font-medium text-rose-600">
                  Cancellation window has closed for this event.
                </p>
              ) : null}

              <ul className="mt-4 space-y-3">
                {order.seatIds.map((seatId) => {
                  const isDownloading = downloadTicket.isPending && downloadTicket.variables?.seatId === seatId;
                  const isCancellingSeat = cancelSeatMutation.isPending && cancelSeatMutation.variables?.seatIds.includes(seatId);
                  return (
                    <li
                      key={seatId}
                      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Seat</p>
                        <p className="mt-1 font-semibold text-slate-900">{seatId}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            downloadTicket.mutate({
                              orderId: order.id,
                              seatId,
                            })
                          }
                          disabled={isDownloading || isCancellingSeat}
                          className="inline-flex items-center justify-center rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isDownloading ? 'Downloading...' : 'Download PDF'}
                        </button>
                        {canCancel ? (
                          <button
                            type="button"
                            onClick={() => handleCancelSingleSeat(seatId)}
                            disabled={isCancellingSeat || cancelOrderMutation.isPending}
                            className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isCancellingSeat ? 'Cancelling...' : 'Cancel seat'}
                          </button>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : (
            <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm sm:p-6">
              <h3 className="text-lg font-semibold text-slate-900">Ticket downloads closed</h3>
              <p className="mt-1 text-sm text-slate-600">
                This event has already passed, so ticket PDF downloads are hidden.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Cancellation policy: free cancellation is available up to {ORDER_CANCELLATION_CUTOFF_HOURS} hours
                before event start.
              </p>
            </section>
          )}
        </>
      ) : null}
    </div>
  );
}
