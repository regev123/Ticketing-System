import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { subscribeGlobalError } from '@/lib/globalErrorBus';
import { subscribeGlobalSuccess } from '@/lib/globalSuccessBus';

export type AppNotificationBanner = { type: 'error' | 'success'; message: string };

type AppNotificationContextValue = {
  banner: AppNotificationBanner | null;
  /** Current error text when `banner.type === 'error'`, otherwise `null`. */
  errorMessage: string | null;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  dismiss: () => void;
};

const AppNotificationContext = createContext<AppNotificationContextValue | null>(null);

type Props = {
  children: ReactNode;
  autoHideMs?: number;
};

export function AppNotificationProvider({ children, autoHideMs = 7000 }: Props) {
  const [banner, setBanner] = useState<AppNotificationBanner | null>(null);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const dismiss = useCallback(() => {
    clearTimer();
    setBanner(null);
  }, [clearTimer]);

  const scheduleBanner = useCallback(
    (type: AppNotificationBanner['type'], nextMessage: string) => {
      clearTimer();
      setBanner({ type, message: nextMessage });
      timerRef.current = window.setTimeout(() => {
        setBanner(null);
        timerRef.current = null;
      }, autoHideMs);
    },
    [autoHideMs, clearTimer]
  );

  const showError = useCallback(
    (nextMessage: string) => {
      scheduleBanner('error', nextMessage);
    },
    [scheduleBanner]
  );

  const showSuccess = useCallback(
    (nextMessage: string) => {
      scheduleBanner('success', nextMessage);
    },
    [scheduleBanner]
  );

  useEffect(() => {
    return subscribeGlobalError(showError);
  }, [showError]);

  useEffect(() => {
    return subscribeGlobalSuccess(showSuccess);
  }, [showSuccess]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const errorMessage = banner?.type === 'error' ? banner.message : null;

  const value = useMemo<AppNotificationContextValue>(
    () => ({
      banner,
      errorMessage,
      showError,
      showSuccess,
      dismiss,
    }),
    [banner, errorMessage, showError, showSuccess, dismiss]
  );

  return (
    <AppNotificationContext.Provider value={value}>
      {children}
      {banner?.type === 'error' ? (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] mx-auto w-full max-w-2xl px-4">
          <div
            className="pointer-events-auto overflow-hidden rounded-2xl border border-red-200/80 bg-white/95 shadow-2xl shadow-red-900/10 backdrop-blur"
            role="alert"
          >
            <div className="h-1 w-full bg-gradient-to-r from-red-500 via-rose-500 to-orange-400" />
            <div className="flex items-start gap-3 p-4 sm:p-5">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-medium leading-6 text-slate-800">{banner.message}</p>
              </div>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={dismiss}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {banner?.type === 'success' ? (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] mx-auto w-full max-w-2xl px-4">
          <div
            className="pointer-events-auto overflow-hidden rounded-2xl border border-emerald-200/90 bg-white/95 shadow-2xl shadow-emerald-900/10 backdrop-blur"
            role="status"
            aria-live="polite"
          >
            <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-violet-500" />
            <div className="flex items-start gap-3 p-4 sm:p-5">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-medium leading-6 text-slate-800">{banner.message}</p>
              </div>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={dismiss}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppNotificationContext.Provider>
  );
}

export function useAppNotifications() {
  const ctx = useContext(AppNotificationContext);
  if (!ctx) throw new Error('useAppNotifications must be used within AppNotificationProvider');
  return ctx;
}