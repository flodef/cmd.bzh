'use client';

import { TabsProps } from 'antd';
import { createContext, ReactNode, useContext, useState } from 'react';
import { t } from '../i18n';
import About from '../pages/about';
import Contact from '../pages/contact';
import Home from '../pages/home';
import GDPR from '../pages/GDPR';

export enum Page {
  Home = 'Home',
  About = 'About',
  Contact = 'Contact',
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

  const onMenuChange = (key = 'Home') => {
    const activeTab = pages.find(page => page === key) || defaultPage;
    setTitle(t(key));
    setActiveTab(activeTab);
    setIsMenuOpen(false);
    window.scrollTo({
      top: 0,
      behavior: 'instant',
    });
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
