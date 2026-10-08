import { IconInbox } from '@tabler/icons-react';
import { twMerge } from 'tailwind-merge';

export function Empty({ description, className }: { description?: string; className?: string }) {
  return (
    <div className={twMerge('flex flex-col items-center gap-2 py-8 text-bark/50 dark:text-cream/50', className)}>
      <IconInbox size={40} stroke={1.5} />
      <p>{description}</p>
    </div>
  );
}
