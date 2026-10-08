import { ButtonHTMLAttributes, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { Spin } from './spin';

export type ButtonVariant = 'primary' | 'default' | 'dashed' | 'text';
export type ButtonSize = 'sm' | 'md' | 'lg';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-white shadow-lg shadow-brand/30 hover:bg-brand/90 hover:shadow-brand/50 hover:scale-[1.03] active:scale-[0.97]',
  default: 'glass text-bark dark:text-cream hover:bg-white/70 dark:hover:bg-white/10 active:scale-[0.97]',
  dashed:
    'border border-dashed border-bark/40 dark:border-cream/40 text-bark dark:text-cream bg-white/20 dark:bg-white/5 hover:border-brand hover:text-brand dark:hover:border-brand dark:hover:text-brand active:scale-[0.97]',
  text: 'text-bark dark:text-cream hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.97]',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-5 py-2 text-base',
  lg: 'px-7 py-3 text-lg',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: 'start' | 'end';
  loading?: boolean;
  /** Renders an anchor styled as a button — prefer this over wrapping a Button in a Link */
  href?: string;
}

export function Button({
  variant = 'default',
  size = 'md',
  icon,
  iconPosition = 'end',
  loading = false,
  className,
  children,
  disabled,
  type = 'button',
  href,
  ...rest
}: ButtonProps) {
  const classes = twMerge(
    'inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap',
    'transition-all duration-200 cursor-pointer select-none',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    variantClasses[variant],
    sizeClasses[size],
    className,
  );

  const content = (
    <>
      {loading ? <Spin className="size-4" /> : icon && iconPosition === 'start' ? icon : null}
      {children}
      {!loading && icon && iconPosition === 'end' ? icon : null}
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} disabled={disabled || loading} className={classes} {...rest}>
      {content}
    </button>
  );
}
