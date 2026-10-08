import en from '../locales/en.json';
import fr from '../locales/fr.json';
import de from '../locales/de.json';

export type Language = 'en' | 'fr' | 'de';

// Collection of translations loaded from separate files
const translations: Record<Language, Record<string, string | string[]>> = { en, fr, de };
const availableLanguages = Object.keys(translations) as Language[];
// French is the primary audience — SSR and the first client render use it so
// FR visitors (the majority) see no language flash; EN/DE swap in after mount
export const defaultLanguage: Language = 'fr';

// The module-level language stays `defaultLanguage` through SSR and the first
// client render — they must produce identical output or React throws
// hydration error #418. The LanguageProvider swaps in the browser's language
// after hydration via setLanguage + a context update.
let currentLanguage: Language = defaultLanguage;

export const getLanguage = () => currentLanguage;

export function setLanguage(lang: Language) {
  currentLanguage = lang;
}

// Browser language detection — call after hydration only
export function detectLanguage(): Language {
  if (typeof navigator === 'undefined') return defaultLanguage;
  const lang = navigator.language.slice(0, 2) as Language;
  return availableLanguages.includes(lang) ? lang : defaultLanguage;
}

// Translation function for a specific language
export function translate(
  lang: Language,
  key: string,
  params: Record<string, string> = {},
  arrayDelimiter = '/n',
): string {
  const value = translations[lang][key];
  let result = Array.isArray(value) ? value.join(arrayDelimiter) : value || key;

  // Replace template placeholders with actual values
  Object.entries(params).forEach(([k, v]) => {
    result = result.replace(new RegExp(`\\$\\{${k}\\}`, 'g'), v);
  });

  return result;
}

// Translation function: returns the text corresponding to the provided key.
// Falls back to the key if translation is not found. Use `useT()` in render
// code so components re-render when the language switches.
export function t(key: string, params: Record<string, string> = {}, arrayDelimiter = '/n'): string {
  return translate(currentLanguage, key, params, arrayDelimiter);
}
