import { twMerge } from 'tailwind-merge';
import { useMenuContext } from '../contexts/menuProvider';

export const MenuButton = ({ className }: { className?: string }) => {
  const { isMenuOpen, setIsMenuOpen } = useMenuContext();
  const handleClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const genericHamburgerLine = `h-1 w-6 my-[3px] rounded-full bg-black dark:bg-white transition ease transform`;

  return (
    <button
      className={twMerge(
        'flex flex-col h-12 w-12 border-0 border-black dark:border-white rounded justify-center items-center group ml-0',
        className,
      )}
      onClick={handleClick}
    >
      <div
        className={twMerge(
          genericHamburgerLine,
          isMenuOpen
            ? 'rotate-45 translate-y-[10px] opacity-100 group-hover:opacity-100'
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
            ? '-rotate-45 -translate-y-[10px] opacity-100 group-hover:opacity-100'
            : 'opacity-100 group-hover:opacity-100',
        )}
      />
    </button>
  );
};
