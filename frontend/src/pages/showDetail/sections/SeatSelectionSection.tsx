import { Link } from 'react-router-dom';
import { Button, Card } from '@/components';
import { formatPrice } from '@/utils';
import type { SeatInfo } from '@/types/api';

type SectionRow = {
  rowNumber: number;
  seats: SeatInfo[];
};

type SectionLayout = {
  sectionName: string;
  rows: SectionRow[];
  availableCount: number;
  priceLabel: string;
};

type Props = {
  isLoading: boolean;
  sectionLayouts: SectionLayout[];
  currentSectionName: string | null;
  currentSectionLayout: SectionLayout | null;
  currentRowNumber: number | null;
  fullRowSeats: SeatInfo[];
  catalogCountBySection: Record<string, number>;
  catalogCountBySectionRow: Record<string, number>;
  pickableSeatIdSet: Set<string>;
  availabilityResolved: boolean;
  availableSeatIdSet: Set<string>;
  serverSynced: Set<string>;
  selectedIds: Set<string>;
  syncing: boolean;
  seatHint: string | null;
  selectedCount: number;
  currency?: string;
  /** When false, the map is view-only: guests can browse sections/rows and see availability but cannot select or hold seats. */
  canSelectSeats?: boolean;
  /** Used for login/register links when `canSelectSeats` is false. */
  signInReturnPath?: string;
  /** Grouped lines like "Orchestra · Row 5 · Seats 12, 14" — shown when user has a selection. */
  selectionSummaryLines?: string[];
  /** Shown next to summary when seats are selected. */
  selectedSubtotal?: number | null;
  onSetActiveSection: (section: string) => void;
  onSetActiveRow: (row: number) => void;
  onToggleSeat: (seatId: string) => void;
  onContinue: () => void;
};

export function SeatSelectionSection({
  isLoading,
  sectionLayouts,
  currentSectionName,
  currentSectionLayout,
  currentRowNumber,
  fullRowSeats,
  catalogCountBySection,
  catalogCountBySectionRow,
  pickableSeatIdSet,
  availabilityResolved,
  availableSeatIdSet,
  serverSynced,
  selectedIds,
  syncing,
  seatHint,
  selectedCount,
  currency,
  canSelectSeats = true,
  signInReturnPath = '/',
  selectionSummaryLines = [],
  selectedSubtotal = null,
  onSetActiveSection,
  onSetActiveRow,
  onToggleSeat,
  onContinue,
}: Props) {
  return (
    <Card className="rounded-3xl border border-slate-200/80 p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-slate-900">Select seats</h2>
          <p className="mt-1 text-sm text-slate-500">
            {canSelectSeats
              ? 'Choose your seats and continue to secure them for checkout'
              : 'Browse availability below — sign in to select seats and hold them for checkout'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-300" />
            Available
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-400" />
            Taken
          </span>
          {canSelectSeats ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-violet-600" />
              Selected
            </span>
          ) : null}
        </div>
      </div>
      {!canSelectSeats ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-200/80 bg-violet-50/60 px-4 py-3 text-sm text-slate-700">
          <span className="font-medium text-slate-800">Sign in to choose seats and complete booking.</span>
          <span className="flex flex-wrap gap-2">
            <Link
              to="/register"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Create account
            </Link>
            <Link
              to="/login"
              state={{ from: signInReturnPath }}
              className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-violet-500"
            >
              Sign in
            </Link>
          </span>
        </div>
      ) : null}
      {canSelectSeats && selectedCount > 0 && selectionSummaryLines.length > 0 ? (
        <div className="mt-4 rounded-2xl border border-violet-200/90 bg-gradient-to-br from-violet-50/95 via-white to-fuchsia-50/40 px-4 py-4 shadow-sm ring-1 ring-violet-100/80">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-violet-800">Your tickets</p>
              <ul className="mt-2 space-y-2">
                {selectionSummaryLines.map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-2.5 text-sm font-semibold leading-snug text-slate-900"
                  >
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500 shadow-sm shadow-violet-400/50"
                      aria-hidden
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              {syncing ? (
                <p className="mt-3 text-xs font-medium text-violet-600">Updating your hold on the server…</p>
              ) : (
                <p className="mt-3 text-xs text-slate-500">
                  The grid shows one row at a time; switch section/row below to see each seat highlighted in violet.
                </p>
              )}
            </div>
            {selectedSubtotal != null && currency ? (
              <div className="shrink-0 rounded-xl border border-violet-100 bg-white/80 px-4 py-3 text-right shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Subtotal</p>
                <p className="mt-0.5 text-xl font-bold tabular-nums text-slate-900">
                  {formatPrice(selectedSubtotal, currency)}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      {isLoading ? (
        <div className="mt-6 flex min-h-[120px] items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
            <section className="rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                1) Choose section
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {sectionLayouts.map(({ sectionName, priceLabel, availableCount }) => {
                  const totalInSection = catalogCountBySection[sectionName] ?? availableCount;
                  const availLevel = availabilityLevel(availableCount, totalInSection);
                  const isSectionActive = currentSectionName === sectionName;
                  return (
                    <button
                      key={sectionName}
                      type="button"
                      onClick={() => onSetActiveSection(sectionName)}
                      className={`min-w-[112px] rounded-xl border px-3 py-2 text-left transition ${
                        isSectionActive
                          ? 'border-violet-500 bg-violet-600 text-white shadow-sm'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50'
                      }`}
                    >
                      <span className="block text-sm font-semibold leading-tight tracking-tight">{sectionName}</span>
                      <span
                        className={`mt-1 block text-xs leading-snug ${isSectionActive ? 'text-violet-100' : 'text-slate-500'}`}
                      >
                        {priceLabel}
                      </span>
                      <span
                        className={`mt-1 block text-xs leading-snug ${availabilityCountTextClass(availLevel, isSectionActive)}`}
                      >
                        {availabilityCountLabel(availableCount)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                2) Choose row
              </p>
              <p className="mt-1 text-xs text-slate-500">Row 1 is closest to the stage.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {currentSectionLayout?.rows.map(({ rowNumber, seats: rowSeats }) => {
                  const availableInRow = rowSeats.filter((s) => pickableSeatIdSet.has(s.id)).length;
                  const isActive = currentRowNumber === rowNumber;
                  const rowKey = currentSectionName != null ? `${currentSectionName}-${rowNumber}` : '';
                  const totalInRow = rowKey ? (catalogCountBySectionRow[rowKey] ?? availableInRow) : availableInRow;
                  const rowAvailLevel = availabilityLevel(availableInRow, totalInRow);
                  return (
                    <button
                      key={`${currentSectionName}-${rowNumber}`}
                      type="button"
                      onClick={() => onSetActiveRow(rowNumber)}
                      className={`min-w-[112px] rounded-xl border px-3 py-2 text-left transition ${
                        isActive
                          ? 'border-violet-500 bg-violet-600 text-white shadow-sm'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50'
                      }`}
                    >
                      <span className="block text-sm font-semibold leading-tight tracking-tight">Row {rowNumber}</span>
                      <span
                        className={`mt-1 block text-xs leading-snug ${availabilityCountTextClass(rowAvailLevel, isActive)}`}
                      >
                        {availabilityCountLabel(availableInRow)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <section className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              3) Choose seats
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {currentSectionName && currentRowNumber !== null
                ? `Section ${currentSectionName} · Row ${currentRowNumber}`
                : 'Select a section and row to see seats'}
            </p>
            {canSelectSeats && seatHint ? (
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                {seatHint}
              </p>
            ) : null}
            <ul className="mt-4 flex flex-wrap gap-2">
              {fullRowSeats.map((s: SeatInfo) => {
                const heldByMe = serverSynced.has(s.id);
                const taken =
                  availabilityResolved && !availableSeatIdSet.has(s.id) && !heldByMe;
                const selected = selectedIds.has(s.id) || heldByMe;
                const viewOnlyAvailable = !canSelectSeats && !taken;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      disabled={taken || !canSelectSeats || (syncing && !selected)}
                      onClick={() => {
                        if (!taken && canSelectSeats) onToggleSeat(s.id);
                      }}
                      title={
                        taken
                          ? `Seat ${s.number} — taken`
                          : !canSelectSeats
                            ? `Seat ${s.number} — available · ${formatPrice(s.price, s.currency)} (sign in to select)`
                            : heldByMe
                              ? `Seat ${s.number} — your hold · ${formatPrice(s.price, s.currency)}`
                              : `${s.section}-${s.row}-${s.number} · ${formatPrice(s.price, s.currency)}`
                      }
                      className={`
                        h-9 min-w-9 rounded-lg border px-2 text-center text-xs font-semibold tabular-nums transition
                        ${taken
                          ? 'cursor-not-allowed border-red-200 bg-red-50 text-red-600 opacity-95'
                          : viewOnlyAvailable
                            ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-600'
                            : selected
                              ? 'border-violet-500 bg-violet-600 text-white shadow-md shadow-violet-500/20'
                              : 'border-slate-300 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50'}
                      `}
                    >
                      {s.number}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
            {canSelectSeats ? (
              <>
                <div className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">{selectedCount}</span> seat
                  {selectedCount !== 1 ? 's' : ''} reserved for you
                </div>
                <Button
                  onClick={onContinue}
                  disabled={selectedCount === 0 || syncing}
                  loading={syncing}
                >
                  Continue with {selectedCount} seat{selectedCount !== 1 ? 's' : ''}
                </Button>
              </>
            ) : (
              <p className="text-sm text-slate-600">
                Map is for browsing only.{' '}
                <Link to="/login" state={{ from: signInReturnPath }} className="font-semibold text-violet-600 hover:text-violet-500">
                  Sign in
                </Link>{' '}
                to select seats and continue to checkout.
              </p>
            )}
          </div>
        </>
      )}
    </Card>
  );
}

/** Share of seats still available vs full catalog capacity for that section or row. */
type AvailabilityLevel = 'none' | 'low' | 'mid' | 'high';

function availabilityLevel(available: number, total: number): AvailabilityLevel {
  if (total <= 0) return 'high';
  if (available <= 0) return 'none';
  const pct = (available / total) * 100;
  if (pct <= 10) return 'low';
  if (pct <= 30) return 'mid';
  return 'high';
}

function availabilityCountLabel(available: number): string {
  if (available <= 0) return 'Sold out';
  return `${available} left`;
}

function availabilityCountTextClass(level: AvailabilityLevel, selected: boolean): string {
  if (selected) {
    switch (level) {
      case 'none':
        return 'text-rose-200';
      case 'low':
        return 'text-orange-200';
      case 'mid':
        return 'text-amber-100';
      case 'high':
        return 'text-emerald-200';
    }
  }
  switch (level) {
    case 'none':
      return 'font-semibold text-red-600';
    case 'low':
      return 'font-medium text-orange-700';
    case 'mid':
      return 'text-amber-700';
    case 'high':
      return 'font-medium text-emerald-700';
  }
}
