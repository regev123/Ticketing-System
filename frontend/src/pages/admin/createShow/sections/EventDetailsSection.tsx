import { FormFieldLabel, FormSection, FormTextArea, FormTextField } from '@/components/forms';
import { FormSelect } from '@/components/forms/select/FormSelect';
import { CalendarIcon } from '@/components/icons';
import { EVENT_CATEGORY_OPTIONS } from '@/data/eventCategories';
import type { EventCategory } from '@/types/api';
import type { EventDetailsSectionProps } from './types';

export function EventDetailsSection({
  title,
  category,
  description,
  fieldErrors,
  onTitleChange,
  onCategoryChange,
  onDescriptionChange,
  clearFieldError,
}: EventDetailsSectionProps) {
  return (
    <FormSection
      icon={<CalendarIcon className="h-5 w-5" />}
      title="Event details"
      description="Title, category, and a public description shown to customers."
    >
      <div className="space-y-5">
        <FormTextField
          id="title"
          label="Event title"
          type="text"
          required
          inputRequired
          value={title}
          error={fieldErrors.title}
          onChange={(e) => {
            onTitleChange(e.target.value);
            if (fieldErrors.title) clearFieldError('title');
          }}
          placeholder="e.g. Summer Nights Tour 2025"
          hint="Shown on the home page and event page."
        />
        <div className="space-y-1.5">
          <FormFieldLabel id="category-label" htmlFor="category" required>
            Category
          </FormFieldLabel>
          <FormSelect
            id="category"
            value={category}
            options={EVENT_CATEGORY_OPTIONS}
            onChange={(value: string) => onCategoryChange(value as EventCategory)}
            ariaLabelledBy="category-label"
          />
          <p className="text-xs text-slate-400">
            Used for event badges and filtering.
          </p>
        </div>
        <div className="space-y-1.5">
          <FormTextArea
            id="description"
            label="Description"
            optional
            rows={4}
            maxLength={1200}
            value={description}
            error={fieldErrors.description}
            onChange={(e) => {
              onDescriptionChange(e.target.value);
              if (fieldErrors.description) clearFieldError('description');
            }}
            placeholder="Tell people what this event is about..."
            hint="Optional. Up to 1200 characters."
          />
        </div>
      </div>
    </FormSection>
  );
}
