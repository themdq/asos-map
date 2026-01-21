import { useState, useEffect, useCallback, useRef } from 'react';

export type SortOption = 'name' | 'distance' | 'network' | 'elevation' | 'favorites';

export interface WeatherSettings {
  darkMode: boolean;
  mapMode: '2d' | '3d';
  temperatureUnit: 'C' | 'F';
  windSpeedUnit: 'kts' | 'mph';
  pressureUnit: 'mb' | 'inHg';
  precipitationUnit: 'mm' | 'in';
  sortBy: SortOption;
  favoriteStations: Set<string>;
}

interface UseWeatherSettingsReturn extends WeatherSettings {
  isHydrated: boolean;
  userLocation: { lat: number; lng: number } | null;
  setDarkMode: (value: boolean) => void;
  setMapMode: (value: '2d' | '3d') => void;
  setTemperatureUnit: (value: 'C' | 'F') => void;
  setWindSpeedUnit: (value: 'kts' | 'mph') => void;
  setPressureUnit: (value: 'mb' | 'inHg') => void;
  setPrecipitationUnit: (value: 'mm' | 'in') => void;
  setSortBy: (value: SortOption) => void;
  toggleFavorite: (stationId: string) => void;
}

const STORAGE_KEYS = {
  darkMode: 'darkMode',
  mapMode: 'mapMode',
  temperatureUnit: 'temperatureUnit',
  windSpeedUnit: 'windSpeedUnit',
  pressureUnit: 'pressureUnit',
  precipitationUnit: 'precipitationUnit',
  sortBy: 'sortBy',
  favoriteStations: 'favoriteStations',
} as const;

const DEFAULT_SETTINGS: WeatherSettings = {
  darkMode: false,
  mapMode: '2d',
  temperatureUnit: 'F',
  windSpeedUnit: 'kts',
  pressureUnit: 'mb',
  precipitationUnit: 'mm',
  sortBy: 'name',
  favoriteStations: new Set(),
};

export function useWeatherSettings(): UseWeatherSettingsReturn {
  const [settings, setSettings] = useState<WeatherSettings>(DEFAULT_SETTINGS);
  const [isHydrated, setIsHydrated] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load settings from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem(STORAGE_KEYS.darkMode);
    const savedMapMode = localStorage.getItem(STORAGE_KEYS.mapMode) as '2d' | '3d' | null;
    const savedTempUnit = localStorage.getItem(STORAGE_KEYS.temperatureUnit) as 'C' | 'F' | null;
    const savedWindUnit = localStorage.getItem(STORAGE_KEYS.windSpeedUnit) as 'kts' | 'mph' | null;
    const savedPressureUnit = localStorage.getItem(STORAGE_KEYS.pressureUnit) as 'mb' | 'inHg' | null;
    const savedPrecipUnit = localStorage.getItem(STORAGE_KEYS.precipitationUnit) as 'mm' | 'in' | null;
    const savedSortBy = localStorage.getItem(STORAGE_KEYS.sortBy) as SortOption | null;
    const savedFavorites = localStorage.getItem(STORAGE_KEYS.favoriteStations);

    setSettings({
      darkMode: savedDarkMode === 'true',
      mapMode: savedMapMode || DEFAULT_SETTINGS.mapMode,
      temperatureUnit: savedTempUnit || DEFAULT_SETTINGS.temperatureUnit,
      windSpeedUnit: savedWindUnit || DEFAULT_SETTINGS.windSpeedUnit,
      pressureUnit: savedPressureUnit || DEFAULT_SETTINGS.pressureUnit,
      precipitationUnit: savedPrecipUnit || DEFAULT_SETTINGS.precipitationUnit,
      sortBy: savedSortBy || DEFAULT_SETTINGS.sortBy,
      favoriteStations: savedFavorites ? new Set(JSON.parse(savedFavorites)) : new Set(),
    });

    // Get geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {
          if (savedSortBy === 'distance') {
            setSettings(prev => ({ ...prev, sortBy: 'name' }));
          }
        }
      );
    } else if (savedSortBy === 'distance') {
      setSettings(prev => ({ ...prev, sortBy: 'name' }));
    }

    setIsHydrated(true);
  }, []);

  // Sync dark mode class on document
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Debounced save to localStorage
  useEffect(() => {
    if (!isHydrated) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEYS.darkMode, String(settings.darkMode));
      localStorage.setItem(STORAGE_KEYS.mapMode, settings.mapMode);
      localStorage.setItem(STORAGE_KEYS.temperatureUnit, settings.temperatureUnit);
      localStorage.setItem(STORAGE_KEYS.windSpeedUnit, settings.windSpeedUnit);
      localStorage.setItem(STORAGE_KEYS.pressureUnit, settings.pressureUnit);
      localStorage.setItem(STORAGE_KEYS.precipitationUnit, settings.precipitationUnit);
      localStorage.setItem(STORAGE_KEYS.sortBy, settings.sortBy);
      localStorage.setItem(STORAGE_KEYS.favoriteStations, JSON.stringify([...settings.favoriteStations]));
    }, 200);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [isHydrated, settings]);

  const setDarkMode = useCallback((value: boolean) => {
    setSettings(prev => ({ ...prev, darkMode: value }));
  }, []);

  const setMapMode = useCallback((value: '2d' | '3d') => {
    setSettings(prev => ({ ...prev, mapMode: value }));
  }, []);

  const setTemperatureUnit = useCallback((value: 'C' | 'F') => {
    setSettings(prev => ({ ...prev, temperatureUnit: value }));
  }, []);

  const setWindSpeedUnit = useCallback((value: 'kts' | 'mph') => {
    setSettings(prev => ({ ...prev, windSpeedUnit: value }));
  }, []);

  const setPressureUnit = useCallback((value: 'mb' | 'inHg') => {
    setSettings(prev => ({ ...prev, pressureUnit: value }));
  }, []);

  const setPrecipitationUnit = useCallback((value: 'mm' | 'in') => {
    setSettings(prev => ({ ...prev, precipitationUnit: value }));
  }, []);

  const setSortBy = useCallback((value: SortOption) => {
    setSettings(prev => ({ ...prev, sortBy: value }));
  }, []);

  const toggleFavorite = useCallback((stationId: string) => {
    setSettings(prev => {
      const next = new Set(prev.favoriteStations);
      if (next.has(stationId)) {
        next.delete(stationId);
      } else {
        next.add(stationId);
      }
      return { ...prev, favoriteStations: next };
    });
  }, []);

  return {
    ...settings,
    isHydrated,
    userLocation,
    setDarkMode,
    setMapMode,
    setTemperatureUnit,
    setWindSpeedUnit,
    setPressureUnit,
    setPrecipitationUnit,
    setSortBy,
    toggleFavorite,
  };
}
