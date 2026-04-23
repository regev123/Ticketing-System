import type { ChangeEvent } from 'react';
import type { useCoverPhoto } from '@/hooks';
import type { EventCategory, SectionInput } from '@/types/api';
import type { CreateShowFormErrors, PickedPlace, SectionErrors } from '../types';

export type EventDetailsSectionProps = {
  title: string;
  category: EventCategory;
  description: string;
  fieldErrors: CreateShowFormErrors;
  onTitleChange: (value: string) => void;
  onCategoryChange: (value: EventCategory) => void;
  onDescriptionChange: (value: string) => void;
  clearFieldError: (key: keyof CreateShowFormErrors) => void;
};

export type TimeSectionProps = {
  doorsOpenTime: string;
  startTime: string;
  endTime: string;
  fieldErrors: CreateShowFormErrors;
  onDoorsOpenTimeChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  clearFieldError: (key: keyof CreateShowFormErrors) => void;
};

export type LocationSectionProps = {
  venueName: string;
  city: string;
  country: string;
  address: string;
  geoLat: string;
  geoLng: string;
  fieldErrors: CreateShowFormErrors;
  onVenueNameChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onGeoLatChange: (value: string) => void;
  onGeoLngChange: (value: string) => void;
  onPlacePick: (payload: PickedPlace) => void;
  clearFieldError: (key: keyof CreateShowFormErrors) => void;
};

export type CoverArtworkSectionProps = {
  cover: ReturnType<typeof useCoverPhoto> & {
    onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  };
  fieldErrors: CreateShowFormErrors;
  clearFieldError: (key: keyof CreateShowFormErrors) => void;
};

export type SeatingPricingSectionProps = {
  sections: SectionInput[];
  sectionErrors: SectionErrors[];
  addSection: () => void;
  updateSection: (index: number, patch: Partial<SectionInput>) => void;
  removeSection: (index: number) => void;
};

export type PublishActionsSectionProps = {
  isPending: boolean;
};
