import { useState, useEffect, useRef } from 'react';
import type { Station } from '../types/station';
import type { WeatherPoint } from '../types/weather';
import { fetchStations } from '../api/stations';
import { fetchHistoricalWeather } from '../api/weather';
import Sidebar from './Sidebar';
import MapContainer, { type MapRef } from './MapContainer';
import WeatherCard from './WeatherCard';

export default function WeatherStationsMap() {
  const mapRef = useRef<MapRef>(null);

  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherPoint[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [temperatureUnit, setTemperatureUnit] = useState<'C' | 'F'>('C');
  const [windSpeedUnit, setWindSpeedUnit] = useState<'ms' | 'kmh' | 'mph'>('ms');

  useEffect(() => {
    setMapboxToken('pk.eyJ1IjoidGhlbWRxIiwiYSI6ImNta2tkeXJzdDFkNjYzZ29tMmp4NTF1ejUifQ.fctCq2IYRLfdCr8W1b5Kew');
  });

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-settings-menu]')) {
          setSettingsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [settingsOpen]);

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

  const handleStationClick = async (station: Station) => {
    setSelectedStation(station);
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
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100%',
      backgroundColor: darkMode ? '#1f2937' : '#EFF5E8',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative',
      transition: 'background-color 0.3s ease'
    }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '400px' : '0',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        flexShrink: 0
      }}>
        <Sidebar
          stations={stations}
          loading={loading}
          searchQuery={searchQuery}
          selectedStation={selectedStation}
          onSearchChange={setSearchQuery}
          onStationClick={handleStationClick}
        />
      </div>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Top Bar with Controls */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          right: '16px',
          zIndex: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'start',
          pointerEvents: 'none'
        }}>
          {/* Left Side: Menu Button, Search Bar, and Weather Card */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            pointerEvents: 'auto'
          }}>
            {/* Menu Button and Search Bar */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  backgroundColor: darkMode ? '#374151' : 'white',
                  border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '8px',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s',
                  color: darkMode ? 'white' : '#1f2937'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = darkMode ? '#4b5563' : '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = darkMode ? '#374151' : 'white';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>

              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '16px'
                }}>🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Stations Search..."
                  style={{
                    width: '300px',
                    padding: '10px 10px 10px 35px',
                    backgroundColor: darkMode ? '#374151' : 'white',
                    border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    outline: 'none',
                    color: darkMode ? 'white' : '#1f2937'
                  }}
                />
              </div>
            </div>

            {/* Weather Card */}
            {selectedStation && (
              <div style={{ maxWidth: '400px' }}>
                <WeatherCard
                  stationName={selectedStation.station_name}
                  weatherData={weatherData}
                  loading={weatherLoading}
                />
              </div>
            )}
          </div>

          {/* Right Side: Settings Button */}
          <div style={{ position: 'relative', pointerEvents: 'auto' }} data-settings-menu>
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              style={{
                backgroundColor: darkMode ? '#374151' : 'white',
                border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                borderRadius: '8px',
                padding: '10px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s',
                color: darkMode ? 'white' : '#1f2937'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = darkMode ? '#4b5563' : '#f9fafb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = darkMode ? '#374151' : 'white';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3M19.07 4.93l-4.24 4.24m-5.66 5.66l-4.24 4.24M4.93 19.07l4.24-4.24m5.66-5.66l4.24-4.24"></path>
              </svg>
            </button>

            {/* Settings Menu */}
            {settingsOpen && (
              <div style={{
                position: 'absolute',
                top: '50px',
                right: '0',
                backgroundColor: darkMode ? '#374151' : 'white',
                border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                minWidth: '250px',
                zIndex: 30
              }}>
                <h3 style={{
                  margin: '0 0 12px 0',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: darkMode ? 'white' : '#1f2937'
                }}>
                  Settings
                </h3>

                {/* Dark Mode Toggle */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`
                }}>
                  <span style={{
                    fontSize: '14px',
                    color: darkMode ? '#d1d5db' : '#4b5563'
                  }}>Dark Mode</span>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    style={{
                      width: '48px',
                      height: '26px',
                      borderRadius: '13px',
                      backgroundColor: darkMode ? '#3b82f6' : '#d1d5db',
                      border: 'none',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      position: 'absolute',
                      top: '2px',
                      left: darkMode ? '24px' : '2px',
                      transition: 'left 0.2s',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} />
                  </button>
                </div>

                {/* Temperature Unit */}
                <div style={{
                  padding: '12px 0',
                  borderBottom: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`
                }}>
                  <div style={{
                    fontSize: '14px',
                    color: darkMode ? '#d1d5db' : '#4b5563',
                    marginBottom: '8px'
                  }}>Temperature</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {(['C', 'F'] as const).map((unit) => (
                      <button
                        key={unit}
                        onClick={() => setTemperatureUnit(unit)}
                        style={{
                          flex: 1,
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: temperatureUnit === unit
                            ? '#3b82f6'
                            : (darkMode ? '#4b5563' : '#f3f4f6'),
                          color: temperatureUnit === unit
                            ? 'white'
                            : (darkMode ? '#d1d5db' : '#6b7280'),
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500',
                          transition: 'all 0.2s'
                        }}
                      >
                        °{unit}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Wind Speed Unit */}
                <div style={{ padding: '12px 0 0 0' }}>
                  <div style={{
                    fontSize: '14px',
                    color: darkMode ? '#d1d5db' : '#4b5563',
                    marginBottom: '8px'
                  }}>Wind Speed</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                      { value: 'ms', label: 'm/s' },
                      { value: 'kmh', label: 'km/h' },
                      { value: 'mph', label: 'mph' }
                    ].map((unit) => (
                      <button
                        key={unit.value}
                        onClick={() => setWindSpeedUnit(unit.value as 'ms' | 'kmh' | 'mph')}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: windSpeedUnit === unit.value
                            ? '#3b82f6'
                            : (darkMode ? '#4b5563' : '#f3f4f6'),
                          color: windSpeedUnit === unit.value
                            ? 'white'
                            : (darkMode ? '#d1d5db' : '#6b7280'),
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500',
                          transition: 'all 0.2s'
                        }}
                      >
                        {unit.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Map Container */}
        <MapContainer
          ref={mapRef}
          stations={stations}
          mapboxToken={mapboxToken}
          scriptLoaded={scriptLoaded}
          onStationSelect={handleStationClick}
        />
      </div>
    </div>
  );
}