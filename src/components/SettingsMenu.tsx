import { Sun, Moon } from 'lucide-react';
import { ToggleGroup } from './ToggleGroup';

interface SettingsMenuProps {
  darkMode: boolean;
  mapMode: '2d' | '3d';
  temperatureUnit: 'C' | 'F';
  windSpeedUnit: 'kts' | 'mph';
  pressureUnit: 'mb' | 'inHg';
  precipitationUnit: 'mm' | 'in';
  onDarkModeToggle: () => void;
  onMapModeChange: (mode: '2d' | '3d') => void;
  onTemperatureUnitChange: (unit: 'C' | 'F') => void;
  onWindSpeedUnitChange: (unit: 'kts' | 'mph') => void;
  onPressureUnitChange: (unit: 'mb' | 'inHg') => void;
  onPrecipitationUnitChange: (unit: 'mm' | 'in') => void;
}

export default function SettingsMenu({
  darkMode,
  mapMode,
  temperatureUnit,
  windSpeedUnit,
  pressureUnit,
  precipitationUnit,
  onDarkModeToggle,
  onMapModeChange,
  onTemperatureUnitChange,
  onWindSpeedUnitChange,
  onPressureUnitChange,
  onPrecipitationUnitChange,
}: SettingsMenuProps) {
  return (
    <div className="w-full">
      <ToggleGroup
        label="Theme"
        options={[
          { value: 'light', label: <Sun className="w-4 h-4 mx-auto" /> },
          { value: 'dark', label: <Moon className="w-4 h-4 mx-auto" /> },
        ]}
        value={darkMode ? 'dark' : 'light'}
        onChange={(v) => v === 'dark' !== darkMode && onDarkModeToggle()}
      />

      <ToggleGroup
        label="Map"
        options={[
          { value: '2d', label: '2D' },
          { value: '3d', label: '3D' },
        ]}
        value={mapMode}
        onChange={onMapModeChange}
      />

      <ToggleGroup
        label="Temperature"
        options={[
          { value: 'C', label: '°C' },
          { value: 'F', label: '°F' },
        ]}
        value={temperatureUnit}
        onChange={onTemperatureUnitChange}
      />

      <ToggleGroup
        label="Wind"
        options={[
          { value: 'kts', label: 'kts' },
          { value: 'mph', label: 'mph' },
        ]}
        value={windSpeedUnit}
        onChange={onWindSpeedUnitChange}
      />

      <ToggleGroup
        label="Pressure"
        options={[
          { value: 'mb', label: 'mb' },
          { value: 'inHg', label: 'inHg' },
        ]}
        value={pressureUnit}
        onChange={onPressureUnitChange}
      />

      <ToggleGroup
        label="Precip"
        options={[
          { value: 'mm', label: 'mm' },
          { value: 'in', label: 'in' },
        ]}
        value={precipitationUnit}
        onChange={onPrecipitationUnitChange}
        showBorder={false}
      />
    </div>
  );
}
