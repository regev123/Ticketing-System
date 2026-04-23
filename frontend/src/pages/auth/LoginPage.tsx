import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Card } from '@/components';
import { FormTextField } from '@/components/forms';
import { validateAuthEmail, validateAuthPassword } from '@/auth/validation';
import { useAuth } from '@/hooks';

type LocationState = {
  from?: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = ((location.state as LocationState | null)?.from) || '/';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const nextEmailError = validateAuthEmail(trimmedEmail);
    const nextPasswordError = validateAuthPassword(password);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    if (nextEmailError || nextPasswordError) {
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: trimmedEmail, password });
      navigate(from, { replace: true });
    } catch {
      // Errors surface in app notification banners (emitGlobalError from API client).
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <h1 className="font-display text-2xl font-bold text-slate-900">Sign in</h1>
        <p className="mt-2 text-sm text-slate-600">Login to purchase tickets and manage your account.</p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          <FormTextField
            id="login-email"
            label="Email"
            type="text"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(null);
            }}
            error={emailError ?? undefined}
          />
          <FormTextField
            id="login-password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError(null);
            }}
            error={passwordError ?? undefined}
          />
          <Button type="submit" loading={isSubmitting} disabled={isSubmitting} className="w-full">
            Sign in
          </Button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          New here?{' '}
          <Link to="/register" className="font-semibold text-violet-600 hover:text-violet-500">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  );
}
