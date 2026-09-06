import type { Metadata } from 'next';
import { companyInfo } from '../../utils/constants';
import GDPR from '../../pages/GDPR';

export const metadata: Metadata = {
  title: 'Politique de confidentialité | CMD Breizh',
  description: 'Politique de protection des données personnelles de CMD Breizh, conformément au RGPD.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${companyInfo.url}/gdpr`,
  },
};

export default function GDPRPage() {
  return <GDPR />;
}
