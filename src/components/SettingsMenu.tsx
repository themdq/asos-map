import { Sun, Moon } from 'lucide-react';

interface SettingsMenuProps {
  darkMode: boolean;
  temperatureUnit: 'C' | 'F';
  windSpeedUnit: 'kmh' | 'mph';
  pressureUnit: 'mb' | 'hPa';
  precipitationUnit: 'mm' | 'in';
  onDarkModeToggle: () => void;
  onTemperatureUnitChange: (unit: 'C' | 'F') => void;
  onWindSpeedUnitChange: (unit: 'kmh' | 'mph') => void;
  onPressureUnitChange: (unit: 'mb' | 'hPa') => void;
  onPrecipitationUnitChange: (unit: 'mm' | 'in') => void;
}

export default function SettingsMenu({
  darkMode,
  temperatureUnit,
  windSpeedUnit,
  pressureUnit,
  precipitationUnit,
  onDarkModeToggle,
  onTemperatureUnitChange,
  onWindSpeedUnitChange,
  onPressureUnitChange,
  onPrecipitationUnitChange
}: SettingsMenuProps) {
  const buttonBase = `
    flex-1 py-1.5 px-2 rounded border-none cursor-pointer
    text-xs font-medium transition-all duration-200
  `;

  const buttonActive = 'bg-secondary-foreground text-white';
  const buttonInactive = darkMode
    ? 'bg-gray-600 text-gray-300'
    : 'bg-primary-foreground text-gray-600';

  return (
    <div className="w-full">
      {/* Theme */}
      <div className={`py-2 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
        <div className={`text-xs mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
          Theme
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => darkMode && onDarkModeToggle()}
            className={`${buttonBase} ${!darkMode ? buttonActive : buttonInactive}`}
          >
            <Sun className="w-4 h-4 mx-auto" />
          </button>
          <button
            onClick={() => !darkMode && onDarkModeToggle()}
            className={`${buttonBase} ${darkMode ? buttonActive : buttonInactive}`}
          >
            <Moon className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>

      {/* Temperature */}
      <div className={`py-2 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
        <div className={`text-xs mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
          Temperature
        </div>
        <div className="flex gap-1.5">
          {(['C', 'F'] as const).map((unit) => (
            <button
              key={unit}
              onClick={() => onTemperatureUnitChange(unit)}
              className={`${buttonBase} ${temperatureUnit === unit ? buttonActive : buttonInactive}`}
            >
              °{unit}
            </button>
          ))}
        </div>
      </div>

      {/* Wind Speed */}
      <div className={`py-2 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
        <div className={`text-xs mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
          Wind
        </div>
        <div className="flex gap-1.5">
          {[
            { value: 'kmh', label: 'km/h' },
            { value: 'mph', label: 'mph' }
          ].map((unit) => (
            <button
              key={unit.value}
              onClick={() => onWindSpeedUnitChange(unit.value as 'kmh' | 'mph')}
              className={`${buttonBase} ${windSpeedUnit === unit.value ? buttonActive : buttonInactive}`}
            >
              {unit.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pressure */}
      <div className={`py-2 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
        <div className={`text-xs mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
          Pressure
        </div>
        <div className="flex gap-1.5">
          {[
            { value: 'mb', label: 'mb' },
            { value: 'hPa', label: 'hPa' }
          ].map((unit) => (
            <button
              key={unit.value}
              onClick={() => onPressureUnitChange(unit.value as 'mb' | 'hPa')}
              className={`${buttonBase} ${pressureUnit === unit.value ? buttonActive : buttonInactive}`}
            >
              {unit.label}
            </button>
          ))}
        </div>
      </div>

      {/* Precipitation */}
      <div className="py-2">
        <div className={`text-xs mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
          Precip
        </div>
        <div className="flex gap-1.5">
          {[
            { value: 'mm', label: 'mm' },
            { value: 'in', label: 'in' }
          ].map((unit) => (
            <button
              key={unit.value}
              onClick={() => onPrecipitationUnitChange(unit.value as 'mm' | 'in')}
              className={`${buttonBase} ${precipitationUnit === unit.value ? buttonActive : buttonInactive}`}
            >
              {unit.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
