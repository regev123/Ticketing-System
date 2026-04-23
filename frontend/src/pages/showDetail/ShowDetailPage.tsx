import { Link } from 'react-router-dom';
import { Loading, ErrorMessage } from '@/components';
import { EventDetailsSection, SeatSelectionSection } from './sections';
import { useShowDetailPageState } from './useShowDetailPageState';

export function ShowDetailPage() {
  const {
    showId,
    show,
    showLoading,
    showError,
    isLoading,
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
  } = useShowDetailPageState();

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

  return (
    <div className="space-y-8">
      <EventDetailsSection
        show={show}
        categoryLabel={categoryLabel}
        descriptionLines={descriptionLines}
        doorsOpenText={doorsOpenText}
        endsAtText={endsAtText}
        cityCountry={cityCountry}
        addressLine={addressLine}
      />

      <SeatSelectionSection
        isLoading={isLoading}
        sectionLayouts={sectionLayouts}
        currentSectionName={currentSectionName}
        currentSectionLayout={currentSectionLayout}
        currentRowNumber={currentRowNumber}
        fullRowSeats={fullRowSeats}
        catalogCountBySection={catalogCountBySection}
        catalogCountBySectionRow={catalogCountBySectionRow}
        pickableSeatIdSet={pickableSeatIdSet}
        availabilityResolved={availabilityResolved}
        availableSeatIdSet={availableSeatIdSet}
        serverSynced={serverSynced}
        selectedIds={selectedIds}
        syncing={syncing}
        seatHint={seatHint}
        selectedCount={selectedCount}
        currency={currency}
        canSelectSeats={isAuthenticated}
        signInReturnPath={`/shows/${showId}`}
        selectionSummaryLines={selectionSummaryLines}
        selectedSubtotal={isAuthenticated ? selectedTotal : null}
        onSetActiveSection={(section) => {
          setActiveSection(section);
          setActiveRow(null);
        }}
        onSetActiveRow={setActiveRow}
        onToggleSeat={toggleSeat}
        onContinue={() => void handleContinue()}
      />
    </div>
  );
}
