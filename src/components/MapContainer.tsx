import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import type { Station } from '../types/station';
import LoadingOverlay from './LoadingOverlay';

interface MapContainerProps {
  stations: Station[];
  mapboxToken: string;
  scriptLoaded: boolean;
  onStationSelect: (station: Station) => void;
}

export interface MapRef {
  flyToStation: (station: Station) => void;
  flyTo: (lng: number, lat: number, zoom?: number) => void;
  resize: () => void;
}

const MapContainer = forwardRef<MapRef, MapContainerProps>(({
  stations,
  mapboxToken,
  scriptLoaded,
  onStationSelect
}, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const mapLoadedRef = useRef(false);
  const popupRef = useRef<any>(null);

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
        center: [-122.2, 37.43],
        zoom: 10,
        projection: 'mercator',
      });

      map.current.on('load', () => {
        // Загружаем кастомный маркер
        const img = new Image();
        img.onload = () => {
          if (map.current && !map.current.hasImage('custom-marker')) {
            map.current.addImage('custom-marker', img, { sdf: false });
          }
          mapLoadedRef.current = true;
        };
        img.src = '/marker.svg';
      });

      map.current.addControl(new mapboxgl.NavigationControl({showCompass: false}), 'bottom-right');
      map.current.addControl(new mapboxgl.GeolocateControl(), 'bottom-right');
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

  // Добавление кластеризации
  useEffect(() => {
    if (!mapLoadedRef.current || !map.current || stations.length === 0) return;

    const mapboxgl = (window as any).mapboxgl;
    if (!mapboxgl) return;

    // Преобразуем станции в GeoJSON формат
    const geojson = {
      type: 'FeatureCollection',
      features: stations.map((station) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [station.longitude, station.latitude]
        },
        properties: {
          station_id: station.station_id,
          station_name: station.station_name,
          station_network: station.station_network,
          elevation: station.elevation,
          timezone: station.timezone,
          latitude: station.latitude,
          longitude: station.longitude
        }
      }))
    };

    // Удаляем существующие слои и источники
    if (map.current.getLayer('clusters')) {
      map.current.removeLayer('clusters');
    }
    if (map.current.getLayer('cluster-count')) {
      map.current.removeLayer('cluster-count');
    }
    if (map.current.getLayer('unclustered-point')) {
      map.current.removeLayer('unclustered-point');
    }
    if (map.current.getSource('stations')) {
      map.current.removeSource('stations');
    }

    // Добавляем источник данных с кластеризацией
    map.current.addSource('stations', {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });

    // Слой для кластеров
    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'stations',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#ACC6D0',
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          10,
          30,
          30,
          40
        ]
      }
    });

    // Слой для количества точек в кластере
    map.current.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'stations',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      }
    });

    // Слой для отдельных точек с кастомным маркером
    map.current.addLayer({
      id: 'unclustered-point',
      type: 'symbol',
      source: 'stations',
      filter: ['!', ['has', 'point_count']],
      layout: {
        'icon-image': 'custom-marker',
        'icon-size': 0.18,
        'icon-allow-overlap': true,
        'icon-anchor': 'bottom'
      }
    });

    // Создаем popup для отображения информации
    if (!popupRef.current) {
      popupRef.current = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: 'custom-popup'
      });
    }

    // Обработчик клика на кластер - зумим к нему
    map.current.on('click', 'clusters', (e: any) => {
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      });
      const clusterId = features[0].properties.cluster_id;
      map.current.getSource('stations').getClusterExpansionZoom(
        clusterId,
        (err: any, zoom: number) => {
          if (err) return;

          map.current.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom
          });
        }
      );
    });

    // Обработчик клика на отдельную точку
    map.current.on('click', 'unclustered-point', (e: any) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const properties = e.features[0].properties;

      const station: Station = {
        station_id: properties.station_id,
        station_name: properties.station_name,
        station_network: properties.station_network,
        latitude: properties.latitude,
        longitude: properties.longitude,
        elevation: properties.elevation,
        timezone: properties.timezone
      };

      onStationSelect(station);

    });

    // Меняем курсор при наведении на кластеры и точки
    map.current.on('mouseenter', 'clusters', () => {
      map.current.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'clusters', () => {
      map.current.getCanvas().style.cursor = '';
    });
    map.current.on('mouseenter', 'unclustered-point', () => {
      map.current.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'unclustered-point', () => {
      map.current.getCanvas().style.cursor = '';
    });

  }, [stations, onStationSelect]);

  // Предоставляем методы родительскому компоненту через ref
  useImperativeHandle(ref, () => ({
    flyToStation: (station: Station) => {
      if (map.current) {
        map.current.flyTo({
          center: [station.longitude, station.latitude],
          zoom: 10,
          duration: 2000
        });
      }
    },
    flyTo: (lng: number, lat: number, zoom: number = 10) => {
      if (map.current) {
        map.current.flyTo({
          center: [lng, lat],
          zoom,
          duration: 2000
        });
      }
    },
    resize: () => {
      if (map.current && map.current.resize) {
        map.current.resize();
      }
    }
  }));

  return (
    <div className="w-full h-full relative">
      {!scriptLoaded && <LoadingOverlay />}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
});

MapContainer.displayName = 'MapContainer';

export default MapContainer;
