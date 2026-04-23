type Props = {
  status: string;
};

const statusClassByValue: Record<string, string> = {
  CONFIRMED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  PAYMENT_PENDING: 'border-amber-200 bg-amber-50 text-amber-700',
  PARTIALLY_CANCELLED: 'border-orange-200 bg-orange-50 text-orange-700',
  CANCELLED: 'border-rose-200 bg-rose-50 text-rose-700',
};

export function OrderStatusBadge({ status }: Props) {
  const normalized = status?.toUpperCase() ?? 'UNKNOWN';
  const className = statusClassByValue[normalized] ?? 'border-slate-200 bg-slate-50 text-slate-700';
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}>
      {normalized.replace('_', ' ')}
    </span>
  );
}
