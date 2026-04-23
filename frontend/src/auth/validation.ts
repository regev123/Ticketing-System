/**
 * Shared auth form validation for login, register, and similar flows.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AUTH_VALIDATION_MESSAGES = {
  emailRequired: 'Email is required',
  emailInvalid: 'Please enter a valid email address.',
  passwordRequired: 'Password is required',
  passwordPolicy:
    'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.',
  firstNameRequired: 'First name is required',
  lastNameRequired: 'Last name is required',
  firstNameMaxLength: 'First name must be 80 characters or fewer.',
  lastNameMaxLength: 'Last name must be 80 characters or fewer.',
  confirmPasswordRequired: 'Please confirm your new password.',
  confirmPasswordMismatch: 'New passwords must match.',
} as const;

/** Matches `RegisterRequest` `@Size(max = 80)` for first and last name. */
export const AUTH_NAME_MAX_LENGTH = 80;

export const PASSWORD_MIN_LENGTH = 8;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}

export function isValidPassword(value: string): boolean {
  if (value.length < PASSWORD_MIN_LENGTH) return false;
  if (!/[A-Z]/.test(value)) return false;
  if (!/[a-z]/.test(value)) return false;
  if (!/[0-9]/.test(value)) return false;
  if (!/[^A-Za-z0-9]/.test(value)) return false;
  return true;
}

/** `trimmed` should already be trimmed email, or pass raw and trim inside — we trim here for safety */
export function validateAuthEmail(emailTrimmed: string): string | null {
  const trimmed = emailTrimmed.trim();
  if (trimmed === '') return AUTH_VALIDATION_MESSAGES.emailRequired;
  if (!isValidEmail(trimmed)) return AUTH_VALIDATION_MESSAGES.emailInvalid;
  return null;
}

export function validateAuthPassword(password: string): string | null {
  if (password === '') return AUTH_VALIDATION_MESSAGES.passwordRequired;
  if (!isValidPassword(password)) return AUTH_VALIDATION_MESSAGES.passwordPolicy;
  return null;
}

export function validateNewPasswordConfirm(newPassword: string, confirm: string): string | null {
  if (confirm === '') return AUTH_VALIDATION_MESSAGES.confirmPasswordRequired;
  if (newPassword !== confirm) return AUTH_VALIDATION_MESSAGES.confirmPasswordMismatch;
  return null;
}

export function validateAuthFirstName(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed === '') return AUTH_VALIDATION_MESSAGES.firstNameRequired;
  if (trimmed.length > AUTH_NAME_MAX_LENGTH) {
    return AUTH_VALIDATION_MESSAGES.firstNameMaxLength;
  }
  return null;
}

export function validateAuthLastName(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed === '') return AUTH_VALIDATION_MESSAGES.lastNameRequired;
  if (trimmed.length > AUTH_NAME_MAX_LENGTH) {
    return AUTH_VALIDATION_MESSAGES.lastNameMaxLength;
  }
  return null;
}
