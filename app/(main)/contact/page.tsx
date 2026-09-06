import type { Metadata } from 'next';
import { companyInfo } from '../../utils/constants';
import Contact from '../../pages/contact';

export const metadata: Metadata = {
  title: "Contactez CMD Breizh | Conciergerie Presqu'île de Crozon",
  description:
    "Contactez CMD Breizh pour vos besoins en nettoyage, jardinage, check-in/out et gestion du linge sur la presqu'île de Crozon.",
  alternates: {
    canonical: `${companyInfo.url}/contact`,
  },
};

export default function ContactPage() {
  return <Contact />;
}
