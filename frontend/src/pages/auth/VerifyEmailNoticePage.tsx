import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { Button, Card, CountdownCircleTimer, ErrorMessage } from '@/components';
import { useCountdownTarget } from '@/hooks';

const COOLDOWN_SECONDS = 60;

export function VerifyEmailNoticePage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email')?.trim() ?? '';
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const [cooldownEndMs, setCooldownEndMs] = useState(() => Date.now() + COOLDOWN_SECONDS * 1000);
  const cooldownSeconds = useCountdownTarget({ targetTimeMs: cooldownEndMs });
  const isResendDisabled = isResending || !email || cooldownSeconds > 0;

  const onResend = async () => {
    if (!email) return;
    setError(null);
    setResent(false);
    setIsResending(true);
    try {
      await authApi.resendVerification(email);
      setResent(true);
      setCooldownEndMs(Date.now() + COOLDOWN_SECONDS * 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend verification email.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <h1 className="font-display text-2xl font-bold text-slate-900">Verify your email</h1>
        <p className="mt-3 text-sm text-slate-700">
          Your account was created successfully.
        </p>
        <p className="mt-2 text-sm text-slate-700">
          Please verify your email before you sign in:
          {' '}
          <span className="font-semibold text-slate-900">{email || 'your email address'}</span>
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Open your mailbox and click the verification link we sent. After verification, return here and sign in.
        </p>

        {error ? <div className="mt-4"><ErrorMessage message={error} /></div> : null}
        {resent ? (
          <p className="mt-4 text-sm text-emerald-700">
            Verification email resent successfully.
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link to="/login">
            <Button type="button">Go to sign in</Button>
          </Link>
          <Button
            type="button"
            variant="secondary"
            onClick={onResend}
            disabled={isResendDisabled}
            className={isResendDisabled
              ? 'cursor-not-allowed border border-dashed border-slate-300 bg-slate-100 text-slate-400 opacity-70 hover:bg-slate-100 focus:ring-slate-200'
              : 'border border-transparent'}
          >
            Resend verification email
          </Button>
          <CountdownCircleTimer
            secondsLeft={cooldownSeconds}
            totalSeconds={COOLDOWN_SECONDS}
            hideWhenComplete
          />
        </div>
      </Card>
    </div>
  );
}
