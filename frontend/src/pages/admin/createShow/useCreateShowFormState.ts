import { useState } from 'react';
import type { EventCategory, SectionInput } from '@/types/api';
import { DEFAULT_SECTION } from './constants';
import type { PickedPlace } from './types';

export function useCreateShowFormState() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('live');
  const [description, setDescription] = useState('');

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [doorsOpenTime, setDoorsOpenTime] = useState('');

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

  const applyPickedPlace = ({ venueName, address, city, country, geo }: PickedPlace) => {
    setVenueName(venueName);
    setAddress(address);
    setCity(city);
    setCountry(country);
    setGeoLat(String(geo.lat));
    setGeoLng(String(geo.lng));
  };

  return {
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
  };
}
