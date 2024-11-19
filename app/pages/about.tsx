import { IconMail, IconMapPin, IconPhone } from '@tabler/icons-react';
import { Image } from 'antd';
import Link from 'next/link';
import { companyInfo } from '../constants';

const t = {
  fr: {
    OurLocation: 'Notre localisation',
    WorkingArea: 'Zone de travail',
    Address: 'Adresse',
    Phone: 'Téléphone',
    Email: 'Email',
    AboutUs: 'À propos de nous',
    OurStory: 'Notre histoire',
    Founder: 'Fondateur',
    OurStoryDescription:
      "Brice Debieu a fondé CMD Breizh avec pour vision de fournir des services de nettoyage, de jardinage et de gestion immobilière de qualité supérieure tout en privilégiant la responsabilité environnementale. Avec son expérience dans le secteur, Brice a constitué une équipe de professionnels dévoués qui partagent sa passion pour l'excellence et la durabilité.",
    OurStoryDescription2:
      "Sous la direction de Brice, CMD Breizh est devenu un partenaire de confiance pour les propriétaires, les gestionnaires immobiliers et les hôtes Airbnb de toute la région. Notre engagement envers des pratiques respectueuses de l'environnement et un service exceptionnel nous a valu la réputation d'être le choix incontournable pour ceux qui accordent de l'importance à la propreté et à la gestion environnementale.",
    ReadyToExperience: 'Prêt à expérimenter notre service ?',
    ContactUs: 'Contactez-nous dès maintenant',
    EcoFriendlyCommitment: 'Nos engagements écologiques',
    EcoFriendlyCommitmentDescription:
      'Nous nous engageons à utiliser des pratiques écologiques et éthiques pour minimiser nos impacts sur l’environnement. Nous mettons en place des systèmes de collecte et de traitement de déchets, nous utilisons des équipements écologiques lors de nos prestations.',
    EcoFriendlyCommitmentDescription2:
      'En choisissant CMD Breizh, vous êtes en mesure de garantir la protection de l’environnement et de respecter les normes environnementales. Nous sommes une entreprise qui met en œuvre des pratiques écologiques et éthiques pour garantir un service exceptionnel et également pour promouvoir la protection de l’environnement.',
    EcoFriendlyLabel: 'Label écoresponsable',
  },
  en: {
    OurLocation: 'Our Location',
    WorkingArea: 'Working Area',
    Address: 'Address',
    Phone: 'Phone',
    Email: 'Email',
    AboutUs: 'About Us',
    OurStory: 'Our Story',
    Founder: 'Founder',
    OurStoryDescription:
      'Brice Debieu founded CMD Breizh with a vision to provide top-quality cleaning, gardening, and property management services while prioritizing environmental responsibility. With over 15 years of experience in the industry, Jane has built a team of dedicated professionals who share her passion for excellence and sustainability.',
    OurStoryDescription2:
      'Under Brice&apos;s leadership, CMD Breizh has become a trusted partner for homeowners, property managers, and Airbnb hosts throughout the region. Our commitment to eco-friendly practices and exceptional service has earned us a reputation as the go-to choice for those who value both cleanliness and environmental stewardship.',
    ReadyToExperience: 'Ready to experience our service?',
    ContactUs: 'Contact Us Today',
    EcoFriendlyCommitment: 'Our Eco-Friendly Commitment',
    EcoFriendlyCommitmentDescription:
      'We are committed to using environmentally friendly cleaning products and sustainable practices to minimize our ecological footprint while delivering exceptional service.',
    EcoFriendlyCommitmentDescription2:
      'By choosing CMD Breizh, you are able to guarantee the protection of the environment and respect the environmental standards. We are a company that implements eco-friendly and ethical practices to guarantee an exceptional service and also to promote the protection of the environment.',
    EcoFriendlyLabel: 'Eco-Friendly Label',
  },
};

const workingCities = [
  'Saint-Nic',
  'Plomodiern',
  'Plonevez-Porzay',
  'Ploeven',
  'Dinéault',
  'Chateaulin',
  'Cast',
  'Trégarvan',
];

export default function About() {
  return (
    <>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">{t['fr'].OurLocation}</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="w-full md:w-1/2 h-64 bg-gray-300 rounded-lg overflow-hidden">
              {/* TODO: Replace this with an actual map component or embed */}
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <IconMapPin className="text-gray-400" size={48} />
              </div>
            </div>
            <div className="w-full md:w-1/2 text-center">
              <h3 className="text-xl font-semibold mb-2">{companyInfo.companyName}</h3>
              <div className="text-gray-900 dark:text-gray-400 mb-2 flex items-center justify-center">
                <IconMapPin className="mr-2" size={18} />
                {companyInfo.address}
              </div>
              <div className="text-gray-900 dark:text-gray-400 mb-2 flex items-center justify-center">
                <IconPhone className="mr-2" size={18} />
                <Link href={`tel:${companyInfo.phone.replaceAll(' ', '')}`}>{companyInfo.phone}</Link>
              </div>
              <div className="text-gray-900 dark:text-gray-400 mb-2 flex items-center justify-center">
                <IconMail className="mr-2" size={18} />
                <Link href={`mailto:${companyInfo.email}`}>{companyInfo.email}</Link>
              </div>
              <hr style={{ marginTop: 16, marginBottom: 16 }} />
              <h3 className="text-xl font-semibold mb-2">{t['fr'].WorkingArea}</h3>
              <ul className="ml-4 mb-2 flex flex-wrap">
                {workingCities.map((city, index) => (
                  <li key={index} className="text-gray-900 dark:text-gray-400 mb-2 w-1/2">
                    {city}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-green-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">{t['fr'].EcoFriendlyCommitment}</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <Image width={150} height={150} src="/EcoLabel.png" alt={t['fr'].EcoFriendlyLabel} className="w-32 h-32" />
            <div className="max-w-2xl">
              <p className="text-gray-900 dark:text-gray-400 mb-4">{t['fr'].EcoFriendlyCommitmentDescription}</p>
              <p className="text-gray-900 dark:text-gray-400">{t['fr'].EcoFriendlyCommitmentDescription2}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">{t['fr'].AboutUs}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-semibold text-center mb-2">{companyInfo.founder}</h2>
              <p className="text-center text-gray-900 dark:text-gray-400 mb-4">{t['fr'].Founder}</p>
              <Image
                src="/placeholder.svg?height=400&width=400&text=Manager+Photo"
                alt="Manager"
                className="rounded-full w-64 h-64 mx-auto mb-4 self-center"
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">{t['fr'].OurStory}</h3>
              <p className="text-gray-900 dark:text-gray-400 mb-4">{t['fr'].OurStoryDescription}</p>
              <p className="text-gray-900 dark:text-gray-400">{t['fr'].OurStoryDescription2}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
