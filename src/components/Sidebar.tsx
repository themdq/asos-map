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
      backgroundColor: 'white',
      overflowY: 'auto',
      borderRight: '1px solid #e5e7eb',
      height: '100%',
      boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)'
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
            color: '#1f2937',
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
              backgroundColor: '#f9fafb',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              color: '#1f2937',
              fontSize: '14px',
              boxSizing: 'border-box',
              outline: 'none'
            }}
          />
        </div>

        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6b7280'
          }}>
            ⏳ Загрузка...
          </div>
        ) : (
          <>
            <p style={{
              color: '#6b7280',
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
                      : '#f9fafb',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: '1px solid',
                    borderColor: selectedStation?.station_id === station.station_id
                      ? '#3b82f6'
                      : '#e5e7eb'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedStation?.station_id !== station.station_id) {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedStation?.station_id !== station.station_id) {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
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
                        color: selectedStation?.station_id === station.station_id ? 'white' : '#1f2937',
                        fontSize: '14px',
                        fontWeight: '600',
                        margin: '0 0 8px 0'
                      }}>
                        {station.station_name}
                      </h3>
                      <p style={{
                        color: selectedStation?.station_id === station.station_id ? 'rgba(255,255,255,0.9)' : '#6b7280',
                        fontSize: '12px',
                        margin: '3px 0'
                      }}>
                        ID: {station.station_id}
                      </p>
                      <p style={{
                        color: selectedStation?.station_id === station.station_id ? 'rgba(255,255,255,0.9)' : '#6b7280',
                        fontSize: '12px',
                        margin: '3px 0'
                      }}>
                      📍{station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}
                      </p>
                      <p style={{
                        color: selectedStation?.station_id === station.station_id ? 'rgba(255,255,255,0.9)' : '#6b7280',
                        fontSize: '12px',
                        margin: '3px 0'
                      }}>
                        ⛰️ {station.elevation}m
                      </p>
                    </div>
                    <span style={{
                      backgroundColor: selectedStation?.station_id === station.station_id ? 'rgba(255,255,255,0.2)' : '#e5e7eb',
                      color: selectedStation?.station_id === station.station_id ? 'white' : '#4b5563',
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
