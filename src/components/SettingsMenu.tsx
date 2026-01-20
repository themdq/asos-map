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
  return (
    <div className="min-w-[250px]">{/* Контейнер для содержимого */}

      {/* Theme Toggle */}
      <div
        className={`
          py-3 border-b
          ${darkMode ? 'border-gray-600' : 'border-gray-200'}
        `}
      >
        <div className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Theme
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => darkMode && onDarkModeToggle()}
            className={`
              flex-1 py-1.5 px-3 rounded-md border-none cursor-pointer
              flex items-center justify-center transition-all duration-200
              ${!darkMode
                ? 'bg-secondary-foreground text-white'
                : 'bg-gray-600 text-gray-300'
              }
            `}
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            onClick={() => !darkMode && onDarkModeToggle()}
            className={`
              flex-1 py-1.5 px-3 rounded-md border-none cursor-pointer
              flex items-center justify-center transition-all duration-200
              ${darkMode
                ? 'bg-secondary-foreground text-white'
                : 'bg-primary-foreground text-gray-600'
              }
            `}
          >
            <Moon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Temperature Unit */}
      <div
        className={`
          py-3 border-b
          ${darkMode ? 'border-gray-600' : 'border-gray-200'}
        `}
      >
        <div className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Temperature
        </div>
        <div className="flex gap-2">
          {(['C', 'F'] as const).map((unit) => (
            <button
              key={unit}
              onClick={() => onTemperatureUnitChange(unit)}
              className={`
                flex-1 py-1.5 px-3 rounded-md border-none cursor-pointer
                text-[13px] font-medium transition-all duration-200
                ${temperatureUnit === unit
                  ? 'bg-secondary-foreground text-white'
                  : darkMode
                    ? 'bg-gray-600 text-gray-300'
                    : 'bg-primary-foreground text-gray-600'
                }
              `}
            >
              °{unit}
            </button>
          ))}
        </div>
      </div>

      {/* Wind Speed Unit */}
      <div
        className={`
          py-3 border-b
          ${darkMode ? 'border-gray-600' : 'border-gray-200'}
        `}
      >
        <div className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Wind Speed
        </div>
        <div className="flex gap-2">
          {[
            { value: 'kmh', label: 'km/h' },
            { value: 'mph', label: 'mph' }
          ].map((unit) => (
            <button
              key={unit.value}
              onClick={() => onWindSpeedUnitChange(unit.value as 'kmh' | 'mph')}
              className={`
                flex-1 py-1.5 px-2 rounded-md border-none cursor-pointer
                text-xs font-medium transition-all duration-200
                ${windSpeedUnit === unit.value
                  ? 'bg-secondary-foreground text-white'
                  : darkMode
                    ? 'bg-gray-600 text-gray-300'
                    : 'bg-primary-foreground text-gray-600'
                }
              `}
            >
              {unit.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pressure Unit */}
      <div
        className={`
          py-3 border-b
          ${darkMode ? 'border-gray-600' : 'border-gray-200'}
        `}
      >
        <div className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Pressure
        </div>
        <div className="flex gap-2">
          {[
            { value: 'mb', label: 'mb' },
            { value: 'hPa', label: 'hPa' }
          ].map((unit) => (
            <button
              key={unit.value}
              onClick={() => onPressureUnitChange(unit.value as 'mb' | 'hPa')}
              className={`
                flex-1 py-1.5 px-2 rounded-md border-none cursor-pointer
                text-xs font-medium transition-all duration-200
                ${pressureUnit === unit.value
                  ? 'bg-secondary-foreground text-white'
                  : darkMode
                    ? 'bg-gray-600 text-gray-300'
                    : 'bg-primary-foreground text-gray-600'
                }
              `}
            >
              {unit.label}
            </button>
          ))}
        </div>
      </div>

      {/* Precipitation Unit */}
      <div className="pt-3">
        <div className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Precipitation
        </div>
        <div className="flex gap-2">
          {[
            { value: 'mm', label: 'mm' },
            { value: 'in', label: 'in' }
          ].map((unit) => (
            <button
              key={unit.value}
              onClick={() => onPrecipitationUnitChange(unit.value as 'mm' | 'in')}
              className={`
                flex-1 py-1.5 px-2 rounded-md border-none cursor-pointer
                text-xs font-medium transition-all duration-200
                ${precipitationUnit === unit.value
                  ? 'bg-secondary-foreground text-white'
                  : darkMode
                    ? 'bg-gray-600 text-gray-300'
                    : 'bg-primary-foreground text-gray-600'
                }
              `}
            >
              {unit.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
