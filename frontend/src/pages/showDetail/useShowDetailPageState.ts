import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { reservationsApi } from '@/api/reservations';
import { useAuth, useAvailability, useDebouncedSeatHold, useShow } from '@/hooks';
import { getEventCategoryLabel } from '@/data/eventCategories';
import { formatDate, formatPrice } from '@/utils';
import type { SeatInfo } from '@/types/api';
import { buildSeatSelectionSummaryLines } from './seatSelectionSummary';

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

export function useShowDetailPageState() {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeRow, setActiveRow] = useState<number | null>(null);

  const { isAuthenticated } = useAuth();
  const { data: show, isLoading: showLoading, error: showError } = useShow(showId);
  const { data: availability, isLoading: availLoading } = useAvailability(showId);
  const { selectedIds, serverSynced, toggleSeat, syncing, hint: seatHint, flush } =
    useDebouncedSeatHold(showId, isAuthenticated);

  const selectionIds = useMemo(
    () => new Set([...selectedIds, ...serverSynced]),
    [selectedIds, serverSynced]
  );

  const selectionSummaryLines = useMemo(() => {
    if (!isAuthenticated || !show || selectionIds.size === 0) return [];
    return buildSeatSelectionSummaryLines(show.seats, selectionIds);
  }, [isAuthenticated, show, selectionIds]);

  const mapFocusPendingRef = useRef(true);
  useEffect(() => {
    mapFocusPendingRef.current = true;
  }, [showId]);

  useEffect(() => {
    if (!show) return;
    if (selectionIds.size === 0) {
      mapFocusPendingRef.current = true;
      return;
    }
    if (!mapFocusPendingRef.current) return;
    mapFocusPendingRef.current = false;
    const first = show.seats.find((s) => selectionIds.has(s.id));
    if (first) {
      setActiveSection(first.section);
      setActiveRow(first.row);
    }
  }, [show, selectionIds]);

  const handleContinue = useCallback(async () => {
    if (!showId || selectionIds.size === 0 || !show || !isAuthenticated) return;
    const hold = await flush();
    if (!hold) return;
    let checkoutHold = hold;
    try {
      await reservationsApi.extendHold({
        holdId: hold.holdId,
        showId: hold.showId,
        seats: [...hold.seatIds],
        ttlSeconds: 300,
      });
      const refreshed = await reservationsApi.getMyActiveHold(showId);
      if (refreshed) checkoutHold = refreshed;
    } catch {
      // If extend fails, continue with the current hold rather than blocking checkout.
    }
    navigate('/checkout', {
      state: {
        hold: {
          ...checkoutHold,
          seatIds: Array.from(selectionIds),
        },
        show,
      },
    });
  }, [showId, selectionIds, show, isAuthenticated, flush, navigate]);

  const categoryLabel = show ? getEventCategoryLabel(show.category) : '';
  const cityCountry = show ? [show.venue.city, show.venue.country].filter((s) => s?.trim()).join(', ') : '';
  const addressLine = show?.venue.address?.trim() ?? '';
  const doorsOpenText = show?.doorsOpenTime ? formatDate(show.doorsOpenTime) : '—';
  const endsAtText = show?.endTime ? formatDate(show.endTime) : '—';
  const selectedCount = isAuthenticated ? selectionIds.size : 0;
  const descriptionLines = splitDescriptionLines(show?.description);

  const availabilityResolved = !availLoading && availability !== undefined;
  const availableSeatIdSet = useMemo(
    () => new Set(
      show
        ? (availabilityResolved ? availability!.seats.map((s) => s.id) : show.seats.map((s) => s.id))
        : []
    ),
    [availability, availabilityResolved, show]
  );
  const pickableSeatIdSet = useMemo(() => {
    const set = new Set<string>();
    if (!show) return set;
    if (availabilityResolved) availability!.seats.forEach((s) => set.add(s.id));
    else show.seats.forEach((s) => set.add(s.id));
    serverSynced.forEach((id) => set.add(id));
    return set;
  }, [availability, availabilityResolved, serverSynced, show]);

  const pricingSeats = availability?.seats?.length ? availability.seats : (show?.seats ?? []);
  const currency = pricingSeats[0]?.currency;
  const selectedTotal = isAuthenticated && show
    ? show.seats.filter((seat) => selectionIds.has(seat.id)).reduce((sum, seat) => sum + seat.price, 0)
    : 0;

  const catalogCountBySection = useMemo(() => (show
    ? show.seats.reduce<Record<string, number>>((acc, s) => {
      acc[s.section] = (acc[s.section] ?? 0) + 1;
      return acc;
    }, {})
    : {}), [show]);
  const catalogCountBySectionRow = useMemo(() => (show
    ? show.seats.reduce<Record<string, number>>((acc, s) => {
      const key = `${s.section}-${s.row}`;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {})
    : {}), [show]);
  const sectionLayouts: SectionLayout[] = useMemo(() => {
    if (!show) return [];
    const seatsBySection = show.seats.reduce<Record<string, SeatInfo[]>>((acc, seat) => {
      if (!acc[seat.section]) acc[seat.section] = [];
      acc[seat.section].push(seat);
      return acc;
    }, {});
    return Object.keys(seatsBySection).sort().map((sectionName) => {
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
      const availableCount = sectionSeats.filter((s) => pickableSeatIdSet.has(s.id)).length;
      return { sectionName, rows, availableCount, priceLabel: sectionSummaryPrice(sectionSeats) };
    });
  }, [pickableSeatIdSet, show]);
  const sectionNames = sectionLayouts.map((s) => s.sectionName);
  const currentSectionName =
    activeSection && sectionNames.includes(activeSection) ? activeSection : (sectionNames[0] ?? null);
  const currentSectionLayout = currentSectionName
    ? sectionLayouts.find((section) => section.sectionName === currentSectionName) ?? null
    : null;
  const rowNumbers = currentSectionLayout?.rows.map((row) => row.rowNumber) ?? [];
  const currentRowNumber =
    activeRow !== null && rowNumbers.includes(activeRow) ? activeRow : (rowNumbers[0] ?? null);
  const fullRowSeats =
    currentSectionName != null && currentRowNumber != null && show
      ? show.seats
        .filter((s) => s.section === currentSectionName && s.row === currentRowNumber)
        .sort((a, b) => a.number - b.number)
      : [];

  return {
    showId,
    show,
    showLoading,
    showError,
    isLoading: availLoading,
    isAuthenticated,
    categoryLabel,
    cityCountry,
    addressLine,
    doorsOpenText,
    endsAtText,
    selectedCount,
    selectionSummaryLines,
    selectedTotal,
    currency,
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
    descriptionLines,
    toggleSeat,
    handleContinue,
    setActiveSection,
    setActiveRow,
  };
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

function splitDescriptionLines(description?: string | null): string[] {
  if (!description) return [];

  return description
    .split('.')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((sentence) => `${sentence}.`);
}
