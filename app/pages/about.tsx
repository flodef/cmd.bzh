import { IconMail, IconMapPin, IconPhone } from '@tabler/icons-react';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import { bgColor, companyInfo, textColor } from '../constants';
import { t } from '../i18n';
import Image from 'next/image';

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
          <h2 className="text-3xl font-bold text-center mb-8">{t('OurLocation')}</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="w-full md:w-1/2 h-80 bg-gray-300 rounded-lg overflow-hidden">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=-4.312176704406739%2C48.18806693411636%2C-4.2569875717163095%2C48.2107219419585&amp;layer=mapnik&amp;marker=48.19939569036789%2C-4.284582138061523"
                style={{ border: 0, width: '100%', height: '100%' }}
              ></iframe>
            </div>
            <div className="w-full md:w-1/2 text-center">
              <h3 className="text-xl font-semibold mb-2">{companyInfo.companyName}</h3>
              <div className={twMerge(textColor, 'mb-2 flex items-center justify-center')}>
                <IconMapPin className="mr-2" size={18} />
                {companyInfo.address}
              </div>
              <div className={twMerge(textColor, 'mb-2 flex items-center justify-center')}>
                <IconPhone className="mr-2" size={18} />
                <Link href={`tel:${companyInfo.phone.replaceAll(' ', '')}`}>{companyInfo.phone}</Link>
              </div>
              <div className={twMerge(textColor, 'mb-2 flex items-center justify-center')}>
                <IconMail className="mr-2" size={18} />
                <Link href={`mailto:${companyInfo.email}`}>{companyInfo.email}</Link>
              </div>
              <hr style={{ marginTop: 16, marginBottom: 16 }} />
              <h3 className="text-xl font-semibold mb-2">{t('WorkingArea')}</h3>
              <ul className="ml-4 mb-2 flex flex-wrap">
                {workingCities.map((city, index) => (
                  <li key={index} className={twMerge(textColor, 'mb-2 w-1/2')}>
                    {city}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className={twMerge(bgColor, 'py-12')}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">{t('EcoFriendlyCommitment')}</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <Image width={128} height={128} src="/EcoLabel.png" alt={t('EcoFriendlyLabel')} />
            <div className="max-w-2xl">
              <p className={twMerge(textColor, 'mb-4')}>{t('EcoFriendlyCommitmentDescription')}</p>
              <p className={textColor}>{t('EcoFriendlyCommitmentDescription2')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">{t('AboutUs')}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
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
            <div>
              <h3 className="text-xl font-semibold mb-4">{t('OurStory')}</h3>
              <p className={twMerge(textColor, 'mb-4')}>{t('OurStoryDescription')}</p>
              <p className={textColor}>{t('OurStoryDescription2')}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
