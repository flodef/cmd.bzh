import { IconLoader2 } from '@tabler/icons-react';
import { twMerge } from 'tailwind-merge';

export function Spin({ className, size = 24 }: { className?: string; size?: number }) {
  return <IconLoader2 size={size} className={twMerge('animate-spin text-brand', className)} aria-label="Loading" />;
}
