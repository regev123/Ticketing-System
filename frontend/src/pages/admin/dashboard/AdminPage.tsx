import { AdminHeader } from './AdminHeader';
import { AdminActionCard } from './AdminActionCard';
import { ADMIN_ACTIONS } from './adminActions';

export function AdminPage() {
  return (
    <div className="relative min-h-[60vh]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_40%_at_50%_-10%,rgba(124,58,237,0.1),transparent)]" />

      <div className="mx-auto max-w-3xl px-4 pb-12 pt-2 sm:px-6 lg:px-8">
        <AdminHeader />

        <div className="grid gap-6 sm:grid-cols-1">
          {ADMIN_ACTIONS.map((action) => (
            <AdminActionCard key={action.id} action={action} />
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">StagePass admin · catalog service</p>
      </div>
    </div>
  );
}
