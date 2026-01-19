import { Menu, Settings } from "lucide-react";

interface MenuButtonProps {
  onClick: () => void;
  darkMode?: boolean;
  icon?: 'menu' | 'settings';
}

export default function MenuButton({
  onClick,
  darkMode = false,
  icon = 'menu'
}: MenuButtonProps) {
  const icons = {
    menu: (
      <Menu />
    ),
    settings: (
      <Settings />
    )
  };

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-center rounded-lg px-3 py-2.5
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
