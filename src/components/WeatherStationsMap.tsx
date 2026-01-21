import { useState, useEffect, useRef } from 'react';
import { Plus, Minus, LocateFixed } from 'lucide-react';
import type { Station } from '../types/station';
import { useStationsQuery } from '../hooks/useStationsQuery';
import { useHistoricalQuery } from '../hooks/useHistoricalQuery';

export type SortOption = 'name' | 'distance' | 'network' | 'elevation' | 'favorites';
import Sidebar from './Sidebar';
import MapContainer, { type MapRef } from './MapContainer';
import WeatherCard from './WeatherCard';
import SearchBar from './SearchBar';
import MenuButton from './MenuButton';
import SettingsMenu from './SettingsMenu';

export default function WeatherStationsMap() {
  const mapRef = useRef<MapRef>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const mapboxToken = import.meta.env.PUBLIC_MAPBOX_TOKEN;
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Настройки с дефолтными значениями
  const [darkMode, setDarkMode] = useState(false);
  const [temperatureUnit, setTemperatureUnit] = useState<'C' | 'F'>('F');
  const [windSpeedUnit, setWindSpeedUnit] = useState<'kts' | 'mph'>('kts');
  const [pressureUnit, setPressureUnit] = useState<'mb' | 'inHg'>('mb');
  const [precipitationUnit, setPrecipitationUnit] = useState<'mm' | 'in'>('mm');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [favoriteStations, setFavoriteStations] = useState<Set<string>>(new Set());

  // Загружаем настройки из localStorage после монтирования
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    const savedTempUnit = localStorage.getItem('temperatureUnit') as 'C' | 'F';
    const savedWindUnit = localStorage.getItem('windSpeedUnit') as 'kts' | 'mph';
    const savedPressureUnit = localStorage.getItem('pressureUnit') as 'mb' | 'inHg';
    const savedPrecipUnit = localStorage.getItem('precipitationUnit') as 'mm' | 'in';
    const savedFavorites = localStorage.getItem('favoriteStations');

    if (savedDarkMode !== null) setDarkMode(savedDarkMode === 'true');
    if (savedTempUnit) setTemperatureUnit(savedTempUnit);
    if (savedWindUnit) setWindSpeedUnit(savedWindUnit);
    if (savedPressureUnit) setPressureUnit(savedPressureUnit);
    if (savedPrecipUnit) setPrecipitationUnit(savedPrecipUnit);
    if (savedFavorites) setFavoriteStations(new Set(JSON.parse(savedFavorites)));

    const savedSortBy = localStorage.getItem('sortBy') as SortOption;
    if (savedSortBy) setSortBy(savedSortBy);

    // Получаем геолокацию для сортировки по расстоянию
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {
          // Геолокация недоступна — сбрасываем сортировку по расстоянию
          if (savedSortBy === 'distance') {
            setSortBy('name');
          }
        }
      );
    } else if (savedSortBy === 'distance') {
      // Геолокация не поддерживается — сбрасываем сортировку
      setSortBy('name');
    }

    setIsHydrated(true);
  }, []);

  // Синхронизируем класс dark на html элементе
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Сохраняем настройки в localStorage (только после гидратации)
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem('darkMode', String(darkMode));
    localStorage.setItem('temperatureUnit', temperatureUnit);
    localStorage.setItem('windSpeedUnit', windSpeedUnit);
    localStorage.setItem('pressureUnit', pressureUnit);
    localStorage.setItem('precipitationUnit', precipitationUnit);
    localStorage.setItem('sortBy', sortBy);
    localStorage.setItem('favoriteStations', JSON.stringify([...favoriteStations]));
  }, [isHydrated, darkMode, temperatureUnit, windSpeedUnit, pressureUnit, precipitationUnit, sortBy, favoriteStations]);

  // Открываем sidebar при поисковом запросе
  useEffect(() => {
    if (searchQuery.length > 0) {
      setSidebarOpen(true);
    }
  }, [searchQuery]);

  // Кэшированные запросы
  const { data: stations = [], isLoading: loading } = useStationsQuery();
  const { data: weatherResponse, isLoading: weatherLoading } = useHistoricalQuery(selectedStation?.station_id);
  const weatherData = weatherResponse?.points ?? [];


  // Close settings menu and weather card when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (settingsOpen && !target.closest('[data-settings-menu]')) {
        setSettingsOpen(false);
      }

      if (selectedStation && target.closest('[data-map]')) {
        setSelectedStation(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [settingsOpen, selectedStation]);

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.body.style.overflow = 'hidden';

    const link = document.createElement('link');
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  const handleLogoClick = () => {
    setSelectedStation(null);
    if (mapRef.current?.flyTo) {
      mapRef.current.flyTo(-122.14, 37.44, 12);
    }
  };

  const handleToggleFavorite = (stationId: string) => {
    setFavoriteStations(prev => {
      const next = new Set(prev);
      if (next.has(stationId)) {
        next.delete(stationId);
      } else {
        next.add(stationId);
      }
      return next;
    });
  };

  const handleStationClick = (station: Station | null) => {
    setSelectedStation(station);

    if (station && mapRef.current?.flyToStation) {
      mapRef.current.flyToStation(station);
    }
  };

  return (
    <div
      className={`
        relative h-screen w-full font-sans bg-primary
        ${darkMode ? 'dark' : ''}
      `}
    >
      {/* Sidebar Overlay */}
      <div
        data-sidebar
        className={`
          absolute left-0 top-0 h-full z-30 transition-transform duration-300
          w-full md:w-[400px]
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar
          stations={stations}
          loading={loading}
          searchQuery={searchQuery}
          selectedStation={selectedStation}
          favoriteStations={favoriteStations}
          precipitationUnit={precipitationUnit}
          sortBy={sortBy}
          userLocation={userLocation}
          darkMode={darkMode}
          onSearchChange={setSearchQuery}
          onStationClick={handleStationClick}
          onToggleFavorite={handleToggleFavorite}
          onSortChange={setSortBy}
          onLogoClick={handleLogoClick}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main Content Area */}
      <div className="relative w-full h-full overflow-hidden">
        {/* Top Bar with Controls */}
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start pointer-events-none">
          {/* Left Side: Menu Button, Search Bar, and Weather Card */}
          <div
            className={`
              flex flex-col gap-3 pointer-events-auto w-72 transition-all duration-300
              ${sidebarOpen ? 'md:translate-x-[400px] max-md:opacity-0 max-md:pointer-events-none' : 'translate-x-0'}
            `}
          >
            {/* Menu Button and Search Bar */}
            <div className="flex gap-2 items-center w-full">
              <MenuButton
                onClick={() => setSidebarOpen(!sidebarOpen)}
                icon="panel_left"
                isExpanded={sidebarOpen}
              />
              {/* SearchBar — скрыт на мобильных, там он в sidebar */}
              <div className="hidden md:flex flex-1">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
              </div>
            </div>

            {/* Weather Card */}
            {selectedStation && (
              <div data-weather-card>
                <WeatherCard
                  stationName={selectedStation.station_name}
                  stationId={selectedStation.station_id}
                  latitude={selectedStation.latitude}
                  longitude={selectedStation.longitude}
                  elevation={selectedStation.elevation}
                  timezone={selectedStation.timezone}
                  network={selectedStation.station_network}
                  weatherData={weatherData}
                  loading={weatherLoading}
                  temperatureUnit={temperatureUnit}
                  windSpeedUnit={windSpeedUnit}
                  pressureUnit={pressureUnit}
                  precipitationUnit={precipitationUnit}
                  isFavorite={favoriteStations.has(selectedStation.station_id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              </div>
            )}
          </div>

          {/* Right Side: Settings Button */}
          <div className="relative pointer-events-auto" data-settings-menu>
            <MenuButton
              onClick={() => setSettingsOpen(!settingsOpen)}
              icon="settings"
              isExpanded={settingsOpen}
            >
              <SettingsMenu
                darkMode={darkMode}
                temperatureUnit={temperatureUnit}
                windSpeedUnit={windSpeedUnit}
                pressureUnit={pressureUnit}
                precipitationUnit={precipitationUnit}
                onDarkModeToggle={() => setDarkMode(!darkMode)}
                onTemperatureUnitChange={setTemperatureUnit}
                onWindSpeedUnitChange={setWindSpeedUnit}
                onPressureUnitChange={setPressureUnit}
                onPrecipitationUnitChange={setPrecipitationUnit}
              />
            </MenuButton>
          </div>
        </div>

        {/* Map Controls - Bottom Right */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2 pointer-events-auto">
          <button
            onClick={() => mapRef.current?.zoomIn()}
            className="flex items-center justify-center rounded-[5px] p-2.5 bg-primary border border-border shadow-md transition-all duration-200 cursor-pointer text-graphit hover:bg-secondary-foreground hover:text-white"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={() => mapRef.current?.zoomOut()}
            className="flex items-center justify-center rounded-[5px] p-2.5 bg-primary border border-border shadow-md transition-all duration-200 cursor-pointer text-graphit hover:bg-secondary-foreground hover:text-white"
          >
            <Minus className="w-5 h-5" />
          </button>
          <button
            onClick={() => mapRef.current?.geolocate()}
            className="flex items-center justify-center rounded-[5px] p-2.5 bg-primary border border-border shadow-md transition-all duration-200 cursor-pointer text-graphit hover:bg-secondary-foreground hover:text-white"
          >
            <LocateFixed className="w-5 h-5" />
          </button>
        </div>

        {/* Map Container */}
        <MapContainer
          ref={mapRef}
          stations={stations}
          selectedStation={selectedStation}
          favoriteStations={favoriteStations}
          darkMode={darkMode}
          mapboxToken={mapboxToken}
          scriptLoaded={scriptLoaded}
          isHydrated={isHydrated}
          onStationSelect={handleStationClick}
        />
      </div>
    </div>
  );
}
