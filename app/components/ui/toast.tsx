'use client';

import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { IconCheck, IconInfoCircle, IconX } from '@tabler/icons-react';
import { twMerge } from 'tailwind-merge';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  text: string;
  leaving?: boolean;
}

export interface ToastApi {
  success: (text: string) => void;
  error: (text: string) => void;
  info: (text: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const icons: Record<ToastType, ReactNode> = {
  success: <IconCheck size={18} className="text-green-500" />,
  error: <IconX size={18} className="text-red-500" />,
  info: <IconInfoCircle size={18} className="text-brand" />,
};

const DURATION = 4000;
const EXIT_MS = 200;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const push = useCallback((type: ToastType, text: string) => {
    const id = nextId.current++;
    setItems(items => [...items, { id, type, text }]);
    setTimeout(() => {
      setItems(items => items.map(i => (i.id === id ? { ...i, leaving: true } : i)));
      setTimeout(() => setItems(items => items.filter(i => i.id !== id)), EXIT_MS);
    }, DURATION);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: text => push('success', text),
      error: text => push('error', text),
      info: text => push('info', text),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 pointer-events-none px-4">
        {items.map(item => (
          <div
            key={item.id}
            role="status"
            className={twMerge(
              'glass rounded-full px-4 py-2.5 flex items-center gap-2 text-sm font-medium text-bark dark:text-cream shadow-lg max-w-full',
              item.leaving ? 'animate-[toast-out_.2s_ease-in_forwards]' : 'animate-[toast-in_.25s_ease-out]',
            )}
          >
            {icons[item.type]}
            <span className="truncate">{item.text}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
