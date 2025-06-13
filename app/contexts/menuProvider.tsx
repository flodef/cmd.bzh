'use client';

import { TabsProps } from 'antd';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { t } from '../utils/i18n';
import About from '../pages/about';
import Contact from '../pages/contact';
import GDPR from '../pages/GDPR';
import Home from '../pages/home';
import Reviews from '../pages/reviews';

export enum Page {
  Home = 'Home',
  About = 'About',
  Contact = 'Contact',
  Reviews = 'Reviews',
  GDPR = 'GDPR',
}
const defaultPage = Page.Home;
const pages = Object.values(Page);

export const generateMenuContent = (activeTab: Page) => (
  <>
    {pages.map(page => {
      return (
        <div key={page} className={page === activeTab ? 'block' : 'hidden'}>
          {
            {
              Home: <Home />,
              About: <About />,
              Contact: <Contact />,
              Reviews: <Reviews />,
              GDPR: <GDPR />,
            }[page]
          }
        </div>
      );
    })}
  </>
);

export const menuItems: TabsProps['items'] = pages
  .filter(page => page !== Page.GDPR)
  .map(page => ({
    key: page,
    label: t(page),
  }));

type MenuContext = {
  onMenuChange: (key?: string) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (isMenuOpen: boolean) => void;
  activeTab: Page;
  title: string;
};

type MenuProviderProps = {
  children: ReactNode;
};

const MenuContext = createContext<MenuContext | undefined>(undefined);

export const MenuProvider = ({ children }: MenuProviderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultPage);
  const [title, setTitle] = useState<string>(t(defaultPage));

  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab') as Page;

      if (tab && pages.includes(tab)) {
        setActiveTab(tab);
        setTitle(t(tab));
      } else {
        setActiveTab(defaultPage);
        setTitle(t(defaultPage));
      }
    };

    // Initialize from URL on first load
    const urlParams = new URLSearchParams(window.location.search);
    const initialTab = urlParams.get('tab') as Page;
    if (initialTab && pages.includes(initialTab)) {
      setActiveTab(initialTab);
      setTitle(t(initialTab));
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const onMenuChange = (key = 'Home') => {
    const activeTab = pages.find(page => page === key) || defaultPage;

    // Update URL without reload
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('tab', activeTab);
    window.history.pushState({ activeTab }, '', newUrl.toString());

    setTitle(t(key));
    setActiveTab(activeTab);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <MenuContext.Provider
      value={{
        onMenuChange,
        isMenuOpen,
        setIsMenuOpen,
        activeTab,
        title,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

export const useMenuContext = () => {
  const context = useContext(MenuContext);

  if (context === undefined) {
    throw new Error('useMenuContext must be used within a MenuProvider');
  }

  return context;
};
