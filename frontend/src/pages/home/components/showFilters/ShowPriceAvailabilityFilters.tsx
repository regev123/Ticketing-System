import { FormTextField } from '@/components/forms';

type Props = {
  priceMin: string;
  priceMax: string;
  minCatalogSeats: string;
  excludeEmptyInventory: boolean;
  onPriceMinChange: (v: string) => void;
  onPriceMaxChange: (v: string) => void;
  onMinCatalogSeatsChange: (v: string) => void;
  onExcludeEmptyInventoryChange: (v: boolean) => void;
  idPrefix?: string;
};

export function ShowPriceAvailabilityFilters({
  priceMin,
  priceMax,
  minCatalogSeats,
  excludeEmptyInventory,
  onPriceMinChange,
  onPriceMaxChange,
  onMinCatalogSeatsChange,
  onExcludeEmptyInventoryChange,
  idPrefix = 'price-filter',
}: Props) {
  return (
    <div className="space-y-6" role="group" aria-label="Price and ticket availability">
      <div className="rounded-2xl border border-violet-100/80 bg-gradient-to-br from-violet-50/50 to-transparent px-4 py-3 text-sm leading-relaxed text-slate-600 ring-1 ring-violet-100/60">
        <span className="font-medium text-slate-800">How pricing works:</span> we use each show&apos;s seat prices. Your
        min/max must overlap that show&apos;s price range. Mixed currencies are compared as numbers.
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormTextField
          id={`${idPrefix}-min`}
          label="Min price"
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          placeholder="No minimum"
          value={priceMin}
          onChange={(e) => onPriceMinChange(e.target.value)}
          hint="Cheapest seat in show ≥ this (optional)"
        />
        <FormTextField
          id={`${idPrefix}-max`}
          label="Max price"
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          placeholder="No maximum"
          value={priceMax}
          onChange={(e) => onPriceMaxChange(e.target.value)}
          hint="Priciest seat in show ≤ this (optional)"
        />
      </div>
      <FormTextField
        id={`${idPrefix}-seats`}
        label="Minimum seats in catalog"
        type="number"
        inputMode="numeric"
        min={1}
        step={1}
        placeholder="Any size"
        value={minCatalogSeats}
        onChange={(e) => onMinCatalogSeatsChange(e.target.value)}
        hint="Only shows with at least this many seats listed"
      />
      <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-sm transition hover:border-violet-200/80 hover:shadow-md">
        <input
          type="checkbox"
          checked={excludeEmptyInventory}
          onChange={(e) => onExcludeEmptyInventoryChange(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500/30"
        />
        <span className="min-w-0">
          <span className="block font-semibold text-slate-900">Hide shows with no seats listed</span>
          <span className="mt-1 block text-xs leading-relaxed text-slate-500">
            For real-time sold-out status, wire your API when available.
          </span>
        </span>
      </label>
    </div>
  );
}
