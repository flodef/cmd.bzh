'use client';

import { ReactNode, useEffect } from 'react';
import { IconX } from '@tabler/icons-react';
import { twMerge } from 'tailwind-merge';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        className={twMerge('relative glass rounded-3xl w-full max-w-lg p-6 animate-[modal-in_.3s_ease-out]', className)}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 rounded-full p-1.5 text-bark/60 dark:text-cream/60 hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          <IconX size={18} />
        </button>
        {title && <div className="mb-4 pr-8">{title}</div>}
        {children}
      </div>
    </div>
  );
}
