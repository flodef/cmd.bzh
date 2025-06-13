'use client';

import { ConfigProvider, Tabs, theme } from 'antd';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import Footer from './components/footer';
import { MenuButton } from './components/menuButton';
import { generateMenuContent, menuItems, useMenuContext } from './contexts/menuProvider';
import { useWindowParam } from './hooks/useWindowParam';
import { CMDLogo } from './images/cmd';
import Loading from './loading';

const { defaultAlgorithm, darkAlgorithm } = theme;

export default function Page() {
  const { isDark, isReady, breakpoints, width } = useWindowParam();
  const { isSm: isMobile, is2xs: isTinyMobile } = breakpoints;
  const { onMenuChange, isMenuOpen, activeTab, title } = useMenuContext();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: false });
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
      {isReady ? (
        <div className="flex flex-col min-h-screen overflow-x-hidden">
          <header
            className={twMerge(
              'fixed top-0 left-0 right-0 z-10',
              isScrolled ? 'bg-white/80 dark:bg-[#001529]/80 backdrop-blur-sm shadow-md' : 'bg-white dark:bg-[#001529]',
            )}
          >
            <nav className="w-full max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
              <CMDLogo
                className="flex-none self-start z-10 cursor-pointer w-24 h-24 sm:w-28 sm:h-28"
                width={!isMobile ? 112 : 100}
                height={!isMobile ? 112 : 100}
                onClick={() => onMenuChange()}
              />
              <div className={twMerge('flex z-10', isMobile ? 'self-start w-full justify-end' : '')}>
                <div
                  className={twMerge(
                    isMobile ? 'transition transform' : 'visible max-h-28 flex items-center',
                    isMenuOpen || !isMobile ? 'opacity-100 scale-y-100 h-52' : 'opacity-0 scale-y-0 h-0',
                    isTinyMobile ? (isMenuOpen ? 'h-[320px]' : 'h-40') : '',
                  )}
                >
                  <Tabs
                    style={{
                      width: isMobile ? width - 210 : 'auto',
                      marginLeft: isTinyMobile ? 80 - width : 0,
                      marginTop: isTinyMobile ? 120 : 0,
                    }}
                    activeKey={activeTab}
                    items={menuItems}
                    onChange={onMenuChange}
                    size="large"
                    tabPosition={isMobile ? 'right' : 'top'}
                  />
                </div>

                {isMobile && <MenuButton />}
              </div>
              {isMobile && (
                <div
                  className={twMerge(
                    'absolute text-center w-full self-end',
                    isTinyMobile ? 'top-32 left-0' : 'top-7 pl-[104px] pr-20',
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
                  ? 'pt-[132px]'
                  : 'pt-36'
                : isTinyMobile
                ? 'pt-[320px]'
                : isMobile
                ? 'pt-60'
                : 'pt-36',
            )}
          >
            <main className="flex-grow content-center">{generateMenuContent(activeTab)}</main>
            <Footer />
          </div>
        </div>
      ) : (
        <Loading />
      )}
    </ConfigProvider>
  );
}
