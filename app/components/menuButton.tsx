import { twMerge } from 'tailwind-merge';

export const MenuButton = ({
  className,
  isMenuOpen,
  setIsMenuOpen,
}: {
  className?: string;
  isMenuOpen: boolean;
  setIsMenuOpen: (isMenuOpen: boolean) => void;
}) => {
  const handleClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const genericHamburgerLine = `h-1 w-6 my-[3px] rounded-full bg-bark dark:bg-cream transition ease transform`;

  return (
    <button
      aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
      className={twMerge(
        'flex flex-col h-11 w-11 rounded-full justify-center items-center group cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 transition-colors',
        className,
      )}
      onClick={handleClick}
    >
      <div
        className={twMerge(
          genericHamburgerLine,
          isMenuOpen
            ? 'rotate-45 translate-y-2.5 opacity-100 group-hover:opacity-100'
            : 'opacity-100 group-hover:opacity-100',
        )}
      />
      <div
        className={twMerge(genericHamburgerLine, isMenuOpen ? 'opacity-0' : 'opacity-100 group-hover:opacity-100')}
      />
      <div
        className={twMerge(
          genericHamburgerLine,
          isMenuOpen
            ? '-rotate-45 -translate-y-2.5 opacity-100 group-hover:opacity-100'
            : 'opacity-100 group-hover:opacity-100',
        )}
      />
    </button>
  );
};
