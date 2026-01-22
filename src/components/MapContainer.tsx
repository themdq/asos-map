import { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import type { Station } from '../types/station';
import LoadingOverlay from './LoadingOverlay';

interface MapContainerProps {
  stations: Station[];
  selectedStation: Station | null;
  favoriteStations: Set<string>;
  darkMode?: boolean;
  mapMode?: '2d' | '3d';
  mapboxToken: string;
  scriptLoaded: boolean;
  isHydrated?: boolean;
  onStationSelect: (station: Station) => void;
}

export interface MapRef {
  flyToStation: (station: Station) => void;
  flyTo: (lng: number, lat: number, zoom?: number) => void;
  resize: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  geolocate: () => void;
}

const MapContainer = forwardRef<MapRef, MapContainerProps>(({
  stations,
  selectedStation,
  favoriteStations,
  darkMode = false,
  mapMode = '2d',
  mapboxToken,
  scriptLoaded,
  isHydrated = false,
  onStationSelect
}, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const mapLoadedRef = useRef(false);
  const imagesLoadedRef = useRef(false);
  const popupRef = useRef<any>(null);
  const selectedStationRef = useRef<Station | null>(selectedStation);
  const favoriteStationsRef = useRef<Set<string>>(favoriteStations);
  const clusterMarkersRef = useRef<Map<number, any>>(new Map());
  const onStationSelectRef = useRef(onStationSelect);
  const eventHandlersAddedRef = useRef(false);
  const updateClusterMarkersTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isStyleChanging, setIsStyleChanging] = useState(false);
  const [imagesReady, setImagesReady] = useState(false);
  const styleChangingRef = useRef(false);

  // Initialize map (wait for isHydrated so darkMode is loaded from localStorage)
  useEffect(() => {
    if (!scriptLoaded || !mapboxToken || !isHydrated || map.current || !mapContainer.current) return;

    const mapboxgl = (window as any).mapboxgl;
    if (!mapboxgl) return;

    mapboxgl.accessToken = mapboxToken;

    const initialStyle = darkMode
      ? 'mapbox://styles/mapbox/dark-v11'
      : 'mapbox://styles/mapbox/standard';

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: initialStyle,
        center: [-122.2, 37.43],
        zoom: 10,
        projection: mapMode === '3d' ? 'globe' : 'mercator',
      });

      map.current.on('load', () => {
        loadMarkerImages();
      });

      const loadMarkerImages = () => {
        const selectedMarkerSrc = darkMode ? '/marker-selected-dark.svg' : '/marker-selected.svg';
        const markers = [
          { name: 'custom-marker', src: '/marker.svg' },
          { name: 'selected-marker', src: selectedMarkerSrc },
          { name: 'favorite-marker', src: '/marker-favorite.svg' },
        ];

        let loaded = 0;
        const totalMarkers = markers.length;

        markers.forEach(({ name, src }) => {
          const img = new Image();

          const handleLoad = () => {
            if (map.current && !map.current.hasImage(name)) {
              try {
                map.current.addImage(name, img, { sdf: false });
              } catch (e) {
                // Skip if the image has already been added
              }
            }
            loaded++;
            if (loaded === totalMarkers) {
              mapLoadedRef.current = true;
              imagesLoadedRef.current = true;
              setImagesReady(true);
              // Trigger layer refresh
              map.current?.fire('images-loaded');
            }
          };

          img.onload = handleLoad;
          img.onerror = handleLoad; // Treat as loaded even on error
          img.src = src;
        });
      };

      // Default controls removed; use custom buttons
    } catch (error) {
      console.error('Map initialization error:', error);
    }

    return () => {
      // Clear HTML markers
      clusterMarkersRef.current.forEach((value) => {
        value.marker.remove();
      });
      clusterMarkersRef.current.clear();

      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      setImagesReady(false);
    };
  }, [scriptLoaded, mapboxToken, isHydrated, darkMode]);

  // Update ref for onStationSelect
  useEffect(() => {
    onStationSelectRef.current = onStationSelect;
  }, [onStationSelect]);

  // Switch map style on theme change
  useEffect(() => {
    if (!map.current || !mapLoadedRef.current) return;

    const newStyle = darkMode
      ? 'mapbox://styles/mapbox/dark-v11'
      : 'mapbox://styles/mapbox/standard';

    // Cancel flag if component unmounts or theme changes again
    let cancelled = false;

    // Show overlay for a smooth transition
    styleChangingRef.current = true;
    setIsStyleChanging(true);
    setImagesReady(false);

    // Reset flags and clear cluster markers
    imagesLoadedRef.current = false;
    eventHandlersAddedRef.current = false;
    clusterMarkersRef.current.forEach((value) => value.marker.remove());
    clusterMarkersRef.current.clear();

    map.current.setStyle(newStyle);

    // Re-add marker images after style change
    const handleStyleLoad = () => {
      if (cancelled || !map.current) return;

      const selectedMarkerSrc = darkMode ? '/marker-selected-dark.svg' : '/marker-selected.svg';
      const markers = [
        { name: 'custom-marker', src: '/marker.svg' },
        { name: 'selected-marker', src: selectedMarkerSrc },
        { name: 'favorite-marker', src: '/marker-favorite.svg' },
      ];

      let loaded = 0;
      const totalMarkers = markers.length;

      markers.forEach(({ name, src }) => {
        const img = new Image();

        const handleLoad = () => {
          if (cancelled || !map.current) return;

          try {
            if (!map.current.hasImage(name)) {
              map.current.addImage(name, img, { sdf: false });
            }
          } catch (e) {
            // Ignore errors if the map is mid-style change
          }

          loaded++;
          if (loaded === totalMarkers && !cancelled) {
            imagesLoadedRef.current = true;
            styleChangingRef.current = false;
            setImagesReady(true);
            map.current?.fire('images-loaded');
            setTimeout(() => {
              if (!cancelled) setIsStyleChanging(false);
            }, 100);
          }
        };

        img.onload = handleLoad;
        img.onerror = handleLoad; // Treat as loaded even on error
        img.src = src;
      });
    };

    map.current.once('style.load', handleStyleLoad);

    return () => {
      cancelled = true;
      setIsStyleChanging(false);
    };
  }, [darkMode]);

  // Toggle 2D/3D map projection
  useEffect(() => {
    if (!map.current || !mapLoadedRef.current) return;

    map.current.setProjection(mapMode === '3d' ? 'globe' : 'mercator');
  }, [mapMode]);

  // Update ref for favoriteStations
  useEffect(() => {
    favoriteStationsRef.current = favoriteStations;
  }, [favoriteStations]);

  // Add clustering
  useEffect(() => {
    if (!map.current || stations.length === 0) return;

    const mapboxgl = (window as any).mapboxgl;
    if (!mapboxgl) return;

    const setupLayers = () => {
      // Do not configure layers during style change
      if (!map.current || styleChangingRef.current) return;

      // Convert stations to GeoJSON (filter invalid coordinates)
      const geojson = {
        type: 'FeatureCollection',
        features: stations
          .filter((station) =>
            station.latitude != null &&
            station.longitude != null &&
            !isNaN(station.latitude) &&
            !isNaN(station.longitude)
          )
          .map((station) => ({
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
              longitude: station.longitude,
              is_favorite: favoriteStationsRef.current.has(station.station_id)
            }
          }))
      };

    // Remove existing layers and sources (try/catch for safety)
    try {
      if (map.current.getLayer('selected-point')) {
        map.current.removeLayer('selected-point');
      }
      if (map.current.getSource('selected-station')) {
        map.current.removeSource('selected-station');
      }
    } catch (e) {
      // Layers may not exist after style change
    }
    // Clear HTML cluster markers
    clusterMarkersRef.current.forEach((value) => {
      value.marker.remove();
    });
    clusterMarkersRef.current.clear();

    try {
      if (map.current.getLayer('clusters')) {
        map.current.removeLayer('clusters');
      }
      if (map.current.getLayer('unclustered-point')) {
        map.current.removeLayer('unclustered-point');
      }
      if (map.current.getSource('stations')) {
        map.current.removeSource('stations');
      }
    } catch (e) {
      // Layers may not exist after style change
    }

    // Theme-dependent colors
    const clusterColor = darkMode ? '#7297B4' : '#A4B7AA';
    const clusterTextColor = darkMode ? '#1A202C' : '#363636';

    // Update HTML markers with cluster counts
    const updateClusterMarkers = () => {
      if (!map.current) return;

      const mapboxgl = (window as any).mapboxgl;
      try {
        const features = map.current.querySourceFeatures('stations', {
          filter: ['has', 'point_count']
        });

        // Track which clusters are currently visible
        const currentClusterIds = new Set<number>();

        features.forEach((feature: any) => {
          const clusterId = feature.properties.cluster_id;
          const pointCount = feature.properties.point_count_abbreviated;
          const coordinates = feature.geometry.coordinates;

          currentClusterIds.add(clusterId);

          if (!clusterMarkersRef.current.has(clusterId)) {
            // Create HTML element for the marker
            const el = document.createElement('div');
            el.className = 'cluster-count-marker';
            el.textContent = pointCount;
            el.style.cssText = `
              font-family: 'PPNeue Montreal', sans-serif;
              font-size: 12px;
              font-weight: 500;
              color: ${clusterTextColor};
              pointer-events: none;
              text-align: center;
            `;

            const marker = new mapboxgl.Marker({
              element: el,
              anchor: 'center'
            })
              .setLngLat(coordinates)
              .addTo(map.current);

            clusterMarkersRef.current.set(clusterId, { marker, el });
          } else {
            // Update position and text for existing marker
            const { marker, el } = clusterMarkersRef.current.get(clusterId);
            marker.setLngLat(coordinates);
            el.textContent = pointCount;
          }
        });

        // Remove markers for clusters that no longer exist
        clusterMarkersRef.current.forEach((value, clusterId) => {
          if (!currentClusterIds.has(clusterId)) {
            value.marker.remove();
            clusterMarkersRef.current.delete(clusterId);
          }
        });
      } catch (e) {
        // Source may not exist
      }
    };

    // Debounced cluster marker updates
    const debouncedUpdateClusterMarkers = () => {
      if (updateClusterMarkersTimeoutRef.current) {
        clearTimeout(updateClusterMarkersTimeoutRef.current);
      }
      updateClusterMarkersTimeoutRef.current = setTimeout(() => {
        if (map.current?.isSourceLoaded('stations')) {
          updateClusterMarkers();
        }
      }, 50);
    };

    // Add clustered data source
    try {
      map.current.addSource('stations', {
        type: 'geojson',
        data: geojson,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      // Layer for clusters
      map.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'stations',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': clusterColor,
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

      // Update markers on map changes
      map.current.on('moveend', debouncedUpdateClusterMarkers);
      map.current.on('sourcedata', (e: any) => {
        if (e.sourceId === 'stations') {
          debouncedUpdateClusterMarkers();
        }
      });

      // Layer for individual points
      map.current.addLayer({
        id: 'unclustered-point',
        type: 'symbol',
        source: 'stations',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-image': [
            'case',
            ['get', 'is_favorite'],
            'favorite-marker',
            'custom-marker'
          ],
          'icon-size': 0.18,
          'icon-allow-overlap': true,
          'icon-anchor': 'bottom'
        }
      });

      // Add source and layer for selected station
      const currentSelected = selectedStationRef.current;
      map.current.addSource('selected-station', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: currentSelected ? [{
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [currentSelected.longitude, currentSelected.latitude]
            },
            properties: {}
          }] : []
        }
      });

      map.current.addLayer({
        id: 'selected-point',
        type: 'symbol',
        source: 'selected-station',
        layout: {
          'icon-image': 'selected-marker',
          'icon-size': 0.18,
          'icon-allow-overlap': true,
          'icon-anchor': 'bottom'
        }
      });
    } catch (e) {
      console.error('Error setting up map layers:', e);
      return;
    }

    // Create popup to show information
    if (!popupRef.current) {
      popupRef.current = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: 'custom-popup'
      });
    }

    // Add event handlers only once
    if (!eventHandlersAddedRef.current) {
      // Cluster click handler
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

      // Point click handler
      map.current.on('click', 'unclustered-point', (e: any) => {
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
        onStationSelectRef.current(station);
      });

      // Change cursor on hover
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

      eventHandlersAddedRef.current = true;
    }

    // Initial marker update
    debouncedUpdateClusterMarkers();
    }; // end setupLayers

    // Configure layers when images are ready
    if (imagesReady) {
      setupLayers();
    }

    return () => {
      if (updateClusterMarkersTimeoutRef.current) {
        clearTimeout(updateClusterMarkersTimeoutRef.current);
      }
    };
  }, [stations, favoriteStations, imagesReady]);

  // Update selected station layer
  useEffect(() => {
    selectedStationRef.current = selectedStation;

    if (!map.current) return;

    const updateSelectedStation = () => {
      const source = map.current?.getSource('selected-station');
      if (!source) return false;

      if (selectedStation) {
        source.setData({
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [selectedStation.longitude, selectedStation.latitude]
            },
            properties: {}
          }]
        });
      } else {
        source.setData({
          type: 'FeatureCollection',
          features: []
        });
      }
      return true;
    };

    // Try to update immediately; wait if source not created yet
    if (!updateSelectedStation()) {
      const interval = setInterval(() => {
        if (updateSelectedStation()) {
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [selectedStation]);

  // Expose methods to parent via ref
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
    },
    zoomIn: () => {
      if (map.current) {
        map.current.zoomIn();
      }
    },
    zoomOut: () => {
      if (map.current) {
        map.current.zoomOut();
      }
    },
    geolocate: () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (map.current) {
              map.current.flyTo({
                center: [position.coords.longitude, position.coords.latitude],
                zoom: 12,
                duration: 2000
              });
            }
          },
          (error) => console.error('Geolocation error:', error)
        );
      }
    }
  }));

  return (
    <div className="w-full h-full relative" data-map>
      {!scriptLoaded && <LoadingOverlay />}
      <div ref={mapContainer} className="w-full h-full" />
      {/* Overlay for smooth theme transition */}
      <div
        className={`absolute inset-0 bg-primary pointer-events-none transition-opacity duration-300 ${
          isStyleChanging ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
});

MapContainer.displayName = 'MapContainer';

export default MapContainer;
