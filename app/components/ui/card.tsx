import { HTMLAttributes, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  hoverable?: boolean;
}

export function Card({ title, hoverable, className, children, ...rest }: CardProps) {
  return (
    <div
      className={twMerge('glass-soft rounded-2xl overflow-hidden', hoverable && 'glass-hover glow-border', className)}
      {...rest}
    >
      {title && (
        <div className="border-b border-bark/10 dark:border-white/10 px-6 py-4 text-center">
          <h3 className="text-xl font-semibold text-balance">{title}</h3>
        </div>
      )}
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}
