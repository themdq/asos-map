import { Menu, PanelLeft, Settings } from "lucide-react";

interface MenuButtonProps {
  onClick: () => void;
  icon?: 'menu' | 'settings' | 'panel_left';
  isExpanded?: boolean;
  children?: React.ReactNode;
}

export default function MenuButton({
  onClick,
  icon = 'menu',
  isExpanded = false,
  children
}: MenuButtonProps) {
  const icons = {
    menu: <Menu />,
    settings: <Settings />,
    panel_left: <PanelLeft />
  };

  // Settings button: trigger + dropdown overlaying content
  if (icon === 'settings') {
    return (
      <>
        {/* Button */}
        <button
          onClick={onClick}
          className={`
            flex items-center justify-center rounded-[5px] px-3 py-2.5 border shadow-md transition-all duration-200 cursor-pointer
            ${isExpanded
              ? 'bg-secondary-foreground text-white border-secondary-foreground'
              : 'bg-primary text-graphit border-border hover:bg-secondary-foreground hover:text-white'
            }
          `}
        >
          <Settings />
        </button>

        {/* Dropdown menu over content */}
        {isExpanded && (
          <div className="fixed top-4 right-4 z-50 w-[200px] bg-primary border border-border rounded-[5px] shadow-lg">
            <div className="flex items-center justify-between px-4 h-[44px] border-b border-border">
              <span className="text-graphit font-semibold">Settings</span>
              <button onClick={onClick} className="text-muted-foreground hover:text-graphit cursor-pointer">
                <Settings className="w-5 h-5" />
              </button>
            </div>
            <div className="px-4 pb-4">
              {children}
            </div>
          </div>
        )}
      </>
    );
  }

  // Regular button
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-center rounded-[5px] px-3 py-2.5 border shadow-md transition-all duration-200 cursor-pointer
        ${isExpanded
          ? 'bg-secondary-foreground text-white border-secondary-foreground'
          : 'bg-primary text-graphit border-border hover:bg-secondary-foreground hover:text-white'
        }
      `}
    >
      {icons[icon]}
    </button>
  );
}
