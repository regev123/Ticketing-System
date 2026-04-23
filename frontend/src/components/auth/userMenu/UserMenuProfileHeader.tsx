import type { AuthMeResponse } from '@/types/api';
import { getDisplayName } from './display';

type Props = {
  user: AuthMeResponse;
};

export function UserMenuProfileHeader({ user }: Props) {
  const displayName = getDisplayName(user);

  return (
    <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50/90 to-white px-4 py-3">
      {displayName ? (
        <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
      ) : null}
      <p className={`truncate text-xs text-slate-500 ${displayName ? 'mt-0.5' : ''}`}>{user.email}</p>
      {user.role === 'ADMIN' ? (
        <span className="mt-2 inline-flex rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-800">
          Admin
        </span>
      ) : null}
    </div>
  );
}
