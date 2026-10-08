'use client';

import { Children, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { twMerge } from 'tailwind-merge';

export interface CarouselProps {
  children: ReactNode;
  autoplay?: boolean;
  interval?: number;
  arrows?: boolean;
  dots?: boolean;
  className?: string;
}

export function Carousel({
  children,
  autoplay,
  interval = 4500,
  arrows = true,
  dots = true,
  className,
}: CarouselProps) {
  const count = Children.count(children);
  const [index, setIndex] = useState(0);
  const paused = useRef(false);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (!autoplay || count < 2) return;
    const timer = setInterval(() => {
      if (!paused.current && !document.hidden) setIndex(i => (i + 1) % count);
    }, interval);
    return () => clearInterval(timer);
  }, [autoplay, count, interval]);

  return (
    <div
      className={twMerge('group relative overflow-hidden rounded-3xl', className)}
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      onTouchStart={e => (touchStartX.current = e.touches[0].clientX)}
      onTouchEnd={e => {
        if (touchStartX.current == null) return;
        const delta = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(delta) > 40) goTo(index + (delta < 0 ? 1 : -1));
        touchStartX.current = null;
      }}
    >
      <div
        className="flex transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {Children.map(children, (child, i) => (
          <div key={i} className="w-full flex-none">
            {child}
          </div>
        ))}
      </div>

      {arrows && count > 1 && (
        <>
          <button
            onClick={() => goTo(index - 1)}
            aria-label="Previous"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full glass p-2 text-bark dark:text-cream transition-all duration-300 opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer hover:scale-110 active:scale-95"
          >
            <IconChevronLeft size={20} />
          </button>
          <button
            onClick={() => goTo(index + 1)}
            aria-label="Next"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full glass p-2 text-bark dark:text-cream transition-all duration-300 opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer hover:scale-110 active:scale-95"
          >
            <IconChevronRight size={20} />
          </button>
        </>
      )}

      {dots && count > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              className={twMerge(
                'h-2 rounded-full transition-all duration-300 cursor-pointer glass',
                i === index ? 'w-6' : 'w-2 opacity-60 hover:opacity-100',
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
