import React from 'react';
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
            onChange={(e) => onSearchChange(e.target.value)}
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
                  onClick={() => onStationClick(station)}
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
  );
}
