'use client';

import { IconMail, IconMapPin, IconPhone } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { twMerge } from 'tailwind-merge';
import { Reveal } from '../components/ui/reveal';
import { t } from '../utils/i18n';
import { companyInfo } from '../utils/constants';
import { getPhoneNumber } from '../utils/functions';

// Dynamically import LeafletMap to avoid SSR issues
const LeafletMap = dynamic(() => import('../components/LeafletMap'), { ssr: false });

const bodyText = 'text-bark/80 dark:text-cream/80';

export default function About() {
  // Compute the number of seasons since the business started (September 2025)
  const now = new Date();
  const seasons = now.getFullYear() - 2025 + (now.getMonth() >= 8 ? 1 : 0); // Month 8 = September
  const seasonsLabel = t(seasons > 1 ? 'SeasonPlural' : 'SeasonSingular');
  const storyParams = { seasons: String(seasons), seasonsLabel };

  // Coordinates from the original iframe: 48.19939569036789, -4.284582138061523
  const mapCenter: [number, number] = [48.19939569036789, -4.284582138061523];

  // Working area coordinates
  const workingAreas = [
    { name: 'Saint-Nic', coords: [48.19939569036789, -4.284582138061523] as [number, number] },
    { name: 'Plomodiern', coords: [48.18713, -4.22839] as [number, number] },
  ];

  // Calculate center point for working area circle
  const centerLat = (workingAreas[0].coords[0] + workingAreas[1].coords[0]) / 2;
  const centerLng = (workingAreas[0].coords[1] + workingAreas[1].coords[1]) / 2;
  const workingAreaCenter: [number, number] = [centerLat, centerLng];

  // Calculate radius to encompass both points (in degrees, approximate)
  const latDiff = Math.abs(workingAreas[0].coords[0] - workingAreas[1].coords[0]);
  const lngDiff = Math.abs(workingAreas[0].coords[1] - workingAreas[1].coords[1]);
  const radius = Math.max(latDiff, lngDiff) / 2 + 0.02; // Add buffer

  return (
    <section id="about" className="scroll-mt-24 w-full max-w-7xl mx-auto">
      <Reveal className="px-4 py-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-bark dark:text-cream">
          {t('OurLocation')}
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="w-full md:w-1/2 h-80 glass-soft rounded-3xl overflow-hidden">
            <LeafletMap
              center={mapCenter}
              zoom={10}
              markerText={companyInfo.shortName}
              logo="/Logo.png"
              workingAreaCenter={workingAreaCenter}
              workingAreaRadius={radius}
            />
          </div>
          <div className="w-full md:w-1/2 glass-soft glass-hover rounded-3xl p-8 text-center">
            <h3 className="text-xl font-semibold mb-2 text-bark dark:text-cream">{companyInfo.fullName}</h3>
            <div className={twMerge(bodyText, 'mb-2 flex items-center justify-center')}>
              <IconMapPin className="mr-2" size={18} />
              {companyInfo.address}
            </div>
            <div className={twMerge(bodyText, 'mb-2 flex items-center justify-center')}>
              <IconPhone className="mr-2" size={18} />
              <Link href={`tel:${getPhoneNumber(companyInfo.phone)}`}>{companyInfo.phone}</Link>
            </div>
            <div className={twMerge(bodyText, 'mb-2 flex items-center justify-center')}>
              <IconMail className="mr-2" size={18} />
              <Link href={`mailto:${companyInfo.email}`}>{companyInfo.email}</Link>
            </div>
            <hr className="my-4 border-bark/10 dark:border-white/10" />
            <h3 className="text-xl font-semibold mb-2 text-bark dark:text-cream">{t('WorkingArea')}</h3>
            <ul className="ml-4 mb-2 flex flex-wrap">
              {workingAreas.map((area, index) => (
                <li key={index} className={`mb-2 w-1/2 ${bodyText}`}>
                  {area.name}
                </li>
              ))}
            </ul>
            <p className="mb-2 hidden">{t('AndMoreCities')}</p>
          </div>
        </div>
      </Reveal>

      <Reveal className="px-4 py-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-bark dark:text-cream">
          {t('EcoFriendlyCommitment')}
        </h2>
        <div className="glass-soft glass-hover rounded-3xl p-8 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8">
          <Image width={128} height={128} src="/EcoLabel.png" alt={t('EcoFriendlyLabel')} />
          <div className="max-w-2xl">
            <p className={twMerge(bodyText, 'mb-4')}>{t('EcoFriendlyCommitmentDescription')}</p>
            <p className={bodyText}>{t('EcoFriendlyCommitmentDescription2')}</p>
          </div>
        </div>
      </Reveal>

      <Reveal className="px-4 py-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-bark dark:text-cream">{t('OurTeam')}</h2>
        <div className="grid grid-cols-1 gap-4 items-center">
          <div>
            <h3 className="text-2xl font-semibold text-center mb-2 text-bark dark:text-cream">{companyInfo.founder}</h3>
            <p className={twMerge(bodyText, 'mb-4 text-center')}>{t('Founder')}</p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="relative flex flex-col gap-4 font-caveat glass-soft glass-hover border-l-4 border-brand/40 p-8 rounded-3xl text-2xl">
              <span className="absolute -top-5 -left-2 text-9xl text-brand/25">&ldquo;</span>
              <p className={bodyText}>{t('OurStoryDescription', storyParams).split('/n')[0]}</p>
              <ul>
                {t('OurStoryDescription', storyParams)
                  .split('/n')
                  .filter(description => description.startsWith('•'))
                  .map((description, index) => (
                    <li key={index} className={`${bodyText} pl-4`}>
                      {description}
                    </li>
                  ))}
              </ul>
              {t('OurStoryDescription', storyParams)
                .split('/n')
                .slice(1)
                .filter(description => !description.startsWith('•'))
                .map((description, index) => (
                  <p key={index} className={bodyText}>
                    {description}
                  </p>
                ))}
              <span className="absolute -bottom-20 right-5 text-9xl text-brand/25">&rdquo;</span>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
