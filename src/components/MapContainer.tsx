import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import type { Station } from '../types/station';
import { createMarkerElement, createPopupHTML } from '../utils/mapMarker';

interface MapContainerProps {
  stations: Station[];
  mapboxToken: string;
  scriptLoaded: boolean;
  onStationSelect: (station: Station) => void;
}

export interface MapRef {
  flyToStation: (station: Station) => void;
}

const MapContainer = forwardRef<MapRef, MapContainerProps>(({
  stations,
  mapboxToken,
  scriptLoaded,
  onStationSelect
}, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const mapLoadedRef = useRef(false);

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
        mapLoadedRef.current = true;
      });

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
    if (!mapLoadedRef.current || !map.current || stations.length === 0) return;

    const mapboxgl = (window as any).mapboxgl;
    if (!mapboxgl) return;

    // Очистка старых маркеров
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Добавление маркеров для каждой станции
    stations.forEach((station) => {
      const el = createMarkerElement();

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        className: 'custom-popup'
      }).setHTML(createPopupHTML(station));

      const marker = new mapboxgl.Marker(el)
        .setLngLat([station.longitude, station.latitude])
        .setPopup(popup)
        .addTo(map.current);

      el.addEventListener('click', () => {
        onStationSelect(station);
      });

      markersRef.current.push(marker);
    });
  }, [stations, onStationSelect]);

  // Предоставляем метод flyToStation родительскому компоненту через ref
  useImperativeHandle(ref, () => ({
    flyToStation: (station: Station) => {
      if (map.current) {
        map.current.flyTo({
          center: [station.longitude, station.latitude],
          zoom: 10,
          duration: 2000
        });
      }
    }
  }));

  return (
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
  );
});

MapContainer.displayName = 'MapContainer';

export default MapContainer;
