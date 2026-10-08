'use client';

import { useRef, useState } from 'react';
import { IconStarFilled } from '@tabler/icons-react';
import { twMerge } from 'tailwind-merge';

export interface RateProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  onBlur?: () => void;
  disabled?: boolean;
  allowHalf?: boolean;
  allowClear?: boolean;
  size?: number;
  className?: string;
}

export function Rate({
  value,
  defaultValue,
  onChange,
  onBlur,
  disabled = false,
  allowHalf = false,
  allowClear = false,
  size = 24,
  className,
}: RateProps) {
  const isControlled = value !== undefined;
  const [innerValue, setInnerValue] = useState(defaultValue ?? 0);
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const current = Number(isControlled ? value : innerValue) || 0;
  const display = hoverValue ?? current;

  const valueFromEvent = (clientX: number): number => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return 5;
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    const raw = ratio * 5;
    return allowHalf ? Math.ceil(raw * 2) / 2 : Math.ceil(raw);
  };

  const handleMove = (e: React.MouseEvent) => {
    if (disabled) return;
    setHoverValue(valueFromEvent(e.clientX));
  };

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;
    let v = valueFromEvent(e.clientX);
    if (allowClear && v === current) v = 0;
    if (!isControlled) setInnerValue(v);
    onChange?.(v);
  };

  const stars = (filled: boolean) =>
    Array.from({ length: 5 }, (_, i) => (
      <IconStarFilled key={i} size={size} className={filled ? 'text-yellow-400' : 'text-bark/20 dark:text-cream/20'} />
    ));

  return (
    <div
      role="radiogroup"
      aria-label="Rating"
      className={twMerge('relative inline-flex w-fit', !disabled && 'cursor-pointer', className)}
      onMouseMove={handleMove}
      onMouseLeave={() => setHoverValue(null)}
      onClick={handleClick}
      onBlur={onBlur}
    >
      <div ref={trackRef} className="flex gap-1">
        {stars(false)}
      </div>
      <div
        className="absolute top-0 left-0 h-full overflow-hidden pointer-events-none"
        style={{ width: `${(display / 5) * 100}%` }}
      >
        <div className="flex gap-1 w-max">{stars(true)}</div>
      </div>
    </div>
  );
}
