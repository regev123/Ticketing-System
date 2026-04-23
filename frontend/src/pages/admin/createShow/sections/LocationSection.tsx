import { FormSection, FormTextField, PlaceSearch } from '@/components/forms';
import { MapPinIcon } from '@/components/icons';
import type { LocationSectionProps } from './types';

export function LocationSection({
  venueName,
  city,
  country,
  address,
  geoLat,
  geoLng,
  fieldErrors,
  onVenueNameChange,
  onCityChange,
  onCountryChange,
  onAddressChange,
  onGeoLatChange,
  onGeoLngChange,
  onPlacePick,
  clearFieldError,
}: LocationSectionProps) {
  return (
    <FormSection
      icon={<MapPinIcon className="h-5 w-5" />}
      title="Location"
      description="Venue name/id, address, and geo coordinates for maps."
    >
      <div className="space-y-5">
        <PlaceSearch
          onPick={(payload) => {
            onPlacePick(payload);
          }}
        />
        <FormTextField
          id="venueName"
          label="Venue name"
          type="text"
          required
          inputRequired
          value={venueName}
          error={fieldErrors.venueName}
          onChange={(e) => {
            onVenueNameChange(e.target.value);
            if (fieldErrors.venueName) clearFieldError('venueName');
          }}
          placeholder="e.g. Madison Square Garden"
          hint="You can auto-fill via the search above."
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormTextField
            id="city"
            label="City"
            type="text"
            required
            inputRequired
            value={city}
            error={fieldErrors.city}
            onChange={(e) => {
              onCityChange(e.target.value);
              if (fieldErrors.city) clearFieldError('city');
            }}
          />
          <FormTextField
            id="country"
            label="Country"
            type="text"
            required
            inputRequired
            value={country}
            error={fieldErrors.country}
            onChange={(e) => {
              onCountryChange(e.target.value);
              if (fieldErrors.country) clearFieldError('country');
            }}
          />
        </div>

        <FormTextField
          id="address"
          label="Address"
          type="text"
          required
          inputRequired
          value={address}
          error={fieldErrors.address}
          onChange={(e) => {
            onAddressChange(e.target.value);
            if (fieldErrors.address) clearFieldError('address');
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
            inputRequired
            value={geoLat}
            error={fieldErrors.geoLat}
            onChange={(e) => {
              onGeoLatChange(e.target.value);
              if (fieldErrors.geoLat) clearFieldError('geoLat');
            }}
          />
          <FormTextField
            id="geoLng"
            label="Longitude"
            type="number"
            step="any"
            required
            inputRequired
            value={geoLng}
            error={fieldErrors.geoLng}
            onChange={(e) => {
              onGeoLngChange(e.target.value);
              if (fieldErrors.geoLng) clearFieldError('geoLng');
            }}
          />
        </div>
      </div>
    </FormSection>
  );
}
