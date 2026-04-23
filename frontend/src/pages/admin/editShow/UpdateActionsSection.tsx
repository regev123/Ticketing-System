import { Link } from 'react-router-dom';
import { Button } from '@/components';

type Props = {
  isPending: boolean;
  showId: string;
};

export function UpdateActionsSection({ isPending, showId }: Props) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-3 border-t border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:flex-row sm:items-center sm:justify-between sm:rounded-2xl sm:border sm:border-slate-200/90 sm:px-6 sm:shadow-lg sm:shadow-slate-200/40">
      <p className="hidden text-sm text-slate-500 sm:block">Review changes, then update this show.</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
        <Link to={`/shows/${showId}`} className="order-2 sm:order-1">
          <Button type="button" variant="secondary" className="w-full sm:w-auto">
            Cancel
          </Button>
        </Link>
        <Button type="submit" loading={isPending} disabled={isPending} className="order-1 sm:order-2 sm:min-w-[180px]">
          Save changes
        </Button>
      </div>
    </div>
  );
}
