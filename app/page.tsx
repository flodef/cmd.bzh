'use client';

import { IconMail, IconMapPin, IconPhone } from '@tabler/icons-react';
import { ConfigProvider, Tabs, theme } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import { MenuButton } from './components/menuButton';
import { companyInfo } from './constants';
import { useWindowParam } from './hooks/useWindowParam';
import { menuItems, useMenuContext } from './contexts/menuProvider';
import { useMemo } from 'react';

const t = {
  fr: {
    footer: 'Votre partenaire pour la propreté, le jardinage et la gestion de votre propriété.',
  },
  en: {
    footer: 'Your trusted partner for cleaning, gardening, and property management.',
  },
};

const { defaultAlgorithm, darkAlgorithm } = theme;

export default function Page() {
  const { colorScheme, width } = useWindowParam();
  const { onMenuChange, isMenuOpen, activeTab, content, title } = useMenuContext();

  const isDark = useMemo(() => colorScheme === 'dark', [colorScheme]);
  const isMobile = useMemo(() => width < 768, [width]);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? darkAlgorithm : defaultAlgorithm,
        components: {
          Card: {
            headerFontSize: 20,
            headerHeight: 80,
          },
        },
      }}
    >
      <div className="flex flex-col min-h-screen overflow-x-hidden">
        <header className="bg-white dark:bg-[#001529] shadow-sm fixed top-0 left-0 right-0 z-10">
          <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Image
              className="self-start z-10 cursor-pointer"
              src="/logo.png"
              alt="CMD Logo"
              width={100}
              height={100}
              priority
              onClick={() => onMenuChange()}
            />
            <div className={twMerge('flex space-x-4 z-10', isMobile ? 'self-start w-full justify-end' : '')}>
              <div
                className={twMerge(
                  isMobile ? 'transition transform' : 'visible max-h-28 flex items-center',
                  isMenuOpen || !isMobile ? 'opacity-100 scale-y-100 h-40' : 'opacity-0 scale-y-0 h-0',
                )}
              >
                <Tabs
                  activeKey={activeTab}
                  items={menuItems}
                  onChange={onMenuChange}
                  size="large"
                  tabPosition={isMobile ? 'right' : 'top'}
                />
              </div>

              <MenuButton className="md:hidden" />
            </div>
            {isMobile && (
              <div
                className={twMerge(
                  'absolute top-7 text-center w-full pl-28 pr-20 self-end',
                  !isMenuOpen ? 'transition-all delay-300 opacity-100' : 'opacity-0',
                )}
              >
                <h1 className="text-2xl font-bold text-center mb-8">{title}</h1>
              </div>
            )}
          </nav>
        </header>
        <div
          className={twMerge(
            'flex flex-col min-h-screen transition transform',
            isMenuOpen && isMobile ? 'pt-40' : 'pt-28',
          )}
        >
          <main className="flex-grow">{content}</main>
        </div>
        <footer className="bg-[#aaa27d] text-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h3 className="text-xl font-semibold mb-2">{companyInfo.companyName}</h3>
                <p className="text-sm">{t['fr'].footer}</p>
              </div>
              <div className="flex flex-col items-center md:items-end">
                <div className="flex items-center mb-2">
                  <IconMapPin className="mr-2" size={18} />
                  <span className="cursor-pointer" onClick={() => onMenuChange('About')}>
                    {companyInfo.address}
                  </span>
                </div>
                <div className="flex items-center mb-2">
                  <IconPhone className="mr-2" size={18} />
                  <Link href={`tel:${companyInfo.phone.replaceAll(' ', '')}`}>{companyInfo.phone}</Link>
                </div>
                <div className="flex items-center">
                  <IconMail className="mr-2" size={18} />
                  <Link href={`mailto:${companyInfo.email}`}>{companyInfo.email}</Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ConfigProvider>
  );
}
