import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateShow, useCoverPhoto } from '@/hooks';
import { Button, ErrorMessage } from '@/components';
import {
  AdminFormSection,
  CoverPhotoField,
  FormTextField,
  FORM_INPUT,
  ModernDateTimeField,
  PlaceSearch,
  SectionFormCard,
} from '@/components/forms';
import { FormSelect } from '@/components/forms/FormSelect';
import { queryKeys } from '@/config/queryKeys';
import { EVENT_CATEGORY_OPTIONS } from '@/data/eventCategories';
import { DEFAULT_SECTION, defaultStartTime, defaultDoorsOpenTime, defaultEndTime } from '@/pages/createShow/constants';
import {
  validateCreateShowForm,
  type CreateShowFormErrors,
  type SectionErrors,
} from '@/pages/createShow/validateCreateShowForm';
import type { CreateShowRequest, EventCategory, SectionInput } from '@/types/api';

function isPreviewableCoverUrl(value: string): boolean {
  const v = value.trim();
  return v.startsWith('http') || v.startsWith('data:');
}

const iconCalendar = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const iconImage = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const iconSeats = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const iconClock = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const iconMapPin = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-4.5-7-11a7 7 0 1114 0c0 6.5-7 11-7 11z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10a2 2 0 100-4 2 2 0 000 4z" />
  </svg>
);

