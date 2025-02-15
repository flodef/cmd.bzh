import { IconInfoCircle } from '@tabler/icons-react';
import { Button, Card, Carousel, Tooltip } from 'antd';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import { useMenuContext } from '../contexts/menuProvider';
import { useWindowParam } from '../hooks/useWindowParam';
import { t } from '../i18n';
import { bgColor, textColor } from '../utils/constants';

const cardContent = [
  { title: t('Cleaning'), description: t('CleaningDescription') },
  { title: t('Gardening'), description: t('GardeningDescription') },
  { title: t('CheckInOut'), description: t('CheckInOutDescription') },
  { title: t('ClothesHandling'), description: t('ClothesHandlingDescription') },
  { title: t('WelcomeBasket'), description: t('WelcomeBasketDescription') },
  { title: t('MultiService'), description: t('MultiServiceDescription') },
];

export default function Home() {
  const { onMenuChange } = useMenuContext();
  const { isDark, breakpoints } = useWindowParam();
  const { isSm: isMobile } = breakpoints;

  const cardStyle = {
    header: { borderColor: !isDark ? '#cccccc' : '#303030' },
    title: { whiteSpace: 'normal' },
  };
  const cardClass = {
    header: 'text-center border-b-[#303030]',
    title: 'text-center text-black dark:text-white',
    body: twMerge(textColor, 'text-center text-lg cursor-default'),
  };

  return (
    <>
      <section className={twMerge('py-12')}>
        <div className="container mx-auto px-4">
          <Carousel className={twMerge('w-full max-w-4xl mx-auto')} arrows autoplay>
            {Array(4)
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

      <section className={twMerge(bgColor, 'py-12')}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">{t('Services')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {!isMobile ? (
              cardContent.map((item, index) => (
                <Card hoverable={!isDark} key={index} styles={cardStyle} classNames={cardClass} title={item.title}>
                  {item.description}
                </Card>
              ))
            ) : (
              <Card styles={cardStyle} classNames={cardClass} title={t('Concierge')}>
                {cardContent.map(item => (
                  <div key={item.title} className="flex gap-2 items-center justify-center">
                    <p>{item.title}</p>
                    <Tooltip title={item.description}>
                      <IconInfoCircle />
                    </Tooltip>
                  </div>
                ))}
              </Card>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('ReadyToExperience')}</h2>
          <Button type="primary" size="large" onClick={() => onMenuChange('Contact')}>
            {t('ContactUs')}
          </Button>
        </div>
      </section>
    </>
  );
}
