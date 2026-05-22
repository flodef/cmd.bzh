// company
export const companyInfo = {
  fullName: 'Conciergerie MultiService Debieu Breizh',
  shortName: 'CMD Breizh',
  companyType: 'Société à responsabilité limitée',
  RCSCity: 'Quimper',
  SIREN: '939 872 131',
  TVA: 'FR 35 939872131',
  founder: 'Brice Debieu',
  foundingDate: '2024',
  address: "11 rue de l'église, 29550 Saint-Nic, France",
  phone: '(+33) 06 18 49 92 69',
  email: process.env.NEXT_PUBLIC_DEV_EMAIL || 'contact@cmd.bzh',
  url: process.env.NEXT_PUBLIC_BASE_URL || 'https://cmd.bzh',
  description:
    "Conciergerie professionnelle sur la presqu'île de Crozon (Saint-Nic, Plomodiern). Services de nettoyage, jardinage, check-in/out, gestion du linge pour vos locations saisonnières.",
  areaServed: [
    "Presqu'île de Crozon",
    'Saint-Nic',
    'Plomodiern',
    'Crozon',
    'Morgat',
    'Camaret-sur-Mer',
    'Telgruc-sur-Mer',
  ],
  priceRange: '€€',
};

// Helper functions to derive address components from full address
export const getAddressComponents = (address: string) => {
  const parts = address.split(',').map(p => p.trim());
  const streetAddress = parts[0] || '';
  const postalCodeCity = parts[1] || '';
  const postalCode = postalCodeCity.split(' ')[0] || '';
  const addressLocality = postalCodeCity.split(' ').slice(1).join(' ') || '';
  const country = parts[2] || '';
  const addressCountry = country.substring(0, 2).toUpperCase() || '';

  return {
    streetAddress,
    addressLocality,
    postalCode,
    addressCountry,
  };
};

// creator
export const creatorInfo = {
  name: 'Flojito Stillnet',
  SIREN: '982 786 758',
  status: 'Auto-entrepreneur',
};

// colors
export const bgColor = 'bg-green-50 dark:bg-gray-900';
export const textColor = 'text-gray-900 dark:text-gray-400';

// regex
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const phoneRegex = /^\+?\d{1,3}?[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;

// business hours
export const businessHours = {
  replyTimeHours: 48,
  openingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  openingHour: 9,
  closingHour: 18,
  timezone: 'Europe/Paris',
};

// LocalStorage keys
export const STORAGE_KEYS = {
  PENDING_REVIEW: 'cmd-bzh-pending-review',
  LAST_SUBMIT_TIME: 'cmd-bzh-last-submit-time',
};
