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

  // Если это кнопка settings и она раскрыта, показываем расширенный блок
  if (icon === 'settings' && isExpanded && children) {
    return (
      <div
        className={`
          rounded-xl border shadow-lg transition-all duration-300
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
            flex items-center justify-between w-full px-4 py-3 rounded-t-xl
            transition-colors duration-200
            ${darkMode
              ? 'text-white hover:bg-gray-600'
              : 'text-gray-800 hover:bg-gray-50'
            }
          `}
        >
          <span className="text-base font-semibold">Settings</span>
          <Settings />
        </button>

        {/* Контент меню */}
        <div className="px-4 pb-4">
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
        flex items-center justify-center rounded-sm px-3 py-2.5
        border shadow-md transition-all duration-200
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
