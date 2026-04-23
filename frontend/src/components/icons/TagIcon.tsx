import type { IconProps } from './types';

export function TagIcon({ className = 'h-4 w-4', title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden={title ? undefined : true}>
      {title ? <title>{title}</title> : null}
      <path d="M20 13l-7 7-9-9V4h7l9 9z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8.5" cy="8.5" r="1.4" />
    </svg>
  );
}
