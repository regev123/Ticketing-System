import { type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md';
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
};

export function Card({ padding = 'md', className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/90 bg-white shadow-lg shadow-slate-200/40 ${paddingMap[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