export function CreateShowPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createShow = useCreateShow();
  const cover = useCoverPhoto();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('live');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<CreateShowFormErrors>({});
  const [sectionErrors, setSectionErrors] = useState<SectionErrors[]>([]);

  // Time
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime());
  const [doorsOpenTime, setDoorsOpenTime] = useState(defaultDoorsOpenTime());

  // Location
  const [venueName, setVenueName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [address, setAddress] = useState('');
  const [geoLat, setGeoLat] = useState<string>('');
  const [geoLng, setGeoLng] = useState<string>('');
  const [sections, setSections] = useState<SectionInput[]>([{ ...DEFAULT_SECTION }]);

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      { ...DEFAULT_SECTION, section: String.fromCharCode(65 + prev.length) },
    ]);
  };

  const updateSection = (index: number, patch: Partial<SectionInput>) => {
    setSections((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const removeSection = (index: number) => {
    if (sections.length <= 1) return;
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

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
      setFieldErrors(validation.errors);
      setSectionErrors(validation.sectionErrors);
      setFormError('Please fix the highlighted fields and try again.');
      return;
    }

    setFieldErrors({});
    setSectionErrors([]);

    const trimmedCover = cover.value.trim();
    const trimmedDescription = description.trim();
    const trimmedVenueName = venueName.trim();
    const trimmedCity = city.trim();
    const trimmedCountry = country.trim();
    const trimmedAddress = address.trim();

    const lat = Number(geoLat.trim());
    const lng = Number(geoLng.trim());
    const payload: CreateShowRequest = {
      title: title.trim(),
      category,
      description: trimmedDescription ? trimmedDescription : undefined,
      venue: {
        venueName: trimmedVenueName,
        city: trimmedCity,
        country: trimmedCountry,
        address: trimmedAddress,
        geo: { lat, lng },
      },
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      doorsOpenTime: new Date(doorsOpenTime).toISOString(),
      sections,
      ...(trimmedCover ? { coverImageUrl: trimmedCover } : {}),
    };
    createShow.mutate(payload, {
      onSuccess: (show) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.shows });
        navigate(`/shows/${show.id}`, { replace: true });
      },
    });
  };

  const coverPreviewSrc =
    cover.value.trim() && isPreviewableCoverUrl(cover.value) ? cover.value.trim() : null;

  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(124,58,237,0.12),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-violet-200/60 to-transparent" />

      <div className="mx-auto max-w-3xl px-4 pb-16 pt-2 sm:px-6 lg:px-8">
        <nav className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 transition hover:text-violet-500"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </span>
              Back to admin
            </Link>
            <h1 className="font-display mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Create event
            </h1>
            <p className="mt-2 max-w-xl text-base text-slate-600">
              Add a concert or show to the catalog. Configure venue, schedule, optional artwork, and seating zones with
              pricing.
            </p>
          </div>
        </nav>

        <form noValidate onSubmit={handleSubmit} className="space-y-8">
          {createShow.error ? (
            <ErrorMessage
              message={createShow.error instanceof Error ? createShow.error.message : 'Failed to create show'}
              onRetry={() => createShow.reset()}
            />
          ) : null}
          {formError ? <ErrorMessage message={formError} /> : null}

          <AdminFormSection
            icon={iconCalendar}
            title="Event details"
            description="Title, category, and a public description shown to customers."
          >
            <div className="space-y-5">
              <FormTextField
                id="title"
                label="Event title"
                type="text"
                required
                value={title}
                error={fieldErrors.title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: undefined }));
                }}
                placeholder="e.g. Summer Nights Tour 2025"
                hint="Shown on the home page and event page."
              />
              <div className="space-y-1.5">
                <label id="category-label" htmlFor="category" className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <span>Category</span>
                  <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-violet-700 ring-1 ring-violet-100">
                    Required
                  </span>
                </label>
                <FormSelect
                  id="category"
                  value={category}
                  options={EVENT_CATEGORY_OPTIONS}
                  onChange={(value: string) => setCategory(value as EventCategory)}
                  ariaLabelledBy="category-label"
                />
                <p className="text-xs text-slate-400">Used for event badges and filtering.</p>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="description" className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <span>Description</span>
                  <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-slate-600 ring-1 ring-slate-200/80">
                    Optional
                  </span>
                </label>
                <textarea
                  id="description"
                  className={`${FORM_INPUT} ${
                    fieldErrors.description ? 'border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-500/20' : ''
                  }`}
                  rows={4}
                  maxLength={1200}
                  value={description}
                  aria-invalid={fieldErrors.description ? true : undefined}
                  aria-describedby={fieldErrors.description ? 'description-error' : undefined}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (fieldErrors.description) setFieldErrors((prev) => ({ ...prev, description: undefined }));
                  }}
                  placeholder="Tell people what this event is about..."
                />
                {fieldErrors.description ? (
                  <p id="description-error" className="text-sm font-medium text-red-600" role="alert">
                    {fieldErrors.description}
                  </p>
                ) : null}
                <p className="text-xs text-slate-400">Optional. Up to 1200 characters.</p>
              </div>
            </div>
          </AdminFormSection>

          <AdminFormSection
            icon={iconClock}
            title="Time"
            description="Start time, end time, and doors open time."
          >
            <div className="flex flex-col gap-5">
              <ModernDateTimeField
                id="doorsOpenTime"
                value={doorsOpenTime}
                onChange={(next) => {
                  setDoorsOpenTime(next);
                  if (fieldErrors.doorsOpenTime) setFieldErrors((prev) => ({ ...prev, doorsOpenTime: undefined }));
                }}
                required
                heading="Doors open time"
                hint="Shown to customers as the first entry time."
                error={fieldErrors.doorsOpenTime}
              />
              <ModernDateTimeField
                id="startTime"
                value={startTime}
                onChange={(next) => {
                  setStartTime(next);
                  if (fieldErrors.startTime) setFieldErrors((prev) => ({ ...prev, startTime: undefined }));
                }}
                required
                heading="Start date & time"
                hint="Used for event date display."
                error={fieldErrors.startTime}
              />
              <ModernDateTimeField
                id="endTime"
                value={endTime}
                onChange={(next) => {
                  setEndTime(next);
                  if (fieldErrors.endTime) setFieldErrors((prev) => ({ ...prev, endTime: undefined }));
                }}
                required
                heading="End date & time"
                hint="Used for accurate event duration."
                error={fieldErrors.endTime}
              />
            </div>
          </AdminFormSection>

          <AdminFormSection
            icon={iconMapPin}
            title="Location"
            description="Venue name/id, address, and geo coordinates for maps."
          >
            <div className="space-y-5">
              <PlaceSearch
                onPick={({ venueName, address, city, country, geo }) => {
                  setVenueName(venueName);
                  setAddress(address);
                  setCity(city);
                  setCountry(country);
                  setGeoLat(String(geo.lat));
                  setGeoLng(String(geo.lng));
                  setFieldErrors((prev) => ({
                    ...prev,
                    venueName: undefined,
                    address: undefined,
                    city: undefined,
                    country: undefined,
                    geoLat: undefined,
                    geoLng: undefined,
                  }));
                }}
              />
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormTextField
                  id="venueName"
                  label="Venue name"
                  type="text"
                  required
                  value={venueName}
                  error={fieldErrors.venueName}
                  onChange={(e) => {
                    setVenueName(e.target.value);
                    if (fieldErrors.venueName) setFieldErrors((prev) => ({ ...prev, venueName: undefined }));
                  }}
                  placeholder="e.g. Madison Square Garden"
                  hint="You can auto-fill via the search above."
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormTextField
                  id="city"
                  label="City"
                  type="text"
                  required
                  value={city}
                  error={fieldErrors.city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    if (fieldErrors.city) setFieldErrors((prev) => ({ ...prev, city: undefined }));
                  }}
                />
                <FormTextField
                  id="country"
                  label="Country"
                  type="text"
                  required
                  value={country}
                  error={fieldErrors.country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    if (fieldErrors.country) setFieldErrors((prev) => ({ ...prev, country: undefined }));
                  }}
                />
              </div>

              <FormTextField
                id="address"
                label="Address"
                type="text"
                required
                value={address}
                error={fieldErrors.address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (fieldErrors.address) setFieldErrors((prev) => ({ ...prev, address: undefined }));
                }}
                placeholder="Street, building, etc."
              />

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormTextField
                  id="geoLat"
                  label="Latitude"
                  type="number"
                  step="any"
                  required
                  value={geoLat}
                  error={fieldErrors.geoLat}
                  onChange={(e) => {
                    setGeoLat(e.target.value);
                    if (fieldErrors.geoLat) setFieldErrors((prev) => ({ ...prev, geoLat: undefined }));
                  }}
                />
                <FormTextField
                  id="geoLng"
                  label="Longitude"
                  type="number"
                  step="any"
                  required
                  value={geoLng}
                  error={fieldErrors.geoLng}
                  onChange={(e) => {
                    setGeoLng(e.target.value);
                    if (fieldErrors.geoLng) setFieldErrors((prev) => ({ ...prev, geoLng: undefined }));
                  }}
                />
              </div>
            </div>
          </AdminFormSection>

          <AdminFormSection
            icon={iconImage}
            title="Cover artwork"
            description="Optional hero image for cards and detail. Leave empty to use a themed placeholder."
          >
            <CoverPhotoField
              urlInputValue={cover.urlInputValue}
              previewSrc={coverPreviewSrc}
              busy={cover.busy}
              error={cover.error}
              validationError={fieldErrors.coverImageUrl ?? null}
              onUrlChange={(value) => {
                cover.onUrlChange(value);
                if (fieldErrors.coverImageUrl) setFieldErrors((prev) => ({ ...prev, coverImageUrl: undefined }));
              }}
              onFileChange={(e) => {
                cover.onFileChange(e);
                if (fieldErrors.coverImageUrl) setFieldErrors((prev) => ({ ...prev, coverImageUrl: undefined }));
              }}
              onRemove={cover.clear}
              onPreviewError={cover.onPreviewError}
            />
          </AdminFormSection>

          <AdminFormSection
            icon={iconSeats}
            title="Seating & pricing"
            description="Define at least one section. Each row × seats defines capacity; price applies per seat in that zone."
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">Add zones (e.g. A, B, VIP) with their own layout and price.</p>
              <Button type="button" variant="secondary" className="shrink-0" onClick={addSection}>
                <span className="mr-1 text-lg leading-none">+</span> Add section
              </Button>
            </div>
            <ul className="space-y-4">
              {sections.map((sec, index) => (
                <li key={index}>
                  <SectionFormCard
                    section={sec}
                    index={index}
                    canRemove={sections.length > 1}
                    onChange={updateSection}
                    onRemove={removeSection}
                    fieldErrors={sectionErrors[index]}
                  />
                </li>
              ))}
            </ul>
          </AdminFormSection>

          <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-3 border-t border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:flex-row sm:items-center sm:justify-between sm:rounded-2xl sm:border sm:border-slate-200/90 sm:px-6 sm:shadow-lg sm:shadow-slate-200/40">
            <p className="hidden text-sm text-slate-500 sm:block">Review details, then publish to the catalog.</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <Link to="/admin" className="order-2 sm:order-1">
                <Button type="button" variant="secondary" className="w-full sm:w-auto">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" loading={createShow.isPending} disabled={createShow.isPending} className="order-1 sm:order-2 sm:min-w-[180px]">
                Publish event
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
