import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { ordersApi } from '@/api/orders';
import { useAuth } from '@/hooks';
import type { ScanTicketResponse } from '@/types/api';

function getResultStyles(result: ScanTicketResponse['result'] | undefined) {
  if (result === 'SCANNED') {
    return {
      border: 'border-emerald-200',
      bg: 'bg-emerald-50',
      title: 'text-emerald-800',
      subtitle: 'text-emerald-700',
      label: 'Ticket accepted',
    };
  }
  if (result === 'ALREADY_USED') {
    return {
      border: 'border-amber-200',
      bg: 'bg-amber-50',
      title: 'text-amber-800',
      subtitle: 'text-amber-700',
      label: 'Ticket already used',
    };
  }
  return {
    border: 'border-rose-200',
    bg: 'bg-rose-50',
    title: 'text-rose-800',
    subtitle: 'text-rose-700',
    label: 'Ticket invalid',
  };
}

export function CheckInPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const { isScanner } = useAuth();
  const lastScannedTokenRef = useRef<string | null>(null);

  const scanMutation = useMutation({
    mutationFn: (qrToken: string) => ordersApi.scanTicket({ qrToken, gateId: 'WEB-CHECKIN' }),
  });

  useEffect(() => {
    if (!token) return;
    if (lastScannedTokenRef.current === token) return;
    lastScannedTokenRef.current = token;
    scanMutation.mutate(token);
  }, [token]);

  const result = scanMutation.data;
  const styles = getResultStyles(result?.result);

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-8">
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-600">Gate check-in</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">Ticket scan result</h1>
        <p className="mt-3 text-sm text-slate-600">
          This page validates the ticket QR automatically and shows if entry is allowed.
        </p>
      </section>

      {!token ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {isScanner ? 'Ready to scan' : 'Open check-in link'}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {isScanner
              ? 'Scan a ticket QR code to validate entry. This page will show the result automatically.'
              : <>Open this page by scanning a ticket QR code or passing <code className="font-mono">?token=...</code>.</>}
          </p>
        </section>
      ) : scanMutation.isPending ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm text-slate-600">Validating ticket...</p>
        </section>
      ) : scanMutation.isError ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-rose-800">Scan failed</h2>
          <p className="mt-1 text-sm text-rose-700">
            {scanMutation.error instanceof Error ? scanMutation.error.message : 'Could not scan this ticket'}
          </p>
        </section>
      ) : result ? (
        <section className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${styles.border} ${styles.bg}`}>
          <h2 className={`text-lg font-semibold ${styles.title}`}>{styles.label}</h2>
          <p className={`mt-1 text-sm ${styles.subtitle}`}>{result.message}</p>

          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Order ID</dt>
              <dd className="font-medium text-slate-900">{result.orderId ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Seat ID</dt>
              <dd className="font-medium text-slate-900">{result.seatId ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Show ID</dt>
              <dd className="font-medium text-slate-900">{result.showId ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Scanned at</dt>
              <dd className="font-medium text-slate-900">{result.scannedAt ?? '—'}</dd>
            </div>
          </dl>
        </section>
      ) : null}
    </div>
  );
}
