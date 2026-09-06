import Link from 'next/link';
import { t } from '../utils/i18n';
import { companyInfo } from '../utils/constants';
import { getPhoneNumber } from '../utils/functions';
import { IconMail, IconMapPin, IconPhone } from '@tabler/icons-react';
import { BookandpayLogo } from '../images/bookandpay';

export default function Footer() {
  return (
    <footer className="bg-[#aaa27d] text-white pt-8">
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-4 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <h3 className="text-xl font-semibold mb-2">{companyInfo.fullName}</h3>
            <p className="text-sm">{t('Footer')}</p>
          </div>
          <div className="flex flex-col gap-2 items-center md:items-end">
            <div className="flex items-center">
              <IconMapPin className="mr-2" size={18} />
              <Link href="/about" className="cursor-pointer 2xs:whitespace-nowrap">
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
        <div className="flex flex-col 2xs:flex-row justify-center text-xs gap-x-8">
          <Link href="/gdpr" className="self-center text-xs hover:underline">
            {t('GDPR')}
          </Link>
          <div className="flex items-center self-center">
            {t('Partner')}
            <Link className="flex items-center" href="https://bookandpay.fr/" target="_blank">
              <BookandpayLogo className="ml-2 h-6 w-20" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
