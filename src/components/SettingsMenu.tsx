interface SettingsMenuProps {
  darkMode: boolean;
  temperatureUnit: 'C' | 'F';
  windSpeedUnit: 'ms' | 'kmh' | 'mph';
  onDarkModeToggle: () => void;
  onTemperatureUnitChange: (unit: 'C' | 'F') => void;
  onWindSpeedUnitChange: (unit: 'ms' | 'kmh' | 'mph') => void;
}

export default function SettingsMenu({
  darkMode,
  temperatureUnit,
  windSpeedUnit,
  onDarkModeToggle,
  onTemperatureUnitChange,
  onWindSpeedUnitChange
}: SettingsMenuProps) {
  return (
    <div
      className={`
        absolute top-[50px] right-0 min-w-[250px] rounded-xl p-4 shadow-lg z-30
        border
        ${darkMode
          ? 'bg-gray-700 border-gray-600'
          : 'bg-primary border-gray-200'
        }
      `}
    >
      <h3 className={`text-base font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Settings
      </h3>

      {/* Dark Mode Toggle */}
      <div
        className={`
          flex items-center justify-between py-3 border-b
          ${darkMode ? 'border-gray-600' : 'border-gray-200'}
        `}
      >
        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Dark Mode
        </span>
        <button
          onClick={onDarkModeToggle}
          className={`
            w-12 h-[26px] rounded-full border-none cursor-pointer relative
            transition-colors duration-200
            ${darkMode ? 'bg-blue-500' : 'bg-gray-300'}
          `}
        >
          <div
            className={`
              w-[22px] h-[22px] rounded-full bg-white absolute top-0.5
              transition-all duration-200 shadow-md
              ${darkMode ? 'left-6' : 'left-0.5'}
            `}
          />
        </button>
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
                  ? 'bg-blue-500 text-white'
                  : darkMode
                    ? 'bg-gray-600 text-gray-300'
                    : 'bg-gray-100 text-gray-600'
                }
              `}
            >
              °{unit}
            </button>
          ))}
        </div>
      </div>

      {/* Wind Speed Unit */}
      <div className="pt-3">
        <div className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Wind Speed
        </div>
        <div className="flex gap-2">
          {[
            { value: 'ms', label: 'm/s' },
            { value: 'kmh', label: 'km/h' },
            { value: 'mph', label: 'mph' }
          ].map((unit) => (
            <button
              key={unit.value}
              onClick={() => onWindSpeedUnitChange(unit.value as 'ms' | 'kmh' | 'mph')}
              className={`
                flex-1 py-1.5 px-2 rounded-md border-none cursor-pointer
                text-xs font-medium transition-all duration-200
                ${windSpeedUnit === unit.value
                  ? 'bg-blue-500 text-white'
                  : darkMode
                    ? 'bg-gray-600 text-gray-300'
                    : 'bg-gray-100 text-gray-600'
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
