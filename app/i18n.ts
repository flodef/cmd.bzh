import en from './locales/en.json';
import fr from './locales/fr.json';

// Collection of translations loaded from separate files
const translations: { [key: string]: Record<string, string | string[]> } = { en, fr };
const availableLanguages = Object.keys(translations);
const defaultLanguage = 'en';

// The current language for translation, auto-detected
export const currentLanguage =
  typeof navigator !== 'undefined' && availableLanguages.includes(navigator.language.slice(0, 2))
    ? navigator.language.slice(0, 2)
    : defaultLanguage;

// Translation function: returns the text corresponding to the provided key
// Falls back to the key if translation is not found
export function t(key: string, params: Record<string, string> = {}, arrayDelimiter = '/n'): string {
  const value = translations[currentLanguage][key];
  let result = Array.isArray(value) ? value.join(arrayDelimiter) : value || key;

  // Replace template placeholders with actual values
  Object.entries(params).forEach(([k, v]) => {
    result = result.replace(new RegExp(`\\$\\{${k}\\}`, 'g'), v);
  });

  return result;
}
