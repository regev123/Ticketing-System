import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuthMeResponse } from '@/types/api';
import { ChevronDownIcon } from '@/components/icons/ChevronDownIcon';
import { ChangePasswordMenuItem } from './ChangePasswordMenuItem';
import { LogoutMenuItem } from './LogoutMenuItem';
import { OrdersMenuItem } from './OrdersMenuItem';
import { UserMenuProfileHeader } from './UserMenuProfileHeader';
import { getDisplayInitials } from './display';

type Props = {
  user: AuthMeResponse;
  onLogout: () => void | Promise<void>;
};

export function UserMenu({ user, onLogout }: Props) {
  const navigate = useNavigate();
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onDocPointerDown = (e: MouseEvent | PointerEvent) => {
      const el = rootRef.current;
      if (el && !el.contains(e.target as Node)) close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('pointerdown', onDocPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onDocPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close]);

  const initials = getDisplayInitials(user);
  const isScanner = user.role === 'SCANNER';
  const isAdmin = user.role === 'ADMIN';
  const isRegularUser = user.role === 'USER';

  return (
    <div ref={rootRef} className="relative flex items-center">
      <button
        type="button"
        id={`${menuId}-trigger`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className={`
          group flex items-center gap-2 rounded-full border border-slate-200/90 bg-white py-1 pl-1 pr-2
          shadow-sm shadow-slate-900/5 transition
          hover:border-violet-200/80 hover:shadow-md hover:shadow-violet-500/10
          focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 focus-visible:ring-offset-2
          ${open ? 'border-violet-200 ring-2 ring-violet-500/25 ring-offset-2' : ''}
        `}
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-xs font-bold text-white shadow-inner shadow-violet-900/20"
          aria-hidden
        >
          {initials}
        </span>
        <ChevronDownIcon
          className={`h-4 w-4 text-slate-400 transition group-hover:text-slate-600 ${open ? 'rotate-180 text-violet-600' : ''}`}
        />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-labelledby={`${menuId}-trigger`}
          className="absolute right-0 top-[calc(100%+10px)] z-[60] w-[min(calc(100vw-2rem),18rem)] origin-top-right animate-fade-up"
        >
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-2xl shadow-slate-900/15 ring-1 ring-slate-900/5 backdrop-blur-xl">
            <UserMenuProfileHeader user={user} />

            <div className="p-1.5" role="none">
              {!isScanner ? (
                <>
                  <ChangePasswordMenuItem
                    onSelect={() => {
                      close();
                      navigate('/change-password');
                    }}
                  />
                  {isRegularUser ? (
                    <OrdersMenuItem
                      onSelect={() => {
                        close();
                        navigate('/orders');
                      }}
                    />
                  ) : null}
                  {isAdmin ? (
                    <>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          close();
                          navigate('/admin/metrics');
                        }}
                        className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-violet-50 hover:text-violet-900 focus:outline-none focus-visible:bg-violet-50 focus-visible:text-violet-900"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-violet-100 group-hover:text-violet-700">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4V7m5 10a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h12a2 2 0 012 2v10z" />
                          </svg>
                        </span>
                        Metrics dashboard
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          close();
                          navigate('/admin/shows/new');
                        }}
                        className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-violet-50 hover:text-violet-900 focus:outline-none focus-visible:bg-violet-50 focus-visible:text-violet-900"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-violet-100 group-hover:text-violet-700">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                        </span>
                        Create event
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          close();
                          navigate('/admin/shows');
                        }}
                        className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-violet-50 hover:text-violet-900 focus:outline-none focus-visible:bg-violet-50 focus-visible:text-violet-900"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-violet-100 group-hover:text-violet-700">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
                          </svg>
                        </span>
                        Manage events
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          close();
                          navigate('/admin/scanners');
                        }}
                        className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-violet-50 hover:text-violet-900 focus:outline-none focus-visible:bg-violet-50 focus-visible:text-violet-900"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-violet-100 group-hover:text-violet-700">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5V4H2v16h5m10 0v-2a4 4 0 00-8 0v2m8 0H9m4-8a4 4 0 110-8 4 4 0 010 8z" />
                          </svg>
                        </span>
                        Scanner accounts
                      </button>
                    </>
                  ) : null}
                </>
              ) : null}
              <LogoutMenuItem
                onSelect={() => {
                  close();
                  void onLogout();
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
