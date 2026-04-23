import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateShow, useCoverPhoto, useScrollToFirstError } from '@/hooks';
import { queryKeys } from '@/config/queryKeys';
import { buildCreateShowPayload } from './payload';
import { CreateShowHeader } from './CreateShowHeader';
import type { PickedPlace } from './types';
import { useCreateShowFormState } from './useCreateShowFormState';
import { useCreateShowValidationState } from './useCreateShowValidationState';
import {
  CoverArtworkSection,
  EventDetailsSection,
  LocationSection,
  PublishActionsSection,
  SeatingPricingSection,
  TimeSection,
} from './sections';
import { validateCreateShowForm } from './validateCreateShowForm';

export function CreateShowPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createShow = useCreateShow();
  const cover = useCoverPhoto();
  const {
    title,
    setTitle,
    category,
    setCategory,
    description,
    setDescription,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    doorsOpenTime,
    setDoorsOpenTime,
    venueName,
    setVenueName,
    city,
    setCity,
    country,
    setCountry,
    address,
    setAddress,
    geoLat,
    setGeoLat,
    geoLng,
    setGeoLng,
    sections,
    addSection,
    updateSection,
    removeSection,
    applyPickedPlace,
  } = useCreateShowFormState();

  const {
    fieldErrors,
    sectionErrors,
    applyValidationFailure,
    resetValidationErrors,
    clearFieldError,
    clearLocationErrors,
  } = useCreateShowValidationState();
  const formRef = useRef<HTMLFormElement | null>(null);
  const { scrollToFirstError } = useScrollToFirstError(formRef);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateCreateShowForm({
      title,
      category,
      description,
      doorsOpenTime,
      startTime,
      endTime,
      venueName,
      city,
      country,
      address,
      geoLat,
      geoLng,
      coverUrl: cover.value,
      sections,
    });

    if (!validation.ok) {
      applyValidationFailure(validation);
      scrollToFirstError();
      return;
    }

    resetValidationErrors();

    const payload = buildCreateShowPayload({
      title,
      category,
      description,
      venueName,
      city,
      country,
      address,
      geoLat,
      geoLng,
      startTime,
      endTime,
      doorsOpenTime,
      coverUrl: cover.value,
      sections,
    });
    createShow.mutate(payload, {
      onSuccess: (show) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.shows });
        navigate(`/shows/${show.id}`, { replace: true });
      },
    });
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(124,58,237,0.12),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-violet-200/60 to-transparent" />

      <div className="mx-auto max-w-3xl px-4 pb-16 pt-2 sm:px-6 lg:px-8">
        <CreateShowHeader />

        <form ref={formRef} noValidate onSubmit={handleSubmit} className="space-y-8">
          <EventDetailsSection
            title={title}
            category={category}
            description={description}
            fieldErrors={fieldErrors}
            onTitleChange={setTitle}
            onCategoryChange={setCategory}
            onDescriptionChange={setDescription}
            clearFieldError={clearFieldError}
          />

          <TimeSection
            doorsOpenTime={doorsOpenTime}
            startTime={startTime}
            endTime={endTime}
            fieldErrors={fieldErrors}
            onDoorsOpenTimeChange={setDoorsOpenTime}
            onStartTimeChange={setStartTime}
            onEndTimeChange={setEndTime}
            clearFieldError={clearFieldError}
          />

          <LocationSection
            venueName={venueName}
            city={city}
            country={country}
            address={address}
            geoLat={geoLat}
            geoLng={geoLng}
            fieldErrors={fieldErrors}
            onVenueNameChange={setVenueName}
            onCityChange={setCity}
            onCountryChange={setCountry}
            onAddressChange={setAddress}
            onGeoLatChange={setGeoLat}
            onGeoLngChange={setGeoLng}
            onPlacePick={(payload: PickedPlace) => {
              applyPickedPlace(payload);
              clearLocationErrors();
            }}
            clearFieldError={clearFieldError}
          />

          <CoverArtworkSection
            cover={cover}
            fieldErrors={fieldErrors}
            clearFieldError={clearFieldError}
          />

          <SeatingPricingSection
            sections={sections}
            sectionErrors={sectionErrors}
            addSection={addSection}
            updateSection={updateSection}
            removeSection={removeSection}
          />

          <PublishActionsSection isPending={createShow.isPending} />
        </form>
      </div>
    </div>
  );
}
