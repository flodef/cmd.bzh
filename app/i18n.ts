import en from './locales/en.json';
import fr from './locales/fr.json';
import de from './locales/de.json';

// Collection of translations loaded from separate files
const TRANSLATIONS: { [key: string]: Record<string, string> } = { en, fr, de };

const availableLanguages = Object.keys(TRANSLATIONS);
const defaultLanguage = 'en';

// The current language for translation, auto-detected
export const currentLanguage =
  typeof navigator !== 'undefined' && availableLanguages.includes(navigator.language.slice(0, 2))
    ? navigator.language.slice(0, 2)
    : defaultLanguage;

// Translation function: returns the text corresponding to the provided key
// Falls back to the key if translation is not found
export function t(key: string): string {
  return TRANSLATIONS[currentLanguage][key] || key;
}
