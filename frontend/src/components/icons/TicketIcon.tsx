import type { IconProps } from './types';

export function TicketIcon({ className, title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      {title ? <title>{title}</title> : null}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 5v2a2 2 0 01-2 2h-2a2 2 0 00-2 2v2a2 2 0 01-2 2H5m14-9a2 2 0 11-4 0m4 0a2 2 0 10-4 0m4 0v9a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2h10z"
      />
    </svg>
  );
}
