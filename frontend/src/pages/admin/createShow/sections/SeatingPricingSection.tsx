import { Button } from '@/components';
import { FormSection } from '@/components/forms';
import { SeatsIcon } from '@/components/icons';
import { SectionFormCard } from './SectionFormCard';
import type { SeatingPricingSectionProps } from './types';

export function SeatingPricingSection({
  sections,
  sectionErrors,
  addSection,
  updateSection,
  removeSection,
}: SeatingPricingSectionProps) {
  return (
    <FormSection
      icon={<SeatsIcon className="h-5 w-5" />}
      title="Seating & pricing"
      description="Define at least one section. Each row x seats defines capacity; price applies per seat in that zone."
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
    </FormSection>
  );
}
