import type { Metadata } from 'next';
import { companyInfo } from '../../utils/constants';
import Reviews from '../../pages/reviews';

export const metadata: Metadata = {
  title: "Avis clients CMD Breizh | Conciergerie Presqu'île de Crozon",
  description:
    "Découvrez les avis de nos clients sur CMD Breizh, conciergerie professionnelle sur la presqu'île de Crozon.",
  alternates: {
    canonical: `${companyInfo.url}/reviews`,
  },
};

export default function ReviewsPage() {
  return <Reviews />;
}
