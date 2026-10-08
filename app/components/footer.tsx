import Link from 'next/link';
import Image from 'next/image';
import { t } from '../utils/i18n';
import { companyInfo } from '../utils/constants';
import { getPhoneNumber } from '../utils/functions';
import { IconMail, IconMapPin, IconPhone } from '@tabler/icons-react';

export default function Footer() {
  return (
    <footer className="bg-sand/85 backdrop-blur-xl text-white pt-8 mt-8 border-t border-white/20">
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-4 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <h3 className="text-xl font-semibold mb-2">{companyInfo.fullName}</h3>
            <p className="text-sm">{t('Footer')}</p>
          </div>
          <div className="flex flex-col gap-2 items-center md:items-end">
            <div className="flex items-center">
              <IconMapPin className="mr-2" size={18} />
              <Link href="/#about" className="cursor-pointer 2xs:whitespace-nowrap">
                {companyInfo.address}
              </Link>
            </div>
            <div className="flex items-center whitespace-nowrap">
              <IconPhone className="mr-2" size={18} />
              <Link href={`tel:${getPhoneNumber(companyInfo.phone)}`}>{companyInfo.phone}</Link>
            </div>
            <div className="flex items-center whitespace-nowrap">
              <IconMail className="mr-2" size={18} />
              <Link href={`mailto:${companyInfo.email}`}>{companyInfo.email}</Link>
            </div>
          </div>
        </div>
        <div className="flex flex-col 2xs:flex-row justify-center text-xs gap-x-8 pb-4">
          <Link href="/gdpr" className="self-center text-xs hover:underline">
            {t('GDPR')}
          </Link>
          <div className="flex items-center self-center">
            {t('Partner')}
            <Link className="flex items-center" href="https://cocoonr.fr/" target="_blank">
              <span className="ml-2 inline-flex items-center rounded bg-white/90 px-1.5 py-0.5">
                <Image src="/cocoonr.webp" alt="Cocoonr" width={626} height={96} className="h-5 w-auto" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
