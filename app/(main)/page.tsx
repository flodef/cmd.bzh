import type { Metadata } from 'next';
import { companyInfo } from '../utils/constants';
import Home from '../sections/home';
import About from '../sections/about';
import Reviews from '../sections/reviews';
import Contact from '../sections/contact';

export const metadata: Metadata = {
  title: "Conciergerie Presqu'île de Crozon - CMD Breizh | Nettoyage, Jardinage, Gestion",
  description: companyInfo.description,
  alternates: {
    canonical: `${companyInfo.url}/`,
  },
};

export default function HomePage() {
  return (
    <>
      <Home />
      <About />
      <Reviews />
      <Contact />
    </>
  );
}
