'use client';

import { InputHTMLAttributes, ReactNode, Ref, TextareaHTMLAttributes, useCallback, useRef } from 'react';
import { twMerge } from 'tailwind-merge';

const baseFieldClasses =
  'flex items-center gap-2 rounded-xl border px-3 py-2.5 bg-white/60 dark:bg-white/10 ' +
  'transition-all duration-200 focus-within:ring-2 focus-within:ring-brand/50 focus-within:border-brand/60 ' +
  'border-bark/20 dark:border-white/20 text-bark dark:text-cream';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  prefix?: ReactNode;
  status?: 'error' | undefined;
  ref?: Ref<HTMLInputElement>;
}

export function Input({ prefix, status, className, ref, ...rest }: InputProps) {
  return (
    <div className={twMerge(baseFieldClasses, status === 'error' && 'border-red-500 ring-red-500/30', className)}>
      {prefix && <span className="flex-none text-bark/60 dark:text-cream/60 [&>svg]:size-4.5">{prefix}</span>}
      <input
        ref={ref}
        className="w-full bg-transparent outline-none placeholder:text-bark/40 dark:placeholder:text-cream/40"
        {...rest}
      />
    </div>
  );
}

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  status?: 'error' | undefined;
  showCount?: boolean;
  minRows?: number;
}

export function TextArea({ status, showCount, minRows = 2, className, onChange, value, ...rest }: TextAreaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const autoGrow = useCallback(() => {
    const el = ref.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, []);

  return (
    <div className="relative">
      <textarea
        ref={el => {
          ref.current = el;
          autoGrow();
        }}
        rows={minRows}
        value={value}
        onChange={e => {
          autoGrow();
          onChange?.(e);
        }}
        className={twMerge(
          'w-full resize-none overflow-hidden rounded-xl border px-3 py-2.5 bg-white/60 dark:bg-white/10',
          'transition-all duration-200 focus:ring-2 focus:ring-brand/50 focus:border-brand/60 outline-none',
          'border-bark/20 dark:border-white/20 text-bark dark:text-cream',
          'placeholder:text-bark/40 dark:placeholder:text-cream/40',
          status === 'error' && 'border-red-500 ring-red-500/30',
          className,
        )}
        {...rest}
      />
      {showCount && (
        <span className="absolute bottom-1.5 right-3 text-xs text-bark/50 dark:text-cream/50 pointer-events-none">
          {String(value ?? '').length}
          {rest.maxLength ? ` / ${rest.maxLength}` : ''}
        </span>
      )}
    </div>
  );
}
