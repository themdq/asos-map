import type { Station } from '../types/station';

interface SidebarProps {
  stations: Station[];
  loading: boolean;
  searchQuery: string;
  selectedStation: Station | null;
  onSearchChange: (query: string) => void;
  onStationClick: (station: Station) => void;
}

export default function Sidebar({
  stations,
  loading,
  searchQuery,
  selectedStation,
  onSearchChange,
  onStationClick
}: SidebarProps) {
  const filteredStations = stations.filter(station =>
    station.station_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.station_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-[400px] bg-primary overflow-y-auto border-r border-gray-200 h-full shadow-[2px_0_8px_rgba(0,0,0,0.1)]">
      <div className="p-5">
        <div className="flex items-center gap-2.5 mb-5 flex-col">
          <div className="flex">
            <span className="text-2xl">📍</span>
            <h1 className="text-gray-800 text-xl font-bold m-0">
              ASOS Stations
            </h1>
          </div>
          <h2 className="text-base">WindBorne Systems</h2>
        </div>

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
                      p-[15px] rounded-lg mb-2 cursor-pointer transition-all duration-200 border
                      ${isSelected
                        ? 'bg-secondary-foreground'
                        : 'bg-primary-foreground border-gray-200 hover:bg-gray-100'
                      }
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className={`
                          text-sm font-semibold m-0 mb-2
                          ${isSelected ? 'text-white' : 'text-gray-800'}
                        `}>
                          {station.station_name}
                        </h3>
                        <p className={`
                          text-xs my-[3px]
                          ${isSelected ? 'text-white/90' : 'text-gray-500'}
                        `}>
                          ID: {station.station_id}
                        </p>
                        <p className={`
                          text-xs my-[3px]
                          ${isSelected ? 'text-white/90' : 'text-gray-500'}
                        `}>
                          📍{station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}
                        </p>
                        <p className={`
                          text-xs my-[3px]
                          ${isSelected ? 'text-white/90' : 'text-gray-500'}
                        `}>
                          ⛰️ {station.elevation}m
                        </p>
                      </div>
                      <span className={`
                        px-2 py-1 rounded text-[11px] font-medium
                        ${isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-200 text-gray-700'
                        }
                      `}>
                        {station.station_network}
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
