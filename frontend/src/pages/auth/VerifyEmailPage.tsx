import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card } from '@/components';
import { authApi } from '@/api/auth';
import { emitGlobalError } from '@/lib/globalErrorBus';

type VerifyState = 'idle' | 'loading' | 'success' | 'error';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token')?.trim() ?? '', [searchParams]);
  const [status, setStatus] = useState<VerifyState>('idle');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      emitGlobalError('Missing verification token.');
      return;
    }

    let canceled = false;
    const run = async () => {
      setStatus('loading');
      try {
        await authApi.verifyEmail(token);
        if (!canceled) setStatus('success');
      } catch {
        // Message shown via app notification banners (client.emitGlobalError).
        if (!canceled) setStatus('error');
      }
    };
    run();

    return () => {
      canceled = true;
    };
  }, [token]);

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <h1 className="font-display text-2xl font-bold text-slate-900">Email verification</h1>
        {status === 'loading' || status === 'idle' ? (
          <p className="mt-3 text-sm text-slate-600">Verifying your email address...</p>
        ) : null}
        {status === 'success' ? (
          <>
            <p className="mt-3 text-sm text-emerald-700">Your email is verified. You can now sign in.</p>
            <Link to="/login" className="mt-4 inline-block text-sm font-semibold text-violet-600 hover:text-violet-500">
              Go to sign in
            </Link>
          </>
        ) : null}
        {status === 'error' ? (
          <p className="mt-3 text-sm text-slate-600">
            See the notification at the top for what went wrong. You can request a new link from the sign-in page
            (after registering) or from the verify-email notice screen.
          </p>
        ) : null}
      </Card>
    </div>
  );
}
