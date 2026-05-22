import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';

/**
 * Custom hook for managing localStorage state
 * @template T - The type of the value to store
 * @param key - The localStorage key to use
 * @param defaultValue - The default value if no value exists in localStorage
 * @returns A tuple containing the current value and a setter function
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue?: T,
): [T | undefined, Dispatch<SetStateAction<T | undefined>>] {
  const state = useState<T | undefined>(() => getLocalStorageItem(key, defaultValue));
  const value = key ? state[0] : defaultValue;

  const isFirstRenderRef = useRef(true);
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    setLocalStorageItem(key, value);
  }, [value, key]);

  return state;
}

/**
 * Retrieves a value from localStorage
 * @template T - The type of the value to retrieve
 * @param key - The localStorage key
 * @param defaultValue - The default value if retrieval fails
 * @returns The retrieved value or default value
 */
export function getLocalStorageItem<T>(key: string, defaultValue?: T) {
  if (!key) {
    console.error('useLocalStorage: key is not defined');
    return defaultValue;
  }

  try {
    const value = localStorage.getItem(key);
    if (value) return JSON.parse(value) as T;
  } catch (error) {
    // Silently handle localStorage errors (e.g., quota exceeded, disabled in private browsing)
    // This prevents UI crashes when localStorage is unavailable
    if (typeof window !== 'undefined') {
      console.warn('Failed to read from localStorage:', error);
    }
  }
  return defaultValue;
}

/**
 * Sets a value in localStorage
 * @template T - The type of the value to store
 * @param key - The localStorage key
 * @param value - The value to store (undefined removes the key)
 */
export function setLocalStorageItem<T>(key: string, value: T | undefined) {
  if (!key) {
    console.error('useLocalStorage: key is not defined');
    return;
  }

  try {
    if (value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    // Silently handle localStorage errors (e.g., quota exceeded, disabled in private browsing)
    // This prevents UI crashes when localStorage is unavailable
    if (typeof window !== 'undefined') {
      console.warn('Failed to write to localStorage:', error);
    }
  }
}
