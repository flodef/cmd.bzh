import { twMerge } from 'tailwind-merge';

export const MenuButton = ({
  className,
  isOpen,
  setIsOpen,
}: {
  className?: string;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const genericHamburgerLine = `h-1 w-6 my-1 rounded-full bg-black dark:bg-white transition ease transform`;

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
          isOpen
            ? 'rotate-45 translate-y-3 opacity-100 group-hover:opacity-100'
            : 'opacity-100 group-hover:opacity-100',
        )}
      />
      <div className={twMerge(genericHamburgerLine, isOpen ? 'opacity-0' : 'opacity-100 group-hover:opacity-100')} />
      <div
        className={twMerge(
          genericHamburgerLine,
          isOpen
            ? '-rotate-45 -translate-y-3 opacity-100 group-hover:opacity-100'
            : 'opacity-100 group-hover:opacity-100',
        )}
      />
    </button>
  );
};
