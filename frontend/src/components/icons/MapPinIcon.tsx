import type { IconProps } from './types';

export function MapPinIcon({ className, title }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      {title ? <title>{title}</title> : null}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s-7-4.5-7-11a7 7 0 1114 0c0 6.5-7 11-7 11z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10a2 2 0 100-4 2 2 0 000 4z" />
    </svg>
  );
}
