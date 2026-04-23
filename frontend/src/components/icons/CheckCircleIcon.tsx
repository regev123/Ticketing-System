import type { IconProps } from './types';

export function CheckCircleIcon({ className = 'h-4 w-4', title }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden={title ? undefined : true}>
      {title ? <title>{title}</title> : null}
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.3 2.3 4.7-4.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
