'use client';

import { IconMail, IconMapPin, IconPhone } from '@tabler/icons-react';
import { ConfigProvider, Modal, Tabs, theme } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { MenuButton } from './components/menuButton';
import { companyInfo } from './constants';
import { useWindowParam } from './hooks/useWindowParam';
import About from './pages/about';
import Contact from './pages/contact';
import Home from './pages/home';

const t = {
  fr: {
    home: 'Accueil',
    about: 'A propos de nous',
    contact: 'Nous contacter',
    footer: 'Votre partenaire pour la propreté, le jardinage et la gestion de votre propriété.',
  },
  en: {
    footer: 'Your trusted partner for cleaning, gardening, and property management.',
  },
};

const { defaultAlgorithm, darkAlgorithm } = theme;

const items = [
  {
    key: 'Home',
    label: t['fr'].home,
  },
  {
    key: 'About',
    label: t['fr'].about,
  },
  {
    key: 'Contact',
    label: t['fr'].contact,
  },
];

export default function Page() {
  const { colorScheme, width } = useWindowParam();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [Content, setContent] = useState<ReactNode>(<Home />);
  const [title, setTitle] = useState(items[0].label);

  const isDark = useMemo(() => colorScheme === 'dark', [colorScheme]);
  const isMobile = useMemo(() => width < 768, [width]);

  const onChange = (key: string) => {
    setTitle(items.find(item => item.key === key)?.label || '');
    setContent({ Home: <Home />, About: <About />, Contact: <Contact /> }[key]);
    setIsMenuOpen(false);
    window.scrollTo({
      top: 0,
      behavior: 'instant',
    });
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? darkAlgorithm : defaultAlgorithm,
      }}
    >
      <Modal
        className="bg-yellow-200"
        style={{ backgroundColor: '#a4bcde' }}
        title={companyInfo.companyName}
        centered
        open={isPopupOpen}
        footer={null}
        onCancel={() => setIsPopupOpen(false)}
      >
        <p>blabla</p>
        <p>blabla</p>
        <p>blabla</p>
      </Modal>
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
              onClick={() => setIsPopupOpen(true)}
            />
            <div className={twMerge('flex space-x-4 z-10', isMobile ? 'self-start w-full justify-end' : '')}>
              <div
                className={twMerge(
                  isMobile ? 'transition transform' : 'visible max-h-28 flex items-center',
                  isMenuOpen || !isMobile ? 'opacity-100 scale-y-100 h-40' : 'opacity-0 scale-y-0 h-0',
                )}
              >
                <Tabs
                  defaultActiveKey="1"
                  items={items}
                  onChange={onChange}
                  size="large"
                  tabPosition={isMobile ? 'right' : 'top'}
                />
              </div>

              <MenuButton className="md:hidden" isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
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
          <main className="flex-grow">{Content}</main>
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
                  <span className="cursor-pointer" onClick={() => onChange('About')}>
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
