import type { Station } from '../types/station';

interface SidebarProps {
  stations: Station[];
  loading: boolean;
  searchQuery: string;
  selectedStation: Station | null;
  onSearchChange: (query: string) => void;
  onStationClick: (station: Station) => void;
  onLogoClick: () => void;
}

export default function Sidebar({
  stations,
  loading,
  searchQuery,
  selectedStation,
  onSearchChange,
  onStationClick,
  onLogoClick
}: SidebarProps) {
  const filteredStations = stations.filter(station =>
    station.station_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.station_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-[400px] bg-primary border-r border-gray-200 h-full shadow-[2px_0_8px_rgba(0,0,0,0.1)] flex flex-col">
      {/* Fixed header */}
      <div className="p-5 pb-3 bg-primary border-b border-gray-100">
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
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-5 pt-3">
        {loading ? (
          <div className="text-center py-10 text-gray-500">
            ⏳ Loading...
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-[13px] mb-2.5">
              Found: {filteredStations.length} stations
            </p>

            <div className=" overflow-y-auto">
              {filteredStations.map((station) => {
                const isSelected = selectedStation?.station_id === station.station_id;

                return (
                  <div
                    key={station.station_id}
                    onClick={() => onStationClick(station)}
                    className={`
                      group p-[15px] rounded-[5px] mb-2 cursor-pointer transition-all duration-200 border
                      ${isSelected
                        ? 'bg-secondary-foreground'
                        : 'bg-primary-foreground border-gray-200 hover:bg-secondary-foreground'
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
                          ${isSelected ? 'text-white/90' : 'text-gray-500 group-hover:text-white/90'}
                        `}>
                          ID: {station.station_id}
                        </p>
                        <p className={`
                          text-xs my-[3px] transition-colors duration-200
                          ${isSelected ? 'text-white/90' : 'text-gray-500 group-hover:text-white/90'}
                        `}>
                          📍{station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}
                        </p>
                        <p className={`
                          text-xs my-[3px] transition-colors duration-200
                          ${isSelected ? 'text-white/90' : 'text-gray-500 group-hover:text-white/90'}
                        `}>
                          ⛰️ {station.elevation}m
                        </p>
                      </div>
                      <span className={`
                        px-2 py-1 rounded-[5px] text-[11px] font-medium transition-colors duration-200
                        ${isSelected
                          ? 'bg-primary-foreground text-secondary-foreground'
                          : 'bg-secondary-foreground text-gray-700 group-hover:bg-primary-foreground group-hover:text-secondary-foreground'
                        }
                      `}>
                        {station.station_network.split('_')[0]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
