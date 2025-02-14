import Link from 'next/link';
import { t } from '../i18n';
import { companyInfo } from '../utils/constants';
import { getPhoneNumber } from '../utils/functions';
import { Button } from 'antd';
import { IconMail, IconMapPin, IconPhone } from '@tabler/icons-react';
import { BookandpayLogo } from '../images/bookandpay';
import { useMenuContext } from '../contexts/menuProvider';

export default function Footer() {
  const { onMenuChange } = useMenuContext();

  return (
    <footer className="bg-[#aaa27d] text-white py-8">
      <div className="container px-4 justify-self-center">
        <div className="flex flex-col">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-semibold mb-2">{companyInfo.companyName}</h3>
              <p className="text-sm">{t('Footer')}</p>
            </div>
            <div className="flex flex-col gap-2 items-center md:items-end">
              <div className="flex items-center">
                <IconMapPin className="mr-2" size={18} />
                <span className="cursor-pointer whitespace-nowrap" onClick={() => onMenuChange('About')}>
                  {companyInfo.address}
                </span>
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
          <div className="flex justify-center text-xs space-x-8">
            <Button className="self-center" type="link" onClick={() => onMenuChange('GDPR')}>
              <span className="text-xs">{t('GDPR')}</span>
            </Button>
            <div className="flex items-center">
              {t('Partner')}
              <Link className="flex items-center" href="https://bookandpay.fr/" target="_blank">
                <BookandpayLogo className="ml-2 h-6 w-20" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
