import { FormSection, ModernDateTimeField } from '@/components/forms';
import { ClockIcon } from '@/components/icons';
import type { TimeSectionProps } from './types';

export function TimeSection({
  doorsOpenTime,
  startTime,
  endTime,
  fieldErrors,
  onDoorsOpenTimeChange,
  onStartTimeChange,
  onEndTimeChange,
  clearFieldError,
}: TimeSectionProps) {
  return (
    <FormSection
      icon={<ClockIcon className="h-5 w-5" />}
      title="Time"
      description="Start time, end time, and doors open time."
    >
      <div className="flex flex-col gap-5">
        <ModernDateTimeField
          id="doorsOpenTime"
          value={doorsOpenTime}
          onChange={(next) => {
            onDoorsOpenTimeChange(next);
            if (fieldErrors.doorsOpenTime) clearFieldError('doorsOpenTime');
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
            onStartTimeChange(next);
            if (fieldErrors.startTime) clearFieldError('startTime');
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
            onEndTimeChange(next);
            if (fieldErrors.endTime) clearFieldError('endTime');
          }}
          required
          heading="End date & time"
          hint="Used for accurate event duration."
          error={fieldErrors.endTime}
        />
      </div>
    </FormSection>
  );
}
