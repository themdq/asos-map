import { memo } from 'react';

interface ToggleGroupProps<T extends string> {
  label: string;
  options: { value: T; label: string | React.ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  showBorder?: boolean;
}

function ToggleGroupComponent<T extends string>({
  label,
  options,
  value,
  onChange,
  showBorder = true,
}: ToggleGroupProps<T>) {
  const buttonBase = 'flex-1 py-1.5 px-2 rounded border-none cursor-pointer text-xs font-medium transition-all duration-200';
  const buttonActive = 'bg-secondary-foreground text-white';
  const buttonInactive = 'bg-primary text-muted-foreground';

  return (
    <div className={`py-2 ${showBorder ? 'border-b border-border' : ''}`}>
      <div className="text-xs mb-1.5 text-muted-foreground">{label}</div>
      <div className="flex gap-1.5">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`${buttonBase} ${value === option.value ? buttonActive : buttonInactive}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export const ToggleGroup = memo(ToggleGroupComponent) as typeof ToggleGroupComponent;
