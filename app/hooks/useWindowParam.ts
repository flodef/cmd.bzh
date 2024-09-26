import { useEffect, useMemo, useState } from 'react';
import { useLoading } from '../contexts/loadingProvider';

export enum ColorScheme {
  Light = 'light',
  Dark = 'dark',
}

export const isWindowReady = typeof window !== 'undefined';

export function useWindowParam() {
  const { isLoading } = useLoading();

  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: -1,
    height: -1,
  });
  const [windowPosition, setWindowPosition] = useState({
    top: -1,
    left: -1,
  });
  const mediaQuery = isWindowReady ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  const [colorScheme, setColorScheme] = useState(mediaQuery?.matches ? ColorScheme.Dark : ColorScheme.Light);
  const [isOnline, setIsOnline] = useState(isWindowReady ? window.navigator.onLine : true);
  const isReady = useMemo(() => windowSize.width > 0 && !isLoading, [windowSize.width, isLoading]);

  useEffect(() => {
    // only execute all the code below in client side
    // Handler to call on window resize
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setWindowPosition({
        top: window.screenTop,
        left: window.screenLeft,
      });
    };
    const handleColorScheme = (event: MediaQueryListEvent) => {
      setColorScheme(event.matches ? ColorScheme.Dark : ColorScheme.Light);
    };
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Add event listener
    mediaQuery.addEventListener('change', handleColorScheme);
    window.addEventListener('resize', handleResize);
    window.addEventListener('online', () => setIsOnline(true), false);
    window.addEventListener('offline', () => setIsOnline(false), false);

    // Call handler right away so state gets updated with initial window size
    handleResize();
    setColorScheme(mediaQuery.matches ? ColorScheme.Dark : ColorScheme.Light);
    setIsOnline(window.navigator.onLine);

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleColorScheme);
      window.removeEventListener('online', () => setIsOnline(true));
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.documentElement.className = colorScheme;
  }, [colorScheme]);

  return {
    width: windowSize.width,
    height: windowSize.height,
    top: windowPosition.top,
    left: windowPosition.left,
    colorScheme,
    isOnline,
    isReady,
  };
}
