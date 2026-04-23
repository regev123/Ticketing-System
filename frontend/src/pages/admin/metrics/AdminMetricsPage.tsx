import { useEffect, useMemo, useState } from 'react';
import { ErrorMessage, Loading } from '@/components';
import { useAdminMetrics } from '@/hooks';
import { formatPrice } from '@/utils/format';

const WINDOW_OPTIONS = [7, 30, 90] as const;

type MetricCardProps = {
  label: string;
  value: string;
  hint?: string;
};

function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
      {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
    </article>
  );
}

export function AdminMetricsPage() {
  const [days, setDays] = useState<(typeof WINDOW_OPTIONS)[number]>(30);
  const [selectedShowId, setSelectedShowId] = useState<string>('');
  const metricsQuery = useAdminMetrics(days);
  const metrics = metricsQuery.data;
  const global = metrics?.global;

  useEffect(() => {
    if (!metrics) return;
    const first = metrics.perEventMetrics[0]?.showId ?? '';
    if (!selectedShowId || !metrics.perEventMetrics.some((m) => m.showId === selectedShowId)) {
      setSelectedShowId(first);
    }
  }, [metrics, selectedShowId]);

  const selectedEvent = useMemo(() => {
    if (!metrics || !selectedShowId) return null;
    return metrics.perEventMetrics.find((event) => event.showId === selectedShowId) ?? null;
  }, [metrics, selectedShowId]);

  return (
    <div className="relative min-h-[60vh]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_40%_at_50%_-10%,rgba(14,165,233,0.12),transparent)]" />
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-2 sm:px-6 lg:px-8">
        <header className="mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-sky-600">Insights</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Metrics dashboard</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
              Track platform-wide performance and drill into event-level execution in one dashboard.
            </p>
          </div>
        </header>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Window</p>
          <div className="mt-2 flex gap-2">
            {WINDOW_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDays(option)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  option === days ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-500'
                }`}
              >
                Last {option} days
              </button>
            ))}
          </div>
        </div>

        {metricsQuery.isLoading ? <Loading /> : null}
        {metricsQuery.isError ? <ErrorMessage message="Could not load admin metrics." /> : null}

        {metrics && global ? (
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Global Metrics</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  Last {metrics.windowDays} days
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard label="Total Orders" value={global.totalOrders.toLocaleString()} />
                <MetricCard label="Confirmed Revenue" value={formatPrice(global.revenueConfirmed, 'USD')} />
                <MetricCard label="Active Tickets" value={global.ticketsActive.toLocaleString()} />
                <MetricCard label="Successful Scans" value={global.scansSuccessful.toLocaleString()} />
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Order Status Mix</h2>
                <dl className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <dt className="text-slate-600">Confirmed</dt>
                    <dd className="font-semibold text-emerald-700">{global.confirmedOrders.toLocaleString()}</dd>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <dt className="text-slate-600">Pending payment</dt>
                    <dd className="font-semibold text-amber-700">{global.pendingOrders.toLocaleString()}</dd>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <dt className="text-slate-600">Partially cancelled</dt>
                    <dd className="font-semibold text-violet-700">{global.partiallyCancelledOrders.toLocaleString()}</dd>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <dt className="text-slate-600">Cancelled</dt>
                    <dd className="font-semibold text-rose-700">{global.cancelledOrders.toLocaleString()}</dd>
                  </div>
                </dl>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Financial Snapshot</h2>
                <dl className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <dt className="text-slate-600">Confirmed revenue</dt>
                    <dd className="font-semibold text-slate-900">{formatPrice(global.revenueConfirmed, 'USD')}</dd>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <dt className="text-slate-600">Pipeline estimate</dt>
                    <dd className="font-semibold text-slate-900">{formatPrice(global.revenueEstimated, 'USD')}</dd>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <dt className="text-slate-600">Time window</dt>
                    <dd className="font-semibold text-slate-900">{metrics.windowDays} days</dd>
                  </div>
                </dl>
              </article>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Per-Event Metrics</h2>
                <select
                  value={selectedShowId}
                  onChange={(event) => setSelectedShowId(event.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                >
                  {metrics.perEventMetrics.map((event) => (
                    <option key={event.showId} value={event.showId}>
                      {event.showTitle}
                    </option>
                  ))}
                </select>
              </div>

              {!selectedEvent ? (
                <p className="mt-4 text-sm text-slate-600">No events in this time window yet.</p>
              ) : (
                <div className="mt-4 grid gap-4 lg:grid-cols-4">
                  <MetricCard label="Orders" value={selectedEvent.totalOrders.toLocaleString()} />
                  <MetricCard label="Confirmed Revenue" value={formatPrice(selectedEvent.revenue, 'USD')} />
                  <MetricCard label="Estimated Revenue" value={formatPrice(selectedEvent.revenueEstimated, 'USD')} />
                  <MetricCard label="Successful Scans" value={selectedEvent.scansSuccessful.toLocaleString()} />
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Top Events By Revenue</h2>
              {metrics.topEventsByRevenue.length === 0 ? (
                <p className="mt-4 text-sm text-slate-600">No events in this time window yet.</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-2 py-2 font-semibold">Event</th>
                        <th className="px-2 py-2 font-semibold">Orders</th>
                        <th className="px-2 py-2 font-semibold">Tickets</th>
                        <th className="px-2 py-2 font-semibold">Scans</th>
                        <th className="px-2 py-2 font-semibold">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.topEventsByRevenue.map((event) => (
                        <tr key={`${event.showId}-${event.showTitle}`} className="border-b border-slate-100">
                          <td className="px-2 py-3 font-medium text-slate-800">{event.showTitle}</td>
                          <td className="px-2 py-3 text-slate-700">{event.totalOrders.toLocaleString()}</td>
                          <td className="px-2 py-3 text-slate-700">{event.activeTickets.toLocaleString()}</td>
                          <td className="px-2 py-3 text-slate-700">{event.scansSuccessful.toLocaleString()}</td>
                          <td className="px-2 py-3 text-slate-900">{formatPrice(event.revenue, 'USD')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
