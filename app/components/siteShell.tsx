'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import Footer from './footer';
import { MenuButton } from './menuButton';
import { CMDLogo } from '../images/cmd';
import { useT } from '../contexts/languageProvider';
import { ToastProvider } from './ui/toast';

export const SECTION_IDS = ['home', 'about', 'reviews', 'contact'] as const;
export type SectionId = (typeof SECTION_IDS)[number];

/** Sliding underline driven by the active nav link's measured position. */
function useNavUnderline(active: SectionId | null) {
  const navRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef(new Map<SectionId, HTMLAnchorElement>());
  const [style, setStyle] = useState({ left: 0, width: 0, visible: false });

  const measure = useCallback(() => {
    const el = active ? linkRefs.current.get(active) : null;
    if (!el) {
      setStyle(s => ({ ...s, visible: false }));
      return;
    }
    setStyle({ left: el.offsetLeft, width: el.offsetWidth, visible: true });
  }, [active]);

  useEffect(() => {
    measure();
    // Re-measure once webfonts are applied (they shift the links' widths)
    document.fonts?.ready.then(measure).catch(() => {});
    const observer = new ResizeObserver(measure);
    if (navRef.current) observer.observe(navRef.current);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  return { navRef, linkRefs, style };
}

/** Scrollspy: the active section is the last one whose top passed the marker line. */
function useScrollSpy(enabled: boolean) {
  const [active, setActiveState] = useState<SectionId | null>('home');
  // While a nav click drives a programmatic scroll, the underline is locked on
  // the clicked target — intermediate sections the marker crosses on the way
  // don't animate it back and forth
  const lockRef = useRef<SectionId | null>(null);
  const settleRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const computeCurrent = () => {
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8) {
      return SECTION_IDS[SECTION_IDS.length - 1];
    }
    const marker = window.scrollY + window.innerHeight * 0.4;
    let current: SectionId = 'home';
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top + window.scrollY <= marker) current = id;
    }
    return current;
  };

  useEffect(() => {
    if (!enabled) {
      setActiveState(null);
      return;
    }
    let raf = 0;
    const scheduleSettle = () => {
      clearTimeout(settleRef.current);
      // If scrolling stops without reaching the locked target (user
      // interrupted the programmatic scroll), release the lock
      settleRef.current = setTimeout(() => {
        lockRef.current = null;
        setActiveState(computeCurrent());
      }, 250);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const current = computeCurrent();
        if (lockRef.current) {
          if (current === lockRef.current) {
            lockRef.current = null;
            setActiveState(current);
          }
          // else: still traveling — keep the underline on the clicked target
          return;
        }
        setActiveState(current);
      });
      if (lockRef.current) scheduleSettle();
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settleRef.current);
      window.removeEventListener('scroll', onScroll);
    };
  }, [enabled]);

  // Called on nav click: snap the underline to the target and lock it while
  // the smooth scroll plays out
  const select = useCallback((id: SectionId) => {
    lockRef.current = id;
    setActiveState(id);
    // If the click produces no scroll (already at the target), release quickly —
    // scroll events reschedule this timer while the animation runs
    clearTimeout(settleRef.current);
    settleRef.current = setTimeout(() => {
      lockRef.current = null;
      setActiveState(computeCurrent());
    }, 250);
  }, []);

  return [active, select] as const;
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const t = useT();
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [active, select] = useScrollSpy(isHome);
  const { navRef, linkRefs, style } = useNavUnderline(active);

  const navItems: { id: SectionId; label: string }[] = [
    { id: 'home', label: t('Home') },
    { id: 'about', label: t('About') },
    { id: 'reviews', label: t('Reviews') },
    { id: 'contact', label: t('Contact') },
  ];

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const registerLink = (id: SectionId) => (el: HTMLAnchorElement | null) => {
    if (el) linkRefs.current.set(id, el);
    else linkRefs.current.delete(id);
  };

  return (
    <ToastProvider>
      <div className="flex flex-col min-h-screen overflow-x-clip">
        <header className="fixed top-3 sm:top-4 inset-x-0 z-50 px-3 sm:px-4">
          <nav
            className={twMerge(
              'glass rounded-full max-w-3xl mx-auto pl-1.5 pr-2 py-1.5 flex items-center justify-between gap-2',
              'transition-shadow duration-300',
              isScrolled && 'shadow-xl',
            )}
          >
            <Link href="/#home" aria-label="CMD Breizh - Accueil" className="flex-none rounded-full">
              <CMDLogo width={44} height={44} className="size-11 drop-shadow-sm" />
            </Link>

            {/* Desktop nav with sliding underline */}
            <div className="relative hidden md:block" ref={navRef}>
              <ul className="flex items-center">
                {navItems.map(item => (
                  <li key={item.id}>
                    <Link
                      ref={registerLink(item.id)}
                      href={`/#${item.id}`}
                      onClick={() => isHome && select(item.id)}
                      className={twMerge(
                        'relative block px-4 py-2 text-sm font-medium transition-colors duration-300',
                        active === item.id
                          ? 'text-brand dark:text-sky'
                          : 'text-bark/70 dark:text-cream/70 hover:text-bark dark:hover:text-cream',
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <span
                aria-hidden="true"
                className="absolute bottom-0.5 h-0.5 rounded-full bg-brand dark:bg-sky transition-all duration-300 ease-out"
                style={{
                  left: style.left,
                  width: style.width,
                  opacity: style.visible ? 1 : 0,
                }}
              />
            </div>

            <div className="md:hidden flex-none">
              <MenuButton isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
            </div>
          </nav>
        </header>

        {/* Mobile fullscreen glass menu */}
        <div
          className={twMerge(
            'md:hidden fixed inset-0 z-40 transition-all duration-300',
            isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
          )}
        >
          <div className="absolute inset-0 bg-sky/60 dark:bg-black/60 backdrop-blur-2xl" />
          <ul className="relative h-full flex flex-col items-center justify-center gap-6">
            {navItems.map((item, i) => (
              <li
                key={item.id}
                className="transition-all duration-500 ease-out"
                style={{
                  opacity: isMenuOpen ? 1 : 0,
                  transform: isMenuOpen ? 'none' : 'translateY(16px)',
                  transitionDelay: isMenuOpen ? `${80 + i * 60}ms` : '0ms',
                }}
              >
                <Link
                  href={`/#${item.id}`}
                  onClick={() => setIsMenuOpen(false)}
                  className={twMerge(
                    'text-3xl font-semibold',
                    active === item.id ? 'text-brand dark:text-sky' : 'text-bark dark:text-cream',
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <main className="grow">{children}</main>
        <Footer />
      </div>
    </ToastProvider>
  );
}
