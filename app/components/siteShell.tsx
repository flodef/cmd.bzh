'use client';

import { ConfigProvider, Tabs, theme } from 'antd';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import Footer from './footer';
import { MenuButton } from './menuButton';
import { useWindowParam } from '../hooks/useWindowParam';
import { CMDLogo } from '../images/cmd';
import { t } from '../utils/i18n';
import { Page } from '../contexts/menuProvider';

const { defaultAlgorithm, darkAlgorithm } = theme;

const navItems: { key: Page; href: string; label: string }[] = [
  { key: Page.Home, href: '/', label: t('Home') },
  { key: Page.About, href: '/about', label: t('About') },
  { key: Page.Contact, href: '/contact', label: t('Contact') },
  { key: Page.Reviews, href: '/reviews', label: t('Reviews') },
];

function getActiveTab(pathname: string): Page {
  const match = navItems.find(item => item.href === pathname);
  return match?.key ?? Page.Home;
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const { isDark, isReady, breakpoints, width } = useWindowParam();
  // Default to desktop values for SSR, hydrate with real values on client
  const isMobile = isReady ? breakpoints.isSm : false;
  const isTinyMobile = isReady ? breakpoints.is2xs : false;

  const pathname = usePathname();
  const router = useRouter();
  const activeTab = getActiveTab(pathname);
  const title = t(activeTab);

  const handleTabChange = (key: string) => {
    const item = navItems.find(i => i.key === key);
    if (item) router.push(item.href);
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? darkAlgorithm : defaultAlgorithm,
        components: {
          Card: {
            headerFontSize: 20,
            headerHeight: 80,
          },
          Form: {
            labelFontSize: 16,
          },
          Carousel: {
            arrowOffset: 0,
            arrowSize: 24,
          },
        },
      }}
    >
      <div className="flex flex-col min-h-screen overflow-x-hidden">
        <header
          className={twMerge(
            'fixed top-0 left-0 right-0 z-10',
            isScrolled ? 'bg-white/80 dark:bg-[#001529]/80 backdrop-blur-sm shadow-md' : 'bg-white dark:bg-[#001529]',
          )}
        >
          <nav className="w-full max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" aria-label="CMD Breizh - Accueil">
              <CMDLogo
                className="flex-none self-start z-10 cursor-pointer w-24 h-24 sm:w-28 sm:h-28"
                width={!isMobile ? 112 : 100}
                height={!isMobile ? 112 : 100}
              />
            </Link>
            <div className={twMerge('flex z-10', isMobile ? 'self-start w-full justify-end' : '')}>
              <div
                className={twMerge(
                  isMobile ? 'transition transform' : 'visible max-h-28 flex items-center',
                  isMenuOpen || !isMobile ? 'opacity-100 scale-y-100 h-52' : 'opacity-0 scale-y-0 h-0',
                  isTinyMobile ? (isMenuOpen ? 'h-80' : 'h-40') : '',
                )}
              >
                <Tabs
                  style={{
                    width: isMobile ? width - 210 : 'auto',
                    marginLeft: isTinyMobile ? 80 - width : 0,
                    marginTop: isTinyMobile ? 120 : 0,
                  }}
                  activeKey={activeTab}
                  onChange={handleTabChange}
                  items={navItems.map(item => ({
                    key: item.key,
                    label: item.label,
                  }))}
                  size="large"
                  tabPlacement={isMobile ? 'end' : 'top'}
                />
              </div>

              {isMobile && <MenuButton isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />}
            </div>
            {isMobile && (
              <div
                className={twMerge(
                  'absolute text-center w-full self-end',
                  isTinyMobile ? 'top-32 left-0' : 'top-7 pl-26 pr-20',
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
            !isMenuOpen
              ? isTinyMobile
                ? 'pt-40'
                : isMobile
                  ? 'pt-33'
                  : 'pt-36'
              : isTinyMobile
                ? 'pt-80'
                : isMobile
                  ? 'pt-60'
                  : 'pt-36',
          )}
        >
          <main className="grow content-center">{children}</main>
          <Footer />
        </div>
      </div>
    </ConfigProvider>
  );
}
