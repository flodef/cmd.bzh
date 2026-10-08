import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export function Tooltip({ title, children, className }: { title: ReactNode; children: ReactNode; className?: string }) {
  return (
    <span className={twMerge('group/tooltip relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 w-64 rounded-xl glass px-3 py-2 text-sm text-bark dark:text-cream opacity-0 scale-95 transition-all duration-200 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 group-focus-within/tooltip:opacity-100 group-focus-within/tooltip:scale-100"
      >
        {title}
      </span>
    </span>
  );
}
