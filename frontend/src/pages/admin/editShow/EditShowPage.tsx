import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useCoverPhoto, useScrollToFirstError, useShow, useUpdateShow } from '@/hooks';
import { queryKeys } from '@/config/queryKeys';
import { dateToLocalDatetimeString } from '@/utils';
import type { EventCategory, Show } from '@/types/api';
import type { PickedPlace } from '@/pages/admin/createShow/types';
import { useCreateShowFormState } from '@/pages/admin/createShow/useCreateShowFormState';
import { useCreateShowValidationState } from '@/pages/admin/createShow/useCreateShowValidationState';
import {
  CoverArtworkSection,
  EventDetailsSection,
  LocationSection,
  TimeSection,
} from '@/pages/admin/createShow/sections';
import { buildUpdateShowPayload } from './payload';
import { EditShowHeader } from './EditShowHeader';
import { UpdateActionsSection } from './UpdateActionsSection';
import { validateUpdateShowForm } from './validateUpdateShowForm';

function toLocalDatetimeValue(iso?: string): string {
  if (!iso) return '';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return '';
  return dateToLocalDatetimeString(parsed);
}

function getEventCategory(show: Show): EventCategory {
  return (show.category ?? 'other') as EventCategory;
}

export function EditShowPage() {
  const params = useParams<{ showId: string }>();
  const showId = params.showId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const updateShow = useUpdateShow();
  const cover = useCoverPhoto();
  const { data: show, isLoading, isError } = useShow(showId);

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
    applyPickedPlace,
  } = useCreateShowFormState();
  const {
    fieldErrors,
    applyValidationFailure,
    resetValidationErrors,
    clearFieldError,
    clearLocationErrors,
  } = useCreateShowValidationState();

  const formRef = useRef<HTMLFormElement | null>(null);
  const hydratedShowIdRef = useRef<string | null>(null);
  const { scrollToFirstError } = useScrollToFirstError(formRef);

  useEffect(() => {
    if (!show) return;
    if (hydratedShowIdRef.current === show.id) return;

    setTitle(show.title ?? '');
    setCategory(getEventCategory(show));
    setDescription(show.description ?? '');
    setDoorsOpenTime(toLocalDatetimeValue(show.doorsOpenTime));
    setStartTime(toLocalDatetimeValue(show.startTime));
    setEndTime(toLocalDatetimeValue(show.endTime));
    setVenueName(show.venue?.venueName ?? '');
    setCity(show.venue?.city ?? '');
    setCountry(show.venue?.country ?? '');
    setAddress(show.venue?.address ?? '');
    setGeoLat(String(show.venue?.geo?.lat ?? ''));
    setGeoLng(String(show.venue?.geo?.lng ?? ''));
    cover.onUrlChange(show.coverImageUrl ?? '');
    resetValidationErrors();
    hydratedShowIdRef.current = show.id;
  }, [
    cover,
    resetValidationErrors,
    setAddress,
    setCategory,
    setCity,
    setCountry,
    setDescription,
    setDoorsOpenTime,
    setEndTime,
    setGeoLat,
    setGeoLng,
    setStartTime,
    setTitle,
    setVenueName,
    show,
  ]);

  if (!showId) {
    return <p className="mx-auto max-w-3xl px-4 py-8 text-sm text-red-600 sm:px-6 lg:px-8">Missing show id.</p>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateUpdateShowForm({
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
    });

    if (!validation.ok) {
      applyValidationFailure({ ok: false, errors: validation.errors, sectionErrors: [] });
      scrollToFirstError();
      return;
    }

    resetValidationErrors();

    const body = buildUpdateShowPayload({
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
    });

    updateShow.mutate(
      { id: showId, body },
      {
        onSuccess: (updatedShow) => {
          queryClient.invalidateQueries({ queryKey: queryKeys.shows });
          queryClient.invalidateQueries({ queryKey: queryKeys.show(showId) });
          navigate(`/shows/${updatedShow.id}`, { replace: true });
        },
      }
    );
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(124,58,237,0.12),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-violet-200/60 to-transparent" />

      <div className="mx-auto max-w-3xl px-4 pb-16 pt-2 sm:px-6 lg:px-8">
        <EditShowHeader />

        {isLoading ? <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Loading show...</p> : null}
        {isError ? <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">Could not load this show.</p> : null}

        {show ? (
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

            <CoverArtworkSection cover={cover} fieldErrors={fieldErrors} clearFieldError={clearFieldError} />

            <section className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 text-sm text-slate-600">
              Seating and pricing cannot be changed here.
            </section>

            <UpdateActionsSection isPending={updateShow.isPending} showId={showId} />
          </form>
        ) : null}
      </div>
    </div>
  );
}
