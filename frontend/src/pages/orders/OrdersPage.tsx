import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorMessage } from '@/components';
import { PAGE_SIZE_OPTIONS, useMyOrders } from '@/hooks';
import { formatDate, formatPrice } from '@/utils';
import { OrderStatusBadge, OrdersPagination } from './components';

const DEFAULT_PAGE_SIZE: (typeof PAGE_SIZE_OPTIONS)[number] = 12;
type OrdersTab = 'upcoming' | 'past';

function isPastOrder(startTime: string | undefined, createdAt: string): boolean {
  const candidate = startTime ?? createdAt;
  const timeMs = Date.parse(candidate);
  if (!Number.isFinite(timeMs)) return false;
  return timeMs <= Date.now();
}

function isOrderPast(order: { startTime?: string; createdAt: string }): boolean {
  return isPastOrder(order.startTime, order.createdAt);
}

export function OrdersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(DEFAULT_PAGE_SIZE);
  const [activeTab, setActiveTab] = useState<OrdersTab>('upcoming');
  const query = useMyOrders({ page: 0, size: 100 });
  const payload = query.data;
  const orders = payload?.items ?? [];
  const { upcomingOrders, pastOrders } = useMemo(() => {
    const upcoming = orders.filter((order) => !isPastOrder(order.startTime, order.createdAt));
    const past = orders.filter((order) => isPastOrder(order.startTime, order.createdAt));
    return { upcomingOrders: upcoming, pastOrders: past };
  }, [orders]);
  const tabOrders = activeTab === 'upcoming' ? upcomingOrders : pastOrders;
  const totalItems = tabOrders.length;
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);
  const safePage = Math.min(page, Math.max(totalPages, 1));
  const paginatedOrders = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return tabOrders.slice(start, start + pageSize);
  }, [tabOrders, safePage, pageSize]);

  const hasOrders = paginatedOrders.length > 0;
  const summaryText = useMemo(() => {
    if (!payload) return 'Loading your order history...';
    if (orders.length === 0) return 'You do not have orders yet.';
    return `${orders.length} order${orders.length === 1 ? '' : 's'} in your account`;
  }, [payload, orders.length]);

  return (
    <div className="space-y-8 pb-8">
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-600">My account</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">My orders</h1>
        <p className="mt-3 text-sm text-slate-600 sm:text-base">{summaryText}</p>
        <div className="mt-5 inline-flex w-fit rounded-xl border border-slate-200/80 bg-white/80 p-1 shadow-sm">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('upcoming');
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'upcoming'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              Upcoming orders
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('past');
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'past'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              Past orders
            </button>
          </div>
        </div>
      </section>

      {query.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-slate-100/80" />
          ))}
        </div>
      ) : query.isError ? (
        <div className="mx-auto max-w-lg">
          <ErrorMessage
            message={query.error instanceof Error ? query.error.message : 'Failed to load orders'}
            onRetry={() => query.refetch()}
          />
        </div>
      ) : hasOrders ? (
        <section className="space-y-5" aria-label="Order list">
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {paginatedOrders.map((order) => (
              <li key={order.id}>
                <Link
                  to={`/orders/${order.id}`}
                  className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Order reference</p>
                      <p className="mt-1 font-mono text-sm font-semibold text-slate-900">
                        #{order.id.replace(/-/g, '').slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <OrderStatusBadge status={order.status} />
                      {isOrderPast(order) ? (
                        <span className="inline-flex rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          Event passed
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 space-y-1">
                    <p className="line-clamp-1 text-sm font-semibold text-slate-900">
                      {order.showTitle ?? 'Event'}
                    </p>
                    <p className="line-clamp-1 text-sm text-slate-600">{order.venueName ?? 'Venue TBD'}</p>
                    <p className="text-xs text-slate-500">{formatDate(order.startTime ?? order.createdAt)}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                    <span className="text-slate-500">
                      {order.seatIds.length} seat{order.seatIds.length === 1 ? '' : 's'}
                    </span>
                    <span className="font-semibold text-slate-900">{formatPrice(order.amount, order.currency)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <OrdersPagination
            page={safePage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
            onPageSizeChange={(nextSize) => {
              setPageSize(nextSize);
              setPage(1);
            }}
          />
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-14 text-center">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            {activeTab === 'upcoming' ? 'No upcoming orders' : 'No past orders'}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {activeTab === 'upcoming'
              ? 'Choose an event and complete checkout. Your upcoming orders will appear here.'
              : 'Past orders appear here after the event start time passes.'}
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/30 transition hover:bg-violet-500"
          >
            Browse upcoming shows
          </Link>
        </section>
      )}
    </div>
  );
}
