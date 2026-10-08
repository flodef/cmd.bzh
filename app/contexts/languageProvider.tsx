'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { defaultLanguage, detectLanguage, Language, setLanguage, translate } from '../utils/i18n';

const LanguageContext = createContext<Language>(defaultLanguage);

/**
 * Provides the detected browser language. SSR and the first client render
 * both use the default language (required for clean hydration); the detected
 * language swaps in right after mount with a single rerender.
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>(defaultLanguage);

  useEffect(() => {
    const detected = detectLanguage();
    if (detected !== defaultLanguage) {
      setLanguage(detected);
      setLang(detected);
    }
  }, []);

  return <LanguageContext.Provider value={lang}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  return useContext(LanguageContext);
}

/** useT-bound translate: components using it re-render on language switch. */
export function useT() {
  const lang = useContext(LanguageContext);
  return useCallback(
    (key: string, params: Record<string, string> = {}, arrayDelimiter = '/n') =>
      translate(lang, key, params, arrayDelimiter),
    [lang],
  );
}
