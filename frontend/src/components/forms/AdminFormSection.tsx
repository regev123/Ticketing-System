import type { ReactNode } from 'react';

type Props = {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
};

/**
 * Grouped block for admin create-event flow — clear hierarchy and spacing.
 */
export function AdminFormSection({ title, description, icon, children }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white via-white to-slate-50/40 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_8px_24px_-4px_rgba(91,33,182,0.06)] ring-1 ring-slate-900/[0.04]">
      <div className="border-b border-slate-100/90 bg-gradient-to-r from-slate-50/80 to-violet-50/30 px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex gap-4">
          {icon ? (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/30">
              {icon}
            </div>
          ) : null}
          <div className="min-w-0 pt-0.5">
            <h2 className="font-display text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
              {title}
            </h2>
            {description ? <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p> : null}
          </div>
        </div>
      </div>
      <div className="space-y-5 p-5 sm:p-6">{children}</div>
    </section>
  );
}
