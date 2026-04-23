import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, ErrorMessage } from '@/components';
import { FormTextField } from '@/components/forms';
import {
  AUTH_NAME_MAX_LENGTH,
  validateAuthEmail,
  validateAuthPassword,
  validateAuthFirstName,
  validateAuthLastName,
} from '@/auth/validation';
import { useAuth } from '@/hooks';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim();
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const nextEmailError = validateAuthEmail(trimmedEmail);
    const nextFirstNameError = validateAuthFirstName(firstName);
    const nextLastNameError = validateAuthLastName(lastName);
    const nextPasswordError = validateAuthPassword(password);
    setEmailError(nextEmailError);
    setFirstNameError(nextFirstNameError);
    setLastNameError(nextLastNameError);
    setPasswordError(nextPasswordError);
    if (nextEmailError || nextFirstNameError || nextLastNameError || nextPasswordError) {
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ email: trimmedEmail, password, firstName: trimmedFirst, lastName: trimmedLast });
      const params = new URLSearchParams({ email: trimmedEmail });
      navigate(`/verify-email-notice?${params.toString()}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Register failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <h1 className="font-display text-2xl font-bold text-slate-900">Create account</h1>
        <p className="mt-2 text-sm text-slate-600">Register to reserve and purchase tickets.</p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          <FormTextField
            id="register-email"
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormTextField
              id="register-first-name"
              label="First name"
              type="text"
              autoComplete="given-name"
              maxLength={AUTH_NAME_MAX_LENGTH}
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (firstNameError) setFirstNameError(null);
              }}
              error={firstNameError ?? undefined}
            />
            <FormTextField
              id="register-last-name"
              label="Last name"
              type="text"
              autoComplete="family-name"
              maxLength={AUTH_NAME_MAX_LENGTH}
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                if (lastNameError) setLastNameError(null);
              }}
              error={lastNameError ?? undefined}
            />
          </div>
          <FormTextField
            id="register-password"
            label="Password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError(null);
            }}
            error={passwordError ?? undefined}
          />
          {error ? <ErrorMessage message={error} /> : null}
          <Button type="submit" loading={isSubmitting} disabled={isSubmitting} className="w-full">
            Create account
          </Button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-violet-600 hover:text-violet-500">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
