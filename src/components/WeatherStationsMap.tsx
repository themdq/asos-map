import React, { useState, useEffect, useRef } from 'react';

interface Station {
  station_id: string;
  latitude: number;
  longitude: number;
  elevation: number;
  station_name: string;
  station_network: string;
  timezone: string;
}

export default function WeatherStationsMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    setMapboxToken('pk.eyJ1IjoidGhlbWRxIiwiYSI6ImNta2tkeXJzdDFkNjYzZ29tMmp4NTF1ejUifQ.fctCq2IYRLfdCr8W1b5Kew');
  })

  useEffect(() => {
    // Убираем отступы у body
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.body.style.overflow = 'hidden';

    // Загружаем Mapbox скрипты
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
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      setLoading(true);
      // Замените на ваш API
      // const response = await fetch('YOUR_API_ENDPOINT');
      // const data = await response.json();
      // setStations(data);
      
      setStations([
        {"station_id": "EHAK", "latitude": 55.39917, "longitude": 3.81028, "elevation": 50.0, "station_name": "A12-CPP HELIPAD OIL PLATFORM", "station_network": "NL__ASOS", "timezone": "Europe/London"},
        {"station_id": "EKYT", "latitude": 57.09639, "longitude": 9.85056, "elevation": 3.0, "station_name": "Aalborg", "station_network": "DK__ASOS", "timezone": "Europe/Paris"},
        {"station_id": "EKAH", "latitude": 56.30833, "longitude": 10.62556, "elevation": 25.0, "station_name": "Aarhus", "station_network": "DK__ASOS", "timezone": "Europe/Paris"},
        {"station_id": "OIAA", "latitude": 30.36667, "longitude": 48.25, "elevation": 11.0, "station_name": "Abadan", "station_network": "IR__ASOS", "timezone": "Asia/Tehran"},
        {"station_id": "OISA", "latitude": 31.18333, "longitude": 52.66667, "elevation": 2004.0, "station_name": "ABADEH", "station_network": "IR__ASOS", "timezone": "Asia/Tehran"},
        {"station_id": "UNAA", "latitude": 53.74, "longitude": 91.385, "elevation": 245.0, "station_name": "Abakan", "station_network": "RU__ASOS", "timezone": "Australia/Perth"},
        {"station_id": "LFOI", "latitude": 50.13611, "longitude": 1.83889, "elevation": 68.0, "station_name": "Abbeville", "station_network": "FR__ASOS", "timezone": "Europe/Paris"},
        {"station_id": "OIBS", "latitude": 27.21667, "longitude": 56.36667, "elevation": 20.0, "station_name": "Bandar Abbas", "station_network": "IR__ASOS", "timezone": "Asia/Tehran"},
        {"station_id": "EGAA", "latitude": 54.6575, "longitude": -6.21583, "elevation": 63.0, "station_name": "Belfast Aldergrove", "station_network": "UK__ASOS", "timezone": "Europe/London"},
        {"station_id": "EDDB", "latitude": 52.3667, "longitude": 13.5033, "elevation": 48.0, "station_name": "Berlin-Schönefeld", "station_network": "DE__ASOS", "timezone": "Europe/Berlin"}
      ]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Инициализация карты
  useEffect(() => {
    if (!scriptLoaded || !mapboxToken || map.current || !mapContainer.current) return;

    const mapboxgl = (window as any).mapboxgl;
    if (!mapboxgl) return;

    mapboxgl.accessToken = mapboxToken;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/standard',
        center: [30, 50],
        zoom: 3,
        projection: 'mercator',
      });

      map.current.on('load', () => {
        setMapLoaded(true);
      });

      // Добавляем контролы навигации
      map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    } catch (error) {
      console.error('Map initialization error:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [scriptLoaded, mapboxToken]);

  // Добавление маркеров
  useEffect(() => {
    if (!mapLoaded || !map.current || stations.length === 0) return;

    const mapboxgl = (window as any).mapboxgl;
    if (!mapboxgl) return;

    // Очистка старых маркеров
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Добавление маркеров для каждой станции
    stations.forEach((station) => {
      const el = document.createElement('div');
      el.style.backgroundColor = '#3b82f6';
      el.style.width = '12px';
      el.style.height = '12px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      el.style.transition = 'transform 0.2s';

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.5)';
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: false,
        className: 'custom-popup'
      }).setHTML(`
        <div style="padding: 12px; min-width: 220px; background: #1a1a1a; border-radius: 8px;">
          <h3 style="font-weight: bold; font-size: 14px; margin: 0 0 8px 0; color: white;">${station.station_name}</h3>
          <p style="font-size: 12px; color: #d1d5db; margin: 4px 0;">ID: ${station.station_id}</p>
          <p style="font-size: 12px; color: #d1d5db; margin: 4px 0;">Network: ${station.station_network}</p>
          <p style="font-size: 12px; color: #d1d5db; margin: 4px 0;">Elevation: ${station.elevation}m</p>
          <p style="font-size: 12px; color: #d1d5db; margin: 4px 0;">Timezone: ${station.timezone}</p>
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([station.longitude, station.latitude])
        .setPopup(popup)
        .addTo(map.current);

      el.addEventListener('click', () => {
        setSelectedStation(station);
      });

      markersRef.current.push(marker);
    });
  }, [mapLoaded, stations]);

  const filteredStations = stations.filter(station =>
    station.station_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.station_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const flyToStation = (station: Station) => {
    if (map.current) {
      map.current.flyTo({
        center: [station.longitude, station.latitude],
        zoom: 10,
        duration: 2000
      });
      setSelectedStation(station);
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
      {/* Sidebar */}
      <div style={{ 
        width: '400px', 
        backgroundColor: '#1a1a1a', 
        overflowY: 'auto',
        borderRight: '1px solid #333'
      }}>
        <div style={{ padding: '20px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            marginBottom: '20px'
          }}>
            <span style={{ fontSize: '24px' }}>📍</span>
            <h1 style={{ 
              color: 'white', 
              fontSize: '20px', 
              fontWeight: 'bold',
              margin: 0
            }}>
              Weather Stations
            </h1>
          </div>

          {/* Поиск */}
          <div style={{ position: 'relative', marginBottom: '15px' }}>
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
                width: '100%',
                padding: '10px 10px 10px 35px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '6px',
                color: 'white',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: '#9ca3af'
            }}>
              ⏳ Загрузка...
            </div>
          ) : (
            <>
              <p style={{ 
                color: '#9ca3af', 
                fontSize: '13px',
                marginBottom: '10px'
              }}>
                Найдено: {filteredStations.length} станций
              </p>
              
              <div style={{ 
                maxHeight: 'calc(100vh - 320px)', 
                overflowY: 'auto'
              }}>
                {filteredStations.map((station) => (
                  <div
                    key={station.station_id}
                    onClick={() => flyToStation(station)}
                    style={{
                      padding: '15px',
                      backgroundColor: selectedStation?.station_id === station.station_id 
                        ? '#3b82f6' 
                        : '#2a2a2a',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedStation?.station_id !== station.station_id) {
                        e.currentTarget.style.backgroundColor = '#333';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedStation?.station_id !== station.station_id) {
                        e.currentTarget.style.backgroundColor = '#2a2a2a';
                      }
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'start'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ 
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: '600',
                          margin: '0 0 8px 0'
                        }}>
                          {station.station_name}
                        </h3>
                        <p style={{ 
                          color: '#d1d5db',
                          fontSize: '12px',
                          margin: '3px 0'
                        }}>
                          ID: {station.station_id}
                        </p>
                        <p style={{ 
                          color: '#d1d5db',
                          fontSize: '12px',
                          margin: '3px 0'
                        }}>
                          📍 {station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}
                        </p>
                        <p style={{ 
                          color: '#d1d5db',
                          fontSize: '12px',
                          margin: '3px 0'
                        }}>
                          ⛰️ {station.elevation}m
                        </p>
                      </div>
                      <span style={{
                        backgroundColor: '#444',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '500'
                      }}>
                        {station.station_network}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div style={{ flex: 1, position: 'relative' }}>
        {!mapboxToken ? (
          <div style={{ 
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#111'
          }}>
          </div>
        ) : !scriptLoaded ? (
          <div style={{ 
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#111'
          }}>
            <div style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>⏳</div>
              <p>Загрузка карты...</p>
            </div>
          </div>
        ) : null}
        <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
}