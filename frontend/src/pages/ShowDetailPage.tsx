import { useState, useCallback, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useShow, useAvailability, useDebouncedSeatHold } from '@/hooks';
import { Button, Card, Loading, ErrorMessage } from '@/components';
import { getEventCategoryLabel } from '@/data/eventCategories';
import { formatDate, formatPrice } from '@/utils';
import { DEMO_USER_ID } from '@/config/constants';
import type { SeatInfo } from '@/types/api';

export function ShowDetailPage() {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeRow, setActiveRow] = useState<number | null>(null);

  const { data: show, isLoading: showLoading, error: showError } = useShow(showId);
  const { data: availability, isLoading: availLoading } = useAvailability(showId);
  const { selectedIds, serverSynced, toggleSeat, syncing, hint: seatHint, flush } =
    useDebouncedSeatHold(showId, DEMO_USER_ID);

  /** Selection + seats already held for this user on the server (same as “selected” visually). */
  const selectionIds = useMemo(
    () => new Set([...selectedIds, ...serverSynced]),
    [selectedIds, serverSynced]
  );

  const handleContinue = useCallback(async () => {
    if (!showId || selectionIds.size === 0 || !show) return;
    const hold = await flush();
    if (!hold) return;
    navigate('/checkout', {
      state: {
        hold: {
          ...hold,
          seatIds: Array.from(selectionIds),
        },
        show,
      },
    });
  }, [showId, selectionIds, show, flush, navigate]);

  if (showLoading || !showId) return <Loading />;
  if (showError) {
    return (
      <div className="mx-auto max-w-lg">
        <ErrorMessage
          message={showError instanceof Error ? showError.message : 'Show not found'}
        />
        <Link className="mt-4 inline-block text-sm font-medium text-violet-600 hover:underline" to="/">
          ← Back to shows
        </Link>
      </div>
    );
  }
  if (!show) return null;

  const isLoading = availLoading;
  const categoryLabel = getEventCategoryLabel(show.category);
  const v = show.venue;
  const cityCountry = [v.city, v.country].filter((s) => s?.trim()).join(', ');
  const addressLine = v.address?.trim();

  const doorsOpenText = show.doorsOpenTime ? formatDate(show.doorsOpenTime) : '—';
  const endsAtText = show.endTime ? formatDate(show.endTime) : '—';
  const selectedCount = selectionIds.size;

  /** Seats others can still book (from API) plus seats this user holds — keeps rows visible when you hold a full row. */
  const availabilityResolved = !availLoading && availability !== undefined;
  const availableSeatIdSet = new Set(
    availabilityResolved ? availability!.seats.map((s) => s.id) : show.seats.map((s) => s.id)
  );
  const pickableSeatIdSet = new Set<string>();
  if (availabilityResolved) {
    availability!.seats.forEach((s) => pickableSeatIdSet.add(s.id));
  } else {
    show.seats.forEach((s) => pickableSeatIdSet.add(s.id));
  }
  serverSynced.forEach((id) => pickableSeatIdSet.add(id));

  const pricingSeats = availability?.seats?.length ? availability.seats : show.seats;
  const minPrice =
    pricingSeats.length > 0 ? Math.min(...pricingSeats.map((s) => s.price)) : null;
  const currency = pricingSeats[0]?.currency;
  const selectedTotal = show.seats
    .filter((seat) => selectionIds.has(seat.id))
    .reduce((sum, seat) => sum + seat.price, 0);
  const catalogCountBySection = show.seats.reduce<Record<string, number>>((acc, s) => {
    acc[s.section] = (acc[s.section] ?? 0) + 1;
    return acc;
  }, {});
  const catalogCountBySectionRow = show.seats.reduce<Record<string, number>>((acc, s) => {
    const key = `${s.section}-${s.row}`;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const seatsBySection = show.seats.reduce<Record<string, SeatInfo[]>>((acc, seat) => {
    if (!acc[seat.section]) acc[seat.section] = [];
    acc[seat.section].push(seat);
    return acc;
  }, {});
  const sectionNames = Object.keys(seatsBySection).sort();
  const sectionLayouts = sectionNames.map((sectionName) => {
    const sectionSeats = seatsBySection[sectionName];
    const rowsMap = sectionSeats.reduce<Record<number, SeatInfo[]>>((acc, seat) => {
      if (!acc[seat.row]) acc[seat.row] = [];
      acc[seat.row].push(seat);
      return acc;
    }, {});

    const rows = Object.keys(rowsMap)
      .map((rowKey) => Number(rowKey))
      .sort((a, b) => a - b)
      .map((rowNumber) => ({
        rowNumber,
        seats: rowsMap[rowNumber].sort((a, b) => a.number - b.number),
      }));

    const priceLabel = sectionSummaryPrice(sectionSeats);
    const availableCount = sectionSeats.filter((s) => pickableSeatIdSet.has(s.id)).length;

    return { sectionName, rows, availableCount, priceLabel };
  });
  const currentSectionName =
    activeSection && sectionNames.includes(activeSection) ? activeSection : (sectionNames[0] ?? null);
  const currentSectionLayout = currentSectionName
    ? sectionLayouts.find((section) => section.sectionName === currentSectionName) ?? null
    : null;
  const rowNumbers = currentSectionLayout?.rows.map((row) => row.rowNumber) ?? [];
  const currentRowNumber =
    activeRow !== null && rowNumbers.includes(activeRow) ? activeRow : (rowNumbers[0] ?? null);
  /** After availability loads, only these seat IDs can be selected; others in the row are taken. */
  const fullRowSeats =
    currentSectionName != null && currentRowNumber != null
      ? show.seats
          .filter((s) => s.section === currentSectionName && s.row === currentRowNumber)
          .sort((a, b) => a.number - b.number)
      : [];
  const descriptionLines = splitDescriptionLines(show.description);

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-violet-50/40 to-indigo-50/30 p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-200/30 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-indigo-200/30 blur-3xl" />
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="relative inline-flex items-center rounded-full border border-violet-200 bg-white/80 px-3 py-1 text-xs font-semibold tracking-wide text-violet-700">
              Reserve Seats
            </span>
          </div>
        </div>
        <div className="relative mt-4 flex flex-wrap items-start justify-between gap-6">
          <div>
            <Link
              to="/"
              className="text-sm font-medium text-violet-600 transition hover:text-violet-500"
            >
              ← All shows
            </Link>
            <h1 className="mt-3 max-w-4xl font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {show.title}
            </h1>
            <div className="mt-4">
              <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-100/80 px-3 py-1 text-xs font-semibold text-violet-700">
                {categoryLabel}
              </span>
            </div>
            {descriptionLines.length > 0 ? (
              <div className="mt-4 max-w-3xl space-y-2 text-[15px] leading-7 text-slate-600">
                {descriptionLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            ) : null}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-sm text-slate-700 shadow-sm">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <ClockIcon className="h-3.5 w-3.5" />
                  Doors open
                </p>
                <p className="mt-1 font-medium">{doorsOpenText}</p>
              </div>
              <div className="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-sm text-slate-700 shadow-sm">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <PlayIcon className="h-3.5 w-3.5" />
                  Start time
                </p>
                <p className="mt-1 font-medium">{formatDate(show.startTime)}</p>
              </div>
              <div className="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-sm text-slate-700 shadow-sm">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <CheckIcon className="h-3.5 w-3.5" />
                  End time
                </p>
                <p className="mt-1 font-medium">{endsAtText}</p>
              </div>
              <div className="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-sm text-slate-700 shadow-sm">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <PinIcon className="h-3.5 w-3.5" />
                  Venue
                </p>
                <p className="mt-1 font-medium text-slate-900">{v.venueName}</p>
                {addressLine ? <p className="mt-1 text-sm text-slate-600">{addressLine}</p> : null}
                {cityCountry ? <p className="mt-0.5 text-xs text-slate-500">{cityCountry}</p> : null}
              </div>
            </div>
          </div>
          <div className="min-w-[260px] rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quick info</p>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <p className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <SeatIcon className="h-3.5 w-3.5" />
                  Total seats
                </span>
                <span className="font-semibold">{show.seats.length}</span>
              </p>
              <p className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <SelectIcon className="h-3.5 w-3.5" />
                  Selected
                </span>
                <span className="font-semibold text-violet-700">{selectedCount}</span>
              </p>
              <p className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <TagIcon className="h-3.5 w-3.5" />
                  From price
                </span>
                <span className="font-semibold">
                  {minPrice !== null && currency ? formatPrice(minPrice, currency) : '—'}
                </span>
              </p>
              <p className="flex items-center justify-between gap-4 border-t border-slate-100 pt-2">
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <WalletIcon className="h-3.5 w-3.5" />
                  Current total
                </span>
                <span className="font-semibold text-violet-700">
                  {selectedCount > 0 && currency ? formatPrice(selectedTotal, currency) : '—'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card className="rounded-3xl border border-slate-200/80 p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-900">Select seats</h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose your seats and continue to secure them for checkout
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
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-violet-600" />
              Selected
            </span>
          </div>
        </div>
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
                        onClick={() => {
                          setActiveSection(sectionName);
                          setActiveRow(null);
                        }}
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
                        onClick={() => setActiveRow(rowNumber)}
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
              {seatHint ? (
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
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        disabled={taken || (syncing && !selected)}
                        onClick={() => {
                          if (!taken) toggleSeat(s.id);
                        }}
                        title={
                          taken
                            ? `Seat ${s.number} — taken`
                            : heldByMe
                              ? `Seat ${s.number} — your hold · ${formatPrice(s.price, s.currency)}`
                              : `${s.section}-${s.row}-${s.number} · ${formatPrice(s.price, s.currency)}`
                        }
                        className={`
                          h-9 min-w-9 rounded-lg border px-2 text-center text-xs font-semibold tabular-nums transition
                          ${taken
                            ? 'cursor-not-allowed border-red-200 bg-red-50 text-red-600 opacity-95'
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
              <div className="text-sm text-slate-600">
                <span className="font-semibold text-slate-800">{selectedCount}</span> seat
                {selectedCount !== 1 ? 's' : ''} selected
              </div>
              <Button
                onClick={() => void handleContinue()}
                disabled={selectedCount === 0 || syncing}
                loading={syncing}
              >
                Continue with {selectedCount} seat{selectedCount !== 1 ? 's' : ''}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

interface IconProps {
  className?: string;
}

function ClockIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlayIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M9 7l8 5-8 5V7z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.3 2.3 4.7-4.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M12 21s-6-5.4-6-10a6 6 0 1112 0c0 4.6-6 10-6 10z" />
      <circle cx="12" cy="11" r="2.2" />
    </svg>
  );
}

function SeatIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M6 11V8a2 2 0 114 0v3M14 11V8a2 2 0 114 0v3" />
      <path d="M4 11h16v5H4z" />
      <path d="M6 16v2M18 16v2" strokeLinecap="round" />
    </svg>
  );
}

function SelectIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M6 12l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TagIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M20 13l-7 7-9-9V4h7l9 9z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8.5" cy="8.5" r="1.4" />
    </svg>
  );
}

function WalletIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M15 12h6" />
      <circle cx="15.5" cy="12" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function sectionSummaryPrice(sectionSeats: SeatInfo[]): string {
  if (sectionSeats.length === 0) return '—';
  const currency = sectionSeats[0].currency;
  const uniquePrices = [...new Set(sectionSeats.map((s) => s.price))].sort((a, b) => a - b);
  if (uniquePrices.length === 1) {
    return formatPrice(uniquePrices[0], currency);
  }
  return `From ${formatPrice(uniquePrices[0], currency)}`;
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

function splitDescriptionLines(description?: string | null): string[] {
  if (!description) return [];

  return description
    .split('.')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((sentence) => `${sentence}.`);
}

