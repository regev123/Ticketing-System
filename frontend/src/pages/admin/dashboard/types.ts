import type { ReactNode } from 'react';

export type AdminAction = {
  id: string;
  title: string;
  description: string;
  to: string;
  ctaLabel: string;
  tags: string[];
  icon: ReactNode;
};
