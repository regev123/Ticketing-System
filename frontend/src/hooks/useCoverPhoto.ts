/**
 * Cover image state for create-show: file compression, URL, validation (SRP).
 */

import { useState, useCallback } from 'react';
import { compressImageToDataUrl } from '@/utils';
import {
  COVER_IMAGE_MAX_DATA_URL_CHARS,
  COVER_IMAGE_MAX_FILE_BYTES,
} from '@/config/constants';

export function useCoverPhoto() {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clear = useCallback(() => {
    setValue('');
    setError(null);
  }, []);

  const onUrlChange = useCallback((next: string) => {
    setError(null);
    setValue(next);
  }, []);

  const onPreviewError = useCallback(() => {
    setError('Preview failed — check the URL or try another image.');
  }, []);

  const onFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (JPEG, PNG, WebP, …).');
      return;
    }
    if (file.size > COVER_IMAGE_MAX_FILE_BYTES) {
      setError('Image must be 5MB or smaller.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const dataUrl = await compressImageToDataUrl(file);
      if (dataUrl.length > COVER_IMAGE_MAX_DATA_URL_CHARS) {
        setError('Image is still too large; try a smaller or simpler photo.');
        return;
      }
      setValue(dataUrl);
    } catch {
      setError('Could not read that image.');
    } finally {
      setBusy(false);
    }
  }, []);

  /** Value for URL <input> (hide raw data URL). */
  const urlInputValue = value.startsWith('data:') ? '' : value;

  return {
    value,
    urlInputValue,
    busy,
    error,
    clear,
    onUrlChange,
    onFileChange,
    onPreviewError,
  };
}
