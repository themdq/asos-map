import { Menu, PanelLeft, Settings } from "lucide-react";

interface MenuButtonProps {
  onClick: () => void;
  darkMode?: boolean;
  icon?: 'menu' | 'settings' | 'panel_left';
  isExpanded?: boolean;
  children?: React.ReactNode;
}

export default function MenuButton({
  onClick,
  darkMode = false,
  icon = 'menu',
  isExpanded = false,
  children
}: MenuButtonProps) {
  const icons = {
    menu: (
      <Menu />
    ),
    settings: (
      <Settings />
    ),
    panel_left: (
      <PanelLeft />
    )
  };

  // Для кнопки settings показываем анимированный переход по диагонали
  if (icon === 'settings') {
    return (
      <div
        className={`
          overflow-hidden border shadow-lg
          transition-all duration-300 ease-out
          rounded-[5px] origin-top-right
          ${darkMode
            ? 'bg-gray-700 border-gray-600'
            : 'bg-primary border-gray-200'
          }
        `}
        style={{
          width: isExpanded ? '250px' : '44px',
          height: isExpanded ? 'auto' : '44px'
        }}
      >
        {/* Заголовок с иконкой settings */}
        <button
          onClick={onClick}
          className={`
            flex items-center w-full cursor-pointer h-[44px]
            transition-all duration-300 ease-out
            ${isExpanded
              ? 'justify-between px-4'
              : 'justify-center px-3'
            }
            ${darkMode
              ? 'text-white hover:bg-gray-600'
              : 'text-graphit hover:bg-accent'
            }
          `}
        >
          <span
            className={`
              text-graphit font-semibold whitespace-nowrap
              transition-opacity duration-200
              ${isExpanded ? 'opacity-100' : 'opacity-0 absolute'}
            `}
          >
            Settings
          </span>
          <Settings className="flex-shrink-0" />
        </button>

        {/* Контент меню */}
        <div
          className={`
            px-4 overflow-hidden
            transition-all duration-300 ease-out
            ${isExpanded ? 'pb-4 opacity-100' : 'pb-0 opacity-0 h-0'}
          `}
        >
          {children}
        </div>
      </div>
    );
  }

  // Обычная кнопка
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-center rounded-[5px] px-3 py-2.5
        border shadow-md transition-all duration-200 cursor-pointer
        ${darkMode
          ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
          : 'bg-primary border-gray-300 text-graphit hover:bg-accent'
        }
      `}
    >
      {icons[icon]}
    </button>
  );
}
