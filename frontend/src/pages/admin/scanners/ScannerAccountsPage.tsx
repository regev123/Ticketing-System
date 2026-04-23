import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { emitGlobalSuccess } from '@/lib/globalSuccessBus';
import { ErrorMessage } from '@/components';
import { useShows } from '@/hooks';
import { formatDate } from '@/utils';

const SCANNERS_QUERY_KEY = ['admin', 'scanners'] as const;

export function ScannerAccountsPage() {
  const queryClient = useQueryClient();
  const { data: shows = [] } = useShows();
  const [scannerName, setScannerName] = useState('');
  const [selectedShowId, setSelectedShowId] = useState('');
  const [resetPasswordDraft, setResetPasswordDraft] = useState<Record<string, string>>({});
  const [latestCreatedCredentials, setLatestCreatedCredentials] = useState<{
    email: string;
    password: string;
    showTitle: string;
  } | null>(null);

  const scannersQuery = useQuery({
    queryKey: SCANNERS_QUERY_KEY,
    queryFn: () => authApi.listScanners(),
  });

  const refreshScanners = () => queryClient.invalidateQueries({ queryKey: SCANNERS_QUERY_KEY });
  const upcomingShows = useMemo(
    () =>
      shows.filter((show) => {
        const startMs = Date.parse(show.startTime);
        return Number.isFinite(startMs) && startMs > Date.now();
      }),
    [shows]
  );

  const createMutation = useMutation({
    mutationFn: () => {
      const selectedShow = upcomingShows.find((show) => show.id === selectedShowId);
      if (!selectedShow) {
        throw new Error('Please select an event');
      }
      return authApi.createScanner({
        scannerName: scannerName.trim(),
        showId: selectedShow.id,
        showTitle: selectedShow.title,
        eventEndAt: selectedShow.endTime ?? selectedShow.startTime,
      });
    },
    onSuccess: (scanner) => {
      setScannerName('');
      setSelectedShowId('');
      setLatestCreatedCredentials({
        email: scanner.email,
        password: scanner.temporaryPassword ?? '',
        showTitle: scanner.scannerEventTitle ?? 'Event',
      });
      emitGlobalSuccess('Scanner account created.');
      void refreshScanners();
    },
  });

  const disableMutation = useMutation({
    mutationFn: (scannerId: string) => authApi.disableScanner(scannerId),
    onSuccess: () => {
      emitGlobalSuccess('Scanner account disabled.');
      void refreshScanners();
    },
  });

  const resetMutation = useMutation({
    mutationFn: ({ scannerId, newPassword }: { scannerId: string; newPassword: string }) =>
      authApi.resetScannerPassword(scannerId, newPassword),
    onSuccess: (_data, variables) => {
      setResetPasswordDraft((prev) => ({ ...prev, [variables.scannerId]: '' }));
      emitGlobalSuccess('Scanner password reset successfully.');
      void refreshScanners();
    },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="font-display text-2xl font-bold text-slate-900">Scanner accounts</h1>
        <p className="mt-2 text-sm text-slate-600">
          Create and manage gate scanner users. Scanner accounts can only access ticket check-in.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Create event scanner account</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <select
            value={selectedShowId}
            onChange={(event) => setSelectedShowId(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-500"
          >
            <option value="">Select event</option>
            {upcomingShows.map((show) => (
              <option key={show.id} value={show.id}>
                {show.title} ({formatDate(show.startTime)})
              </option>
            ))}
          </select>
          <input
            value={scannerName}
            onChange={(event) => setScannerName(event.target.value)}
            placeholder="Scanner display name (e.g. Gate A)"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-500"
          />
        </div>
        <button
          type="button"
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending || !scannerName.trim() || !selectedShowId}
          className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {createMutation.isPending ? 'Creating...' : 'Create scanner'}
        </button>
        {upcomingShows.length === 0 ? (
          <p className="mt-3 text-xs text-slate-500">
            No upcoming shows are available. Create or schedule an upcoming event first.
          </p>
        ) : null}
        {latestCreatedCredentials ? (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm">
            <p className="font-semibold text-emerald-900">Scanner credentials created for {latestCreatedCredentials.showTitle}</p>
            <p className="mt-1 text-emerald-800">Email: {latestCreatedCredentials.email}</p>
            <p className="text-emerald-800">Password: {latestCreatedCredentials.password || 'Hidden'}</p>
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Existing scanner accounts</h2>
        {scannersQuery.isPending ? (
          <p className="mt-4 text-sm text-slate-600">Loading scanner accounts...</p>
        ) : scannersQuery.isError ? (
          <div className="mt-4">
            <ErrorMessage
              message={scannersQuery.error instanceof Error ? scannersQuery.error.message : 'Failed to load scanners'}
              onRetry={() => scannersQuery.refetch()}
            />
          </div>
        ) : scannersQuery.data && scannersQuery.data.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {scannersQuery.data.map((scanner) => {
              const resetValue = resetPasswordDraft[scanner.id] ?? '';
              return (
                <li key={scanner.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{scanner.email}</p>
                      <p className="text-xs text-slate-500">
                        {scanner.firstName ?? ''} {scanner.lastName ?? ''} · {scanner.active ? 'Active' : 'Disabled'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Event: {scanner.scannerEventTitle ?? scanner.scannerEventId ?? 'N/A'} · Expires:{' '}
                        {scanner.scannerEventEndAt ? formatDate(scanner.scannerEventEndAt) : 'N/A'}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={!scanner.active || disableMutation.isPending}
                      onClick={() => disableMutation.mutate(scanner.id)}
                      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Disable
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <input
                      value={resetValue}
                      onChange={(event) =>
                        setResetPasswordDraft((prev) => ({ ...prev, [scanner.id]: event.target.value }))
                      }
                      type="password"
                      placeholder="New password"
                      className="min-w-[15rem] rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-500"
                    />
                    <button
                      type="button"
                      disabled={!resetValue.trim() || resetMutation.isPending}
                      onClick={() => resetMutation.mutate({ scannerId: scanner.id, newPassword: resetValue })}
                      className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Reset password
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-slate-600">No scanner accounts yet.</p>
        )}
      </section>
    </div>
  );
}
