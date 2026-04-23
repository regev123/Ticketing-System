const TOKEN_KEY = 'auth.token';

export type AuthTokens = {
  token: string;
};

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setTokens(tokens: AuthTokens) {
  localStorage.setItem(TOKEN_KEY, tokens.token);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
}

export function hasTokens() {
  return Boolean(getToken());
}
