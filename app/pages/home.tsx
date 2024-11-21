import { Button, Card, Carousel } from 'antd';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useMenuContext } from '../contexts/menuProvider';
import { useWindowParam } from '../hooks/useWindowParam';
import { twMerge } from 'tailwind-merge';
import { bgColor, textColor } from '../page';

const t = {
  fr: {
    Services: 'Nos Services',
    Cleaning: 'Nettoyage',
    Gardening: 'Jardinage',
    CheckInOut: 'Check-in / Check-out',
    EcoFriendly: 'Eco Responsable',
    ClothesHandling: 'Gestion du linge',
    WelcomeBasket: 'Panier de bienvenue',
    MultiService: 'Multi-Services',
    CleaningDescription: 'Services de nettoyage professionnels pour tous types de propriétés.',
    GardeningDescription: 'Expertise en jardinage pour garder vos espaces extérieurs beaux et attrayants.',
    CheckInOutDescription: 'Services de check-in et check-out pour les propriétés louées.',
    ClothesHandlingDescription: 'Nettoyage professionnel et changement du linge.',
    WelcomeBasketDescription: "Offre d'un panier de bienvenue avec une sélection de produits locaux.",
    MultiServiceDescription: 'Peinture, maçonnerie, toiture, plomberie, électricité, bricolages',
    EcoFriendlyDescription:
      'À CMD Breizh, nous sommes engagés à utiliser des produits de nettoyage écoresponsables et des pratiques durables pour minimiser notre empreinte écologique tout en livrant un service exceptionnel.',
    ReadyToExperience: 'Prêt à expérimenter notre service ?',
    ContactUs: 'Contactez-nous dès maintenant',
    EcoFriendlyLabel: 'Label écoresponsable',
  },
  en: {
    Services: 'Our Services',
    Cleaning: 'Cleaning',
    Gardening: 'Gardening',
    CheckInOut: 'Check-in / Check-out',
    EcoFriendly: 'Eco-Friendly',
    ClothesHandling: 'Clothes Handling',
    WelcomeBasket: 'Welcome Basket',
    MultiService: 'Multi-Service',
    CleaningDescription: 'Professional cleaning services for all types of properties.',
    GardeningDescription: 'Expert gardening to keep your outdoor spaces beautiful and attractive.',
    CheckInOutDescription: 'Seamless check-in and check-out services for rental properties.',
    ClothesHandlingDescription: 'Professional cleaning and clothes handling services.',
    WelcomeBasketDescription: 'A welcome basket with a selection of local products.',
    MultiServiceDescription: 'Painting, masonry, woodworking, etc',
    EcoFriendlyDescription:
      'At CMD Breizh, we&apos;re committed to using environmentally friendly cleaning products and sustainable practices to minimize our ecological footprint while delivering exceptional service.',
    ReadyToExperience: 'Ready to experience our top-notch services?',
    ContactUs: 'Contact Us Today',
    EcoFriendlyLabel: 'Eco-Friendly Label',
  },
};

const cardStyle = {
  header: 'text-center',
  title: 'text-center text-black dark:text-white',
  body: 'text-center text-gray-900 dark:text-gray-400 text-lg',
};
const cardContent = [
  { title: t['fr'].Cleaning, description: t['fr'].CleaningDescription },
  { title: t['fr'].Gardening, description: t['fr'].GardeningDescription },
  { title: t['fr'].CheckInOut, description: t['fr'].CheckInOutDescription },
  { title: t['fr'].ClothesHandling, description: t['fr'].ClothesHandlingDescription },
  { title: t['fr'].WelcomeBasket, description: t['fr'].WelcomeBasketDescription },
  { title: t['fr'].MultiService, description: t['fr'].MultiServiceDescription },
];

export default function Home() {
  const { colorScheme } = useWindowParam();
  const { onMenuChange } = useMenuContext();

  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    setIsDark(colorScheme === 'dark');
  }, [colorScheme]);

  const style = {
    backgroundColor: !isDark ? '#f0f0f0' : '#141414',
    color: !isDark ? '#141414' : '#f0f0f0',
    borderColor: !isDark ? '#141414' : '#303030',
  };

  return (
    <>
      <section className={twMerge(bgColor, 'py-12')}>
        <div className="container mx-auto px-4">
          <Carousel className={twMerge(bgColor, 'w-full max-w-4xl mx-auto')} autoplay>
            {Array(7)
              .fill(0)
              .map((_, index) => (
                <div key={index}>
                  <Card style={style}>
                    <div className="flex items-center justify-center p-6">
                      <Image
                        width={600}
                        height={400}
                        src={`/carousel/${index}.jpg`}
                        alt={`Vue ${index}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  </Card>
                </div>
              ))}
          </Carousel>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">{t['fr'].Services}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cardContent.map((item, index) => (
              <Card key={index} style={style} classNames={cardStyle} title={item.title}>
                {item.description}
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className={twMerge(bgColor, 'py-12')}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">{t['fr'].EcoFriendly}</h2>
          <p className={twMerge(textColor, 'text-center text-lg max-w-2xl mx-auto')}>
            {t['fr'].EcoFriendlyDescription}
          </p>
          <div className="mt-8 text-center">
            <Image
              width={150}
              height={150}
              src="/EcoLabel.png"
              alt={t['fr'].EcoFriendlyLabel}
              className="inline-block"
            />
          </div>
        </div>
      </section>

      <section className="py-12 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t['fr'].ReadyToExperience}</h2>
          <Button size="large" style={style} onClick={() => onMenuChange('Contact')}>
            {t['fr'].ContactUs}
          </Button>
        </div>
      </section>
    </>
  );
}
