'use client';

import { createContext, ReactNode, useContext, useState } from 'react';
import About from '../pages/about';
import Contact from '../pages/contact';
import Home from '../pages/home';

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

export const menuItems = [
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

type MenuContext = {
  onMenuChange: (key?: string) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (isMenuOpen: boolean) => void;
  activeTab: string;
  content: ReactNode;
  title: string;
};

type MenuProviderProps = {
  children: ReactNode;
};

const MenuContext = createContext<MenuContext | undefined>(undefined);

export const MenuProvider = ({ children }: MenuProviderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [content, setContent] = useState<ReactNode>(<Home />);
  const [title, setTitle] = useState(menuItems[0].label);

  const onMenuChange = (key = 'Home') => {
    setTitle(menuItems.find(item => item.key === key)?.label || '');
    setActiveTab(key);
    setContent({ Home: <Home />, About: <About />, Contact: <Contact /> }[key]);
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
        content,
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
