import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  title?: string;
};

export function PillBadge({ children, className, title }: Props) {
  return (
    <span className={className} title={title}>
      {children}
    </span>
  );
}
