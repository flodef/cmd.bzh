import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={twMerge(
        'inline-flex items-center rounded-full bg-brand/15 text-brand px-2.5 py-0.5 text-xs font-medium',
        className,
      )}
    >
      {children}
    </span>
  );
}
