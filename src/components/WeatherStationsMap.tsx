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
      backgroundColor: '#0a0a0a',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <Sidebar
        stations={stations}
        loading={loading}
        searchQuery={searchQuery}
        selectedStation={selectedStation}
        onSearchChange={setSearchQuery}
        onStationClick={handleStationClick}
      />
      <MapContainer
        ref={mapRef}
        stations={stations}
        mapboxToken={mapboxToken}
        scriptLoaded={scriptLoaded}
        onStationSelect={handleStationClick}
      />
      {selectedStation && (
        <WeatherCard
          stationName={selectedStation.station_name}
          weatherData={weatherData}
          loading={weatherLoading}
        />
      )}
    </div>
  );
}