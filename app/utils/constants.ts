// company
export const companyInfo = {
  fullName: 'Conciergerie MultiService Debieu Breizh',
  shortName: 'CMD Breizh',
  companyType: 'Société à responsabilité limitée',
  RCSCity: 'Quimper',
  SIREN: '939 872 131',
  TVA: 'FR 35 939872131',
  founder: 'Brice Debieu',
  address: "11 rue de l'église, 29550 Saint-Nic, France",
  phone: '(+33) 06 18 49 92 69',
  email: 'contact@cmd.bzh',
  url: 'https://cmd.bzh',
};

// base url
export const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

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

// LocalStorage keys
export const STORAGE_KEYS = {
  PENDING_REVIEW: 'cmd-bzh-pending-review',
  LAST_SUBMIT_TIME: 'cmd-bzh-last-submit-time',
};
