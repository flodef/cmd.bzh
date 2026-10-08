'use client';

import { IconInfoCircle } from '@tabler/icons-react';
import Image from 'next/image';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Carousel } from '../components/ui/carousel';
import { Reveal } from '../components/ui/reveal';
import { Tooltip } from '../components/ui/tooltip';
import { useT } from '../contexts/languageProvider';
import { companyInfo } from '../utils/constants';

export default function Home() {
  const t = useT();
  const cardContent = [
    { title: t('Cleaning'), description: t('CleaningDescription') },
    { title: t('Gardening'), description: t('GardeningDescription') },
    { title: t('CheckInOut'), description: t('CheckInOutDescription') },
    { title: t('ClothesHandling'), description: t('ClothesHandlingDescription') },
    { title: t('WelcomeBasket'), description: t('WelcomeBasketDescription') },
    { title: t('MultiService'), description: t('MultiServiceDescription') },
  ];
  return (
    <section id="home" className="scroll-mt-24 w-full">
      {/* Hero */}
      <div className="min-h-[88svh] flex flex-col items-center justify-center text-center px-4 pt-24 pb-10">
        <Reveal>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-bark dark:text-cream text-balance">
            {companyInfo.shortName}
          </h1>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-6 max-w-2xl text-lg sm:text-xl text-bark/70 dark:text-cream/70 text-balance">
            {t('Description')}
          </p>
        </Reveal>
        <Reveal delay={240} className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button href="#services" variant="primary" size="lg">
            {t('Services')}
          </Button>
          <Button href="#contact" size="lg">
            {t('ContactUs')}
          </Button>
        </Reveal>
      </div>

      {/* Carousel */}
      <Reveal className="w-full max-w-4xl mx-auto px-4 pb-20">
        <Carousel autoplay>
          {Array(4)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="p-1 sm:p-2">
                <Image
                  width={600}
                  height={400}
                  src={`/carousel/${index}.jpg`}
                  alt={`Vue ${index}`}
                  className="w-full h-full object-cover rounded-2xl"
                  loading="eager"
                />
              </div>
            ))}
        </Carousel>
      </Reveal>

      {/* Services */}
      <div id="services" className="scroll-mt-24 px-4 py-20 w-full max-w-7xl mx-auto">
        <Reveal>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-bark dark:text-cream">
            {t('Services')}
          </h2>
        </Reveal>
        {/* Desktop: card grid */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          {cardContent.map((item, index) => (
            <Reveal key={index} delay={index * 90}>
              <Card hoverable title={item.title} className="h-full">
                <p className="text-center text-lg text-bark/80 dark:text-cream/80">{item.description}</p>
              </Card>
            </Reveal>
          ))}
        </div>
        {/* Mobile: single card with tooltips */}
        <div className="md:hidden">
          <Card hoverable title={t('Concierge')}>
            {cardContent.map(item => (
              <div key={item.title} className="flex gap-2 items-center justify-center py-1">
                <p className="text-bark/80 dark:text-cream/80">{item.title}</p>
                <Tooltip title={item.description}>
                  <IconInfoCircle className="text-brand" />
                </Tooltip>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* Call to action */}
      <Reveal className="px-4 py-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-bark dark:text-cream text-balance">
          {t('ReadyToExperience')}
        </h2>
        <Button href="#contact" variant="primary" size="lg">
          {t('ContactUs')}
        </Button>
      </Reveal>
    </section>
  );
}
