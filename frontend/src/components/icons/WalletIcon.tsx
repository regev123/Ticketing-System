import type { IconProps } from './types';

export function WalletIcon({ className = 'h-4 w-4', title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden={title ? undefined : true}>
      {title ? <title>{title}</title> : null}
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M15 12h6" />
      <circle cx="15.5" cy="12" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}
