import { useState, useEffect, useRef } from 'react';
import { Plus, Minus, LocateFixed } from 'lucide-react';
import type { Station } from '../types/station';
import type { WeatherPoint } from '../types/weather';
import { fetchStations } from '../api/stations';
import { fetchHistoricalWeather } from '../api/weather';
import Sidebar from './Sidebar';
import MapContainer, { type MapRef } from './MapContainer';
import WeatherCard from './WeatherCard';
import SearchBar from './SearchBar';
import MenuButton from './MenuButton';
import SettingsMenu from './SettingsMenu';

export default function WeatherStationsMap() {
  const mapRef = useRef<MapRef>(null);

  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const mapboxToken = import.meta.env.PUBLIC_MAPBOX_TOKEN;
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherPoint[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [temperatureUnit, setTemperatureUnit] = useState<'C' | 'F'>('F');
  const [windSpeedUnit, setWindSpeedUnit] = useState<'kts' | 'mph'>('kts');
  const [pressureUnit, setPressureUnit] = useState<'mb' | 'hPa'>('mb');
  const [precipitationUnit, setPrecipitationUnit] = useState<'mm' | 'in'>('mm');
  const [favoriteStations, setFavoriteStations] = useState<Set<string>>(new Set());


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

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      setLoading(true);
      const data = await fetchStations();
      setStations(data);
    } catch (error) {
      console.error('Error loading stations:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleStationClick = async (station: Station | null) => {
    setSelectedStation(station);

    if (!station) {
      setWeatherData([]);
      return;
    }

    if (mapRef.current?.flyToStation) {
      mapRef.current.flyToStation(station);
    }

    // Загружаем погодные данные для выбранной станции
    try {
      setWeatherLoading(true);
      const data = await fetchHistoricalWeather(station.station_id);
      setWeatherData(data.points);
    } catch (error) {
      console.error('Error loading weather data:', error);
      setWeatherData([]);
    } finally {
      setWeatherLoading(false);
    }
  };

  return (
    <div
      className={`
        relative h-screen w-full font-sans transition-colors duration-300
        ${darkMode ? 'bg-gray-800' : 'bg-[#EFF5E8]'}
      `}
    >
      {/* Sidebar Overlay */}
      <div
        data-sidebar
        className={`
          absolute left-0 top-0 h-full z-30 transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ width: '400px' }}
      >
        <Sidebar
          stations={stations}
          loading={loading}
          searchQuery={searchQuery}
          selectedStation={selectedStation}
          favoriteStations={favoriteStations}
          precipitationUnit={precipitationUnit}
          onSearchChange={setSearchQuery}
          onStationClick={handleStationClick}
          onToggleFavorite={handleToggleFavorite}
          onLogoClick={handleLogoClick}
        />
      </div>

      {/* Main Content Area */}
      <div className="relative w-full h-full overflow-hidden">
        {/* Top Bar with Controls */}
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start pointer-events-none">
          {/* Left Side: Menu Button, Search Bar, and Weather Card */}
          <div
            className={`
              flex flex-col gap-3 pointer-events-auto w-72 transition-transform duration-300
              ${sidebarOpen ? 'translate-x-[400px]' : 'translate-x-0'}
            `}
          >
            {/* Menu Button and Search Bar */}
            <div className="flex gap-2 items-center">
              <MenuButton
                onClick={() => setSidebarOpen(!sidebarOpen)}
                darkMode={darkMode}
                icon="panel_left"
              />
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                darkMode={darkMode}
              />
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
                />
              </div>
            )}
          </div>

          {/* Right Side: Settings Button */}
          <div className="relative pointer-events-auto" data-settings-menu>
            <MenuButton
              onClick={() => setSettingsOpen(!settingsOpen)}
              darkMode={darkMode}
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
            className={`
              flex items-center justify-center rounded-[5px] p-2.5
              border shadow-md transition-all duration-200 cursor-pointer
              ${darkMode
                ? 'bg-gray-700 border-gray-600 text-white hover:bg-secondary-foreground'
                : 'bg-primary border-gray-200 text-graphit hover:bg-secondary-foreground hover:text-white'
              }
            `}
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={() => mapRef.current?.zoomOut()}
            className={`
              flex items-center justify-center rounded-[5px] p-2.5
              border shadow-md transition-all duration-200 cursor-pointer
              ${darkMode
                ? 'bg-gray-700 border-gray-600 text-white hover:bg-secondary-foreground'
                : 'bg-primary border-gray-200 text-graphit hover:bg-secondary-foreground hover:text-white'
              }
            `}
          >
            <Minus className="w-5 h-5" />
          </button>
          <button
            onClick={() => mapRef.current?.geolocate()}
            className={`
              flex items-center justify-center rounded-[5px] p-2.5
              border shadow-md transition-all duration-200 cursor-pointer
              ${darkMode
                ? 'bg-gray-700 border-gray-600 text-white hover:bg-secondary-foreground'
                : 'bg-primary border-gray-200 text-graphit hover:bg-secondary-foreground hover:text-white'
              }
            `}
          >
            <LocateFixed className="w-5 h-5" />
          </button>
        </div>

        {/* Map Container */}
        <MapContainer
          ref={mapRef}
          stations={stations}
          selectedStation={selectedStation}
          mapboxToken={mapboxToken}
          scriptLoaded={scriptLoaded}
          onStationSelect={handleStationClick}
        />
      </div>
    </div>
  );
}
