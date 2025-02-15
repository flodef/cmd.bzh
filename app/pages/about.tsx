import { IconMail, IconMapPin, IconPhone } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Page, useMenuContext } from '../contexts/menuProvider';
import { t } from '../i18n';
import { bgColor, companyInfo, textColor } from '../utils/constants';
import { getPhoneNumber } from '../utils/functions';

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
  const { activeTab } = useMenuContext();
  const [iframe, setIframe] = useState<ReactNode>();

  useEffect(() => {
    if (activeTab !== Page.About) return;
    // Dirty tric to load the map properly in the iframe (otherwise, the initial zoom is not working)
    setIframe(
      <iframe
        src="https://www.openstreetmap.org/export/embed.html?bbox=-4.312176704406739%2C48.18806693411636%2C-4.2569875717163095%2C48.2107219419585&amp;layer=mapnik&amp;marker=48.19939569036789%2C-4.284582138061523"
        style={{ border: 0, width: '100%', height: '100%' }}
      ></iframe>,
    );
  }, [activeTab]);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <section className="px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-8">{t('OurLocation')}</h1>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="w-full md:w-1/2 h-80 bg-gray-300 rounded-lg overflow-hidden">{iframe}</div>
          <div className="w-full md:w-1/2 text-center">
            <h3 className="text-xl font-semibold mb-2">{companyInfo.fullName}</h3>
            <div className={twMerge(textColor, 'mb-2 flex items-center justify-center')}>
              <IconMapPin className="mr-2" size={18} />
              {companyInfo.address}
            </div>
            <div className={twMerge(textColor, 'mb-2 flex items-center justify-center')}>
              <IconPhone className="mr-2" size={18} />
              <Link href={`tel:${getPhoneNumber(companyInfo.phone)}`}>{companyInfo.phone}</Link>
            </div>
            <div className={twMerge(textColor, 'mb-2 flex items-center justify-center')}>
              <IconMail className="mr-2" size={18} />
              <Link href={`mailto:${companyInfo.email}`}>{companyInfo.email}</Link>
            </div>
            <hr style={{ marginTop: 16, marginBottom: 16 }} />
            <h3 className="text-xl font-semibold mb-2">{t('WorkingArea')}</h3>
            <ul className="ml-4 mb-2 flex flex-wrap">
              {workingCities.map((city, index) => (
                <li key={index} className="mb-2 w-1/2">
                  {city}
                </li>
              ))}
            </ul>
            <p className="mb-2">{t('AndMoreCities')}</p>
          </div>
        </div>
      </section>

      <section className={twMerge(bgColor, 'px-4 py-12')}>
        <h1 className="text-3xl font-bold text-center mb-8">{t('EcoFriendlyCommitment')}</h1>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <Image width={128} height={128} src="/EcoLabel.png" alt={t('EcoFriendlyLabel')} />
          <div className="max-w-2xl">
            <p className={twMerge(textColor, 'mb-4')}>{t('EcoFriendlyCommitmentDescription')}</p>
            <p className={textColor}>{t('EcoFriendlyCommitmentDescription2')}</p>
          </div>
        </div>
      </section>

      <section className="px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-8">{t('OurTeam')}</h1>
        <div className="grid grid-cols-1 gap-4 items-center">
          <div>
            <h2 className="text-2xl font-semibold text-center mb-2">{companyInfo.founder}</h2>
            <p className={twMerge(textColor, 'mb-4 text-center')}>{t('Founder')}</p>
            {/* <Image
                width={256}
                height={256}
                src="/placeholder.svg?height=400&width=400&text=Manager+Photo"
                alt="Manager"
                className="rounded-full mx-auto mb-4 self-center"
              /> */}
          </div>
          <div className="flex flex-col gap-4">
            <div className="relative flex flex-col gap-4 font-caveat bg-blue-500/10 dark:bg-blue-900/20 border-l-4 border-blue-500/30 dark:border-blue-400/50 p-6 rounded-lg text-2xl">
              <span className="absolute -top-5 -left-8 text-9xl opacity-25 dark:opacity-35">“</span>
              <p className={textColor}>{t('OurStoryDescription').split('/n')[0]}</p>
              <ul>
                {t('OurStoryDescription')
                  .split('/n')
                  .filter(description => description.startsWith('•'))
                  .map((description, index) => (
                    <li key={index} className={`${textColor} pl-4`}>
                      {description}
                    </li>
                  ))}
              </ul>
              {t('OurStoryDescription')
                .split('/n')
                .slice(1)
                .filter(description => !description.startsWith('•'))
                .map((description, index) => (
                  <p key={index} className={textColor}>
                    {description}
                  </p>
                ))}
              <span className="absolute -bottom-20 right-5 text-9xl opacity-25 dark:opacity-35">”</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
