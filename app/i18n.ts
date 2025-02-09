import en from './locales/en.json';
import fr from './locales/fr.json';

// Collection of translations loaded from separate files
const TRANSLATIONS: { [key: string]: Record<string, string> } = { en, fr };

// Auto-detect user language based on browser settings
function detectLanguage(): 'en' | 'fr' {
  if (typeof navigator !== 'undefined' && navigator.language) {
    // Use exact matching for specified French variants
    if (navigator.language.includes('fr')) {
      return 'fr';
    }
  }
  return 'en';
}

// The current language for translation, auto-detected
export const currentLanguage = detectLanguage();

// Translation function: returns the text corresponding to the provided key
// Falls back to the key if translation is not found
export function t(key: string): string {
  return TRANSLATIONS[currentLanguage][key] || key;
}
