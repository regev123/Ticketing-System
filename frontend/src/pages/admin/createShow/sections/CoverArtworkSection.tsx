import { FormSection, ImageInputField } from '@/components/forms';
import { ImageIcon } from '@/components/icons';
import type { CoverArtworkSectionProps } from './types';

function isPreviewableCoverUrl(value: string): boolean {
  const v = value.trim();
  return v.startsWith('http') || v.startsWith('data:');
}

export function CoverArtworkSection({ cover, fieldErrors, clearFieldError }: CoverArtworkSectionProps) {
  const coverPreviewSrc =
    cover.value.trim() && isPreviewableCoverUrl(cover.value) ? cover.value.trim() : null;

  return (
    <FormSection
      icon={<ImageIcon className="h-5 w-5" />}
      title="Cover artwork"
      description="Optional hero image for cards and detail. Leave empty to use a themed placeholder."
    >
      <ImageInputField
        urlInputValue={cover.urlInputValue}
        previewSrc={coverPreviewSrc}
        busy={cover.busy}
        error={cover.error}
        validationError={fieldErrors.coverImageUrl ?? null}
        onUrlChange={(value) => {
          cover.onUrlChange(value);
          if (fieldErrors.coverImageUrl) clearFieldError('coverImageUrl');
        }}
        onFileChange={(e) => {
          cover.onFileChange(e);
          if (fieldErrors.coverImageUrl) clearFieldError('coverImageUrl');
        }}
        onRemove={cover.clear}
        onPreviewError={cover.onPreviewError}
      />
    </FormSection>
  );
}
