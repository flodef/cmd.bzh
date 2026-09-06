import type { Metadata } from 'next';
import { companyInfo } from '../utils/constants';
import Home from '../pages/home';

export const metadata: Metadata = {
  title: "Conciergerie Presqu'île de Crozon - CMD Breizh | Nettoyage, Jardinage, Gestion",
  description: companyInfo.description,
  alternates: {
    canonical: `${companyInfo.url}/`,
  },
};

export default function HomePage() {
  return <Home />;
}
