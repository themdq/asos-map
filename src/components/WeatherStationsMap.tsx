import { useState, useEffect, useRef } from 'react';
import { Plus, Minus, LocateFixed } from 'lucide-react';
import type { Station } from '../types/station';
import { useStationsQuery } from '../hooks/useStationsQuery';
import { useHistoricalQuery } from '../hooks/useHistoricalQuery';
import { useWeatherSettings } from '../hooks/useWeatherSettings';
import Sidebar from './Sidebar';
import MapContainer, { type MapRef } from './MapContainer';
import WeatherCard from './WeatherCard';
import SearchBar from './SearchBar';
import MenuButton from './MenuButton';
import SettingsMenu from './SettingsMenu';

export default function WeatherStationsMap() {
  const mapRef = useRef<MapRef>(null);
  const mapboxToken = import.meta.env.PUBLIC_MAPBOX_TOKEN;

  // Consolidated settings from hook
  const {
    darkMode,
    mapMode,
    temperatureUnit,
    windSpeedUnit,
    pressureUnit,
    precipitationUnit,
    sortBy,
    favoriteStations,
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
  } = useWeatherSettings();

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Open sidebar on search
  useEffect(() => {
    if (searchQuery.length > 0) {
      setSidebarOpen(true);
    }
  }, [searchQuery]);

  // Data queries
  const { data: stations = [], isLoading: loading } = useStationsQuery();
  const { data: weatherResponse, isLoading: weatherLoading } = useHistoricalQuery(
    selectedStation?.station_id
  );
  const weatherData = weatherResponse?.points ?? [];

  // Close settings on outside click
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

  // Load Mapbox script
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
    mapRef.current?.flyTo(-122.14, 37.44, 12);
  };

  const handleStationClick = (station: Station | null) => {
    setSelectedStation(station);
    if (station) {
      mapRef.current?.flyToStation(station);
    }
  };

  return (
    <div className={`relative h-screen w-full font-sans bg-primary ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <div
        data-sidebar
        className={`absolute left-0 top-0 h-full z-30 transition-transform duration-300 w-full md:w-[400px] ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
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
          onToggleFavorite={toggleFavorite}
          onSortChange={setSortBy}
          onLogoClick={handleLogoClick}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className="relative w-full h-full overflow-hidden">
        {/* Top Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start pointer-events-none">
          {/* Left: Menu, Search, Weather Card */}
          <div
            className={`flex flex-col gap-3 pointer-events-auto w-72 transition-all duration-300 ${
              sidebarOpen
                ? 'md:translate-x-[400px] max-md:opacity-0 max-md:pointer-events-none'
                : 'translate-x-0'
            }`}
          >
            <div className="flex gap-2 items-center w-full">
              <MenuButton
                onClick={() => setSidebarOpen(!sidebarOpen)}
                icon="panel_left"
                isExpanded={sidebarOpen}
              />
              <div className="hidden md:flex flex-1">
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
              </div>
            </div>

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
                  onToggleFavorite={toggleFavorite}
                />
              </div>
            )}
          </div>

          {/* Right: Settings */}
          <div className="relative pointer-events-auto" data-settings-menu>
            <MenuButton
              onClick={() => setSettingsOpen(!settingsOpen)}
              icon="settings"
              isExpanded={settingsOpen}
            >
              <SettingsMenu
                darkMode={darkMode}
                mapMode={mapMode}
                temperatureUnit={temperatureUnit}
                windSpeedUnit={windSpeedUnit}
                pressureUnit={pressureUnit}
                precipitationUnit={precipitationUnit}
                onDarkModeToggle={() => setDarkMode(!darkMode)}
                onMapModeChange={setMapMode}
                onTemperatureUnitChange={setTemperatureUnit}
                onWindSpeedUnitChange={setWindSpeedUnit}
                onPressureUnitChange={setPressureUnit}
                onPrecipitationUnitChange={setPrecipitationUnit}
              />
            </MenuButton>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute right-4 z-20 flex flex-col gap-2 pointer-events-auto bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-4">
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

        {/* Map */}
        <MapContainer
          ref={mapRef}
          stations={stations}
          selectedStation={selectedStation}
          favoriteStations={favoriteStations}
          darkMode={darkMode}
          mapMode={mapMode}
          mapboxToken={mapboxToken}
          scriptLoaded={scriptLoaded}
          isHydrated={isHydrated}
          onStationSelect={handleStationClick}
        />
      </div>
    </div>
  );
}
