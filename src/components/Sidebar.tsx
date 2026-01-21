import { useState, useRef, useEffect, useCallback } from 'react';
import type { Station } from '../types/station';
import type { SortOption } from './WeatherStationsMap';
import MenuButton from './MenuButton';
import SearchBar from './SearchBar';

const ITEMS_PER_PAGE = 50;

interface SidebarProps {
  stations: Station[];
  loading: boolean;
  searchQuery: string;
  selectedStation: Station | null;
  favoriteStations?: Set<string>;
  precipitationUnit?: 'mm' | 'in';
  sortBy?: SortOption;
  userLocation?: { lat: number; lng: number } | null;
  onSearchChange: (query: string) => void;
  onStationClick: (station: Station | null) => void;
  onToggleFavorite?: (stationId: string) => void;
  onSortChange?: (sort: SortOption) => void;
  onLogoClick: () => void;
  onClose?: () => void;
}

const emptySet = new Set<string>();

// Расстояние между двумя точками (Haversine formula)
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

export default function Sidebar({
  stations,
  loading,
  searchQuery,
  selectedStation,
  favoriteStations = emptySet,
  precipitationUnit = 'mm',
  sortBy = 'name',
  userLocation,
  onSearchChange,
  onStationClick,
  onToggleFavorite,
  onSortChange,
  onLogoClick,
  onClose
}: SidebarProps) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Сброс при изменении фильтров/сортировки
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
    scrollContainerRef.current?.scrollTo(0, 0);
  }, [searchQuery, sortBy]);

  // Фильтрация
  const filteredStations = stations.filter(station =>
    station.station_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.station_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Фильтрация избранных (если выбрана сортировка favorites)
  const stationsToSort = sortBy === 'favorites'
    ? filteredStations.filter(s => favoriteStations.has(s.station_id))
    : filteredStations;

  // Сортировка
  const sortedStations = [...stationsToSort].sort((a, b) => {
    switch (sortBy) {
      case 'name':
      case 'favorites': // избранные сортируем по имени
        return a.station_name.localeCompare(b.station_name);
      case 'distance':
        if (!userLocation) return 0;
        const distA = getDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
        const distB = getDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
        return distA - distB;
      case 'network':
        return a.station_network.localeCompare(b.station_network);
      case 'elevation':
        return b.elevation - a.elevation;
      default:
        return 0;
    }
  });

  // Видимые станции (с лимитом)
  const visibleStations = sortedStations.slice(0, visibleCount);
  const hasMore = visibleCount < sortedStations.length;

  // Подгрузка при скролле
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Подгружаем когда до конца осталось 200px
    if (scrollHeight - scrollTop - clientHeight < 200 && hasMore) {
      setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, sortedStations.length));
    }
  }, [hasMore, sortedStations.length]);

  const handleStationClick = (station: Station | null) => {
    onStationClick(station);
    // Закрываем sidebar на мобильных при выборе станции
    if (station && onClose && window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <div className="w-full md:w-[400px] bg-primary border-r border-border h-full shadow-[2px_0_8px_rgba(0,0,0,0.1)] flex flex-col">
      {/* Fixed header */}
      <div className="p-5 pb-3 bg-primary ">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={onLogoClick}>
            <div className="w-12 h-auto flex-shrink-0">
              <img src="/logo.svg" alt="WindBorne Systems" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-graphit text-xl font-bold m-0 leading-tight">
                ASOS Stations
              </h1>
              <h2 className="text-graphit text-sm m-0 leading-tight">WindBorne Systems</h2>
            </div>
          </div>
          {/* Кнопка закрытия — только на мобильных */}
          {onClose && (
            <div className="md:hidden">
              <MenuButton
                onClick={onClose}
                icon="panel_left"
                isExpanded={true}
              />
            </div>
          )}
        </div>
        {/* SearchBar — только на мобильных */}
        <div className="md:hidden mt-3">
          <SearchBar value={searchQuery} onChange={onSearchChange} />
        </div>
      </div>

      {/* Scrollable content */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-5 pt-3"
      >
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">
            ⏳ Loading...
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-muted-foreground text-xs">
                Found: {sortedStations.length} stations
              </p>
              <select
                value={sortBy}
                onChange={(e) => onSortChange?.(e.target.value as SortOption)}
                className="text-xs bg-primary-foreground border border-border rounded px-2 py-1 text-graphit cursor-pointer focus:outline-none focus:ring-1 focus:ring-secondary-foreground"
              >
                <option value="name">By name</option>
                <option value="distance">By distance</option>
                <option value="network">By network</option>
                <option value="elevation">By elevation</option>
                <option value="favorites">Favorites only</option>
              </select>
            </div>

            <div>
              {visibleStations.map((station) => {
                const isSelected = selectedStation?.station_id === station.station_id;
                const isFavorite = favoriteStations.has(station.station_id);

                return (
                  <div
                    key={station.station_id}
                    onClick={() => handleStationClick(isSelected ? null : station)}
                    className={`
                      group p-[15px] pb-8 rounded-[5px] mb-2 cursor-pointer transition-all duration-200 border relative
                      ${isSelected
                        ? 'bg-secondary-foreground border-secondary-foreground'
                        : 'bg-primary-foreground border-border hover:bg-secondary-foreground hover:border-secondary-foreground'
                      }
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className={`
                          text-sm font-semibold m-0 mb-2 transition-colors duration-200
                          ${isSelected ? 'text-white' : 'text-graphit group-hover:text-white'}
                        `}>
                          {station.station_name}
                        </h3>
                        <p className={`
                          text-xs my-[3px] transition-colors duration-200
                          ${isSelected ? 'text-white/90' : 'text-muted-foreground group-hover:text-white/90'}
                        `}>
                          ID: {station.station_id}
                        </p>
                        <p className={`
                          text-xs my-[3px] transition-colors duration-200
                          ${isSelected ? 'text-white/90' : 'text-muted-foreground group-hover:text-white/90'}
                        `}>
                          📍{station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}
                        </p>
                        <p className={`
                          text-xs my-[3px] transition-colors duration-200
                          ${isSelected ? 'text-white/90' : 'text-muted-foreground group-hover:text-white/90'}
                        `}>
                          ⛰️ {precipitationUnit === 'in' ? `${Math.round(station.elevation * 3.28084)}ft` : `${station.elevation}m`}
                        </p>
                      </div>
                      <span className={`
                        px-2 py-1 rounded-[5px] text-[10px] font-medium transition-colors duration-200
                        ${isSelected
                          ? 'bg-primary-foreground text-secondary-foreground'
                          : 'bg-secondary-foreground text-white group-hover:bg-primary-foreground group-hover:text-secondary-foreground'
                        }
                      `}>
                        {station.station_network.split('_')[0]}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite?.(station.station_id);
                      }}
                      className={`
                        absolute bottom-2 right-2 p-1 rounded transition-all duration-200
                        ${isFavorite
                          ? isSelected
                            ? 'text-white'
                            : 'text-secondary-foreground group-hover:text-white'
                          : isSelected
                            ? 'text-white/50 hover:text-white'
                            : 'text-gray-400 hover:text-secondary-foreground group-hover:text-white/50 group-hover:hover:text-white'
                        }
                      `}
                      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill={isFavorite ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth={2}
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })}
              {hasMore && (
                <div className="py-4 text-center text-muted-foreground text-xs">
                  Showing {visibleCount} of {sortedStations.length} — scroll for more
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
