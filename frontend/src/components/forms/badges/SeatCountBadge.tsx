import { PillBadge } from './PillBadge';

type Props = {
  count: number;
  className?: string;
};

export function SeatCountBadge({ count, className }: Props) {
  return (
    <PillBadge
      className={
        className ??
        'rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-100'
      }
    >
      {count} {count === 1 ? 'seat' : 'seats'}
    </PillBadge>
  );
}
