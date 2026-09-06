import type { Metadata } from 'next';
import { companyInfo } from '../../utils/constants';
import About from '../../pages/about';

export const metadata: Metadata = {
  title: "À propos de CMD Breizh | Conciergerie Presqu'île de Crozon",
  description: `Découvrez CMD Breizh, ${companyInfo.description}`,
  alternates: {
    canonical: `${companyInfo.url}/about`,
  },
};

export default function AboutPage() {
  return <About />;
}
