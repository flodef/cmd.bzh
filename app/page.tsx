'use client';

import { IconMail, IconMapPin, IconPhone } from '@tabler/icons-react';
import { ConfigProvider, Tabs, theme } from 'antd';
import Image from 'next/image';
import { ReactNode, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import About from './about';
import { MenuButton } from './components/menuButton';
import Contact from './contact';
import Home from './home';
import { useWindowParam } from './hooks/useWindowParam';

const { defaultAlgorithm, darkAlgorithm } = theme;

const items = [
  {
    key: 'Home',
    label: 'Accueil',
  },
  {
    key: 'About',
    label: 'Qui suis-je',
  },
  {
    key: 'Contact',
    label: 'Contact',
  },
];

export default function Page() {
  const { colorScheme, width } = useWindowParam();

  const [isOpen, setIsOpen] = useState(false);
  const [Content, setContent] = useState<ReactNode>(<Home />);
  const [title, setTitle] = useState(items[0].label);

  const isDark = useMemo(() => colorScheme === 'dark', [colorScheme]);
  const isMobile = useMemo(() => width < 768, [width]);

  const onChange = (key: string) => {
    setTitle(items.find(item => item.key === key)?.label || '');
    setContent({ Home: <Home />, About: <About />, Contact: <Contact /> }[key]);
    setIsOpen(false);
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
      <div className="flex flex-col min-h-screen overflow-x-hidden">
        <header className="bg-white dark:bg-[#001529] shadow-sm absolute top-0 w-full z-10">
          <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Image
              className="self-start z-10"
              src="/logo.png"
              alt="CMD Logo"
              width={100}
              height={100}
              priority
              onClick={() => alert('click')}
            />
            <div className={twMerge('flex space-x-4 z-10', isMobile ? 'self-start w-full justify-end' : '')}>
              <div
                className={twMerge(
                  isMobile ? 'transition-all ease-in-out transform' : 'visible max-h-28 flex items-center',
                  isOpen || !isMobile ? 'opacity-100 scale-y-100 h-40' : 'opacity-0 scale-y-0 h-0',
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

              <MenuButton className="md:hidden" isOpen={isOpen} setIsOpen={setIsOpen} />
            </div>
            {isMobile && (
              <div
                className={twMerge(
                  'absolute top-7 text-center w-full self-end',
                  !isOpen ? 'transition-all delay-300 opacity-100' : 'opacity-0',
                )}
              >
                <h1 className="text-2xl font-bold text-center mb-8">{title}</h1>
              </div>
            )}
          </nav>
        </header>
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">{Content}</main>
        </div>
        <footer className="bg-gray-800 text-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h3 className="text-xl font-semibold mb-2">CleanGreen Services</h3>
                <p className="text-sm">Your trusted partner for cleaning, gardening, and property management.</p>
              </div>
              <div className="flex flex-col items-center md:items-end">
                <div className="flex items-center mb-2">
                  <IconMapPin className="mr-2" size={18} />
                  <span>123 Green Street, Eco City, EC 12345</span>
                </div>
                <div className="flex items-center mb-2">
                  <IconPhone className="mr-2" size={18} />
                  <span>(555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <IconMail className="mr-2" size={18} />
                  <span>info@cleangreenservices.com</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ConfigProvider>
  );
}
