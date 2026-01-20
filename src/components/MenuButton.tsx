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

  // Для кнопки settings показываем анимированный переход
  if (icon === 'settings') {
    return (
      <div
        className={`
          overflow-hidden border shadow-lg
          transition-all duration-300 ease-in-out
          rounded-[5px]
          ${isExpanded
            ? 'min-w-[250px]'
            : 'w-[44px]'
          }
          ${darkMode
            ? 'bg-gray-700 border-gray-600'
            : 'bg-primary border-gray-200'
          }
        `}
      >
        {/* Заголовок с иконкой settings */}
        <button
          onClick={onClick}
          className={`
            flex items-center w-full cursor-pointer
            transition-all duration-300 ease-in-out
            ${isExpanded
              ? 'justify-between px-4 py-3'
              : 'justify-center px-3 py-2.5'
            }
            ${darkMode
              ? 'text-white hover:bg-gray-600'
              : 'text-gray-800 hover:bg-gray-50'
            }
          `}
        >
          <span
            className={`
              text-base font-semibold whitespace-nowrap
              transition-all duration-300
              ${isExpanded
                ? 'opacity-100 max-w-[200px]'
                : 'opacity-0 max-w-0 overflow-hidden'
              }
            `}
          >
            Settings
          </span>
          <Settings className="flex-shrink-0" />
        </button>

        {/* Контент меню */}
        <div
          className={`
            px-4 transition-all duration-300 ease-in-out
            ${isExpanded
              ? 'max-h-[600px] pb-4 opacity-100'
              : 'max-h-0 pb-0 opacity-0'
            }
          `}
          style={{
            overflow: isExpanded ? 'visible' : 'hidden'
          }}
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
          : 'bg-primary border-gray-300 text-gray-800 hover:bg-gray-50'
        }
      `}
    >
      {icons[icon]}
    </button>
  );
}
