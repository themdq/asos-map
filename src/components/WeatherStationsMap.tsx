import React, { useState, useEffect, useRef } from 'react';
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

  useEffect(() => {
    setMapboxToken('pk.eyJ1IjoidGhlbWRxIiwiYSI6ImNta2tkeXJzdDFkNjYzZ29tMmp4NTF1ejUifQ.fctCq2IYRLfdCr8W1b5Kew');
  });

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
      backgroundColor: '#EFF5E8',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative'
    }}>
      {/* Sidebar */}
      <div style={{
        position: 'absolute',
        left: sidebarOpen ? '0' : '-400px',
        top: 0,
        bottom: 0,
        width: '400px',
        transition: 'left 0.3s ease',
        zIndex: 10
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

      {/* Top Bar with Controls */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Menu Button and Search Bar */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '10px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
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
              placeholder="Поиск станций..."
              style={{
                width: '300px',
                padding: '10px 10px 10px 35px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                outline: 'none'
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

      {/* Map Container */}
      <MapContainer
        ref={mapRef}
        stations={stations}
        mapboxToken={mapboxToken}
        scriptLoaded={scriptLoaded}
        onStationSelect={handleStationClick}
      />
    </div>
  );
}