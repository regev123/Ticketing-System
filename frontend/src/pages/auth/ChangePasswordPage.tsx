import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';
import {
  AUTH_VALIDATION_MESSAGES,
  validateAuthPassword,
  validateNewPasswordConfirm,
} from '@/auth/validation';
import { setTokens } from '@/auth/tokenStore';
import { Button, Card } from '@/components';
import { FormTextField } from '@/components/forms';
import { useAuth } from '@/hooks';
import { emitGlobalSuccess } from '@/lib/globalSuccessBus';

const PASSWORD_CHANGED_NOTICE =
  'Your password has been updated successfully. You’re signed in on this browser with fresh credentials; other devices may need to sign in again.';

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const { refreshMe } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [newError, setNewError] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cur =
      currentPassword === '' ? AUTH_VALIDATION_MESSAGES.passwordRequired : null;
    const nextNew = validateAuthPassword(newPassword);
    const nextVerify = validateNewPasswordConfirm(newPassword, verifyPassword);
    setCurrentError(cur);
    setNewError(nextNew);
    setVerifyError(nextVerify);
    if (cur || nextNew || nextVerify) return;

    setIsSubmitting(true);
    try {
      const tokens = await authApi.changePassword({ currentPassword, newPassword });
      setTokens(tokens);
      await refreshMe();
      emitGlobalSuccess(PASSWORD_CHANGED_NOTICE);
      navigate('/', { replace: true });
    } catch {
      // Global error via API client
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <h1 className="font-display text-2xl font-bold text-slate-900">Change password</h1>
        <p className="mt-2 text-sm text-slate-600">
          Choose a strong password you don’t reuse on other sites.
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          <FormTextField
            id="change-password-current"
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              if (currentError) setCurrentError(null);
            }}
            error={currentError ?? undefined}
          />
          <FormTextField
            id="change-password-new"
            label="New password"
            type="password"
            autoComplete="new-password"
            hint="At least 8 characters with uppercase, lowercase, number, and symbol."
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (newError) setNewError(null);
              if (verifyError) setVerifyError(null);
            }}
            error={newError ?? undefined}
          />
          <FormTextField
            id="change-password-verify"
            label="New password verification"
            type="password"
            autoComplete="new-password"
            value={verifyPassword}
            onChange={(e) => {
              setVerifyPassword(e.target.value);
              if (verifyError) setVerifyError(null);
            }}
            error={verifyError ?? undefined}
          />
          <Button type="submit" loading={isSubmitting} disabled={isSubmitting} className="w-full">
            Update password
          </Button>
        </form>
      </Card>
    </div>
  );
}
