import React from 'react';

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
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    ),
    settings: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3M19.07 4.93l-4.24 4.24m-5.66 5.66l-4.24 4.24M4.93 19.07l4.24-4.24m5.66-5.66l4.24-4.24"></path>
      </svg>
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
          : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-50'
        }
      `}
    >
      {icons[icon]}
    </button>
  );
}
