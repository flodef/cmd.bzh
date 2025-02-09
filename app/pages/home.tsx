import { Button, Card, Carousel } from 'antd';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { bgColor, textColor } from '../constants';
import { useMenuContext } from '../contexts/menuProvider';
import { useWindowParam } from '../hooks/useWindowParam';
import { t } from '../i18n';

const cardContent = [
  { title: t('Cleaning'), description: t('CleaningDescription') },
  { title: t('Gardening'), description: t('GardeningDescription') },
  { title: t('CheckInOut'), description: t('CheckInOutDescription') },
  { title: t('ClothesHandling'), description: t('ClothesHandlingDescription') },
  { title: t('WelcomeBasket'), description: t('WelcomeBasketDescription') },
  { title: t('MultiService'), description: t('MultiServiceDescription') },
];

export default function Home() {
  const { colorScheme } = useWindowParam();
  const { onMenuChange } = useMenuContext();

  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    setIsDark(colorScheme === 'dark');
  }, [colorScheme]);

  const mainStyle = {
    backgroundColor: !isDark ? '#f0f0f0' : '#141414',
    color: !isDark ? '#141414' : '#f0f0f0',
    borderColor: !isDark ? '#141414' : '#303030',
  };
  const cardStyle = {
    header: { borderColor: !isDark ? '#141414' : '#303030' },
  };
  const cardClass = {
    header: 'text-center border-b-[#303030]',
    title: 'text-center text-black dark:text-white',
    body: twMerge(textColor, 'text-center text-lg'),
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
                  <div className="flex items-center justify-center p-6">
                    <Image
                      width={600}
                      height={400}
                      src={`/carousel/${index}.jpg`}
                      alt={`Vue ${index}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                </div>
              ))}
          </Carousel>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">{t('Services')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cardContent.map((item, index) => (
              <Card key={index} style={mainStyle} styles={cardStyle} classNames={cardClass} title={item.title}>
                {item.description}
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className={twMerge(bgColor, 'py-12')}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">{t('EcoFriendly')}</h2>
          <p className={twMerge(textColor, 'text-center text-lg max-w-2xl mx-auto')}>{t('EcoFriendlyDescription')}</p>
          <div className="mt-8 text-center">
            <Image width={150} height={150} src="/EcoLabel.png" alt={t('EcoFriendlyLabel')} className="inline-block" />
          </div>
        </div>
      </section>

      <section className="py-12 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('ReadyToExperience')}</h2>
          <Button size="large" style={mainStyle} onClick={() => onMenuChange('Contact')}>
            {t('ContactUs')}
          </Button>
        </div>
      </section>
    </>
  );
}
