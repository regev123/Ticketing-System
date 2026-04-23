import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@/components/icons';
import { PillBadge } from '@/components/forms';
import type { AdminAction } from './types';

type Props = {
  action: AdminAction;
};

export function AdminActionCard({ action }: Props) {
  return (
    <Link
      to={action.to}
      className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-violet-50/40 to-fuchsia-50/30 p-1 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_12px_40px_-8px_rgba(91,33,182,0.12)] ring-1 ring-slate-900/[0.04] transition hover:border-violet-200/90 hover:shadow-[0_12px_48px_-8px_rgba(91,33,182,0.18)]"
    >
      <div className="rounded-[0.9rem] bg-white/60 p-6 backdrop-blur-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/35">
              {action.icon}
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-slate-900">{action.title}</h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">{action.description}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {action.tags.map((tag) => (
                  <li key={tag}>
                    <PillBadge className="rounded-full bg-slate-100/90 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      {tag}
                    </PillBadge>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <span className="flex shrink-0 items-center justify-center self-end rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-500/25 transition group-hover:bg-violet-500 sm:self-center">
            {action.ctaLabel}
            <ArrowRightIcon className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
