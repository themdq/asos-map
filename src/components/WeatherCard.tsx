import React from 'react';
import type { WeatherPoint } from '../types/weather';

interface WeatherCardProps {
  stationName: string;
  weatherData: WeatherPoint[];
  loading?: boolean;
}

export default function WeatherCard({ stationName, weatherData, loading }: WeatherCardProps) {
  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        width: '384px',
        zIndex: 50
      }}>
        <div style={{
          backdropFilter: 'blur(24px)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255, 255, 255, 0.6)'
          }}>
            Загрузка данных...
          </div>
        </div>
      </div>
    );
  }

  if (weatherData.length === 0) {
    return null;
  }

  // Берем последнюю точку данных для основной информации
  const latestData = weatherData[weatherData.length - 1];

  // Вычисляем скорость ветра из компонентов
  const windSpeed = Math.sqrt(latestData.wind_x ** 2 + latestData.wind_y ** 2);

  // Вычисляем направление ветра в градусах
  const windDirection = (Math.atan2(latestData.wind_y, latestData.wind_x) * 180 / Math.PI + 360) % 360;

  // Функция для форматирования направления ветра
  const getWindDirectionLabel = (degrees: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  // Находим мин/макс температуру
  const temperatures = weatherData.map(d => d.temperature);
  const minTemp = Math.min(...temperatures);
  const maxTemp = Math.max(...temperatures);

  // Средние значения
  const avgPressure = weatherData
    .filter(d => d.pressure !== null)
    .reduce((sum, d, _, arr) => sum + (d.pressure || 0) / arr.length, 0);

  return (
    <div style={{
      position: 'fixed',
      top: '16px',
      right: '16px',
      width: '384px',
      zIndex: 50,
      maxHeight: '90vh',
      overflowY: 'auto'
    }}>
      <div style={{
        backdropFilter: 'blur(24px)',
        background: 'linear-gradient(to bottom right, rgba(59, 130, 246, 0.2), rgba(168, 85, 247, 0.2))',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        color: 'white',
        padding: '24px'
      }}>
        {/* Заголовок */}
        <h2 style={{
          fontSize: '24px',
          fontWeight: '300',
          color: 'white',
          marginBottom: '8px'
        }}>
          {stationName}
        </h2>
        <p style={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '14px',
          marginBottom: '24px'
        }}>
          {new Date(latestData.timestamp).toLocaleString('ru-RU', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>

        {/* Основная температура */}
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{
            fontSize: '72px',
            fontWeight: '100',
            color: 'white'
          }}>
            {Math.round(latestData.temperature)}&deg;
          </div>
          <div style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '18px',
            marginTop: '8px'
          }}>
            Max: {Math.round(maxTemp)}&deg; Min: {Math.round(minTemp)}&deg;
          </div>
        </div>

        {/* Сетка с деталями */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '16px'
        }}>
          {/* Ветер */}
          <div style={{
            borderRadius: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(4px)',
            padding: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'start',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <svg style={{ width: '20px', height: '20px', color: 'rgba(255, 255, 255, 0.6)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span style={{
                fontSize: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                {getWindDirectionLabel(windDirection)}
              </span>
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', marginBottom: '4px' }}>
              Wind
            </div>
            <div style={{ color: 'white', fontSize: '24px', fontWeight: '300' }}>
              {windSpeed.toFixed(1)}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
              m/s
            </div>
          </div>

          {/* Точка росы */}
          <div style={{
            borderRadius: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(4px)',
            padding: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <svg style={{ width: '20px', height: '20px', color: 'rgba(255, 255, 255, 0.6)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', marginBottom: '4px' }}>
              Dew Point
            </div>
            <div style={{ color: 'white', fontSize: '24px', fontWeight: '300' }}>
              {Math.round(latestData.dewpoint)}&deg;
            </div>
          </div>

          {/* Давление */}
          {avgPressure > 0 && (
            <div style={{
              borderRadius: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(4px)',
              padding: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ marginBottom: '8px' }}>
                <svg style={{ width: '20px', height: '20px', color: 'rgba(255, 255, 255, 0.6)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', marginBottom: '4px' }}>
                Pressure
              </div>
              <div style={{ color: 'white', fontSize: '24px', fontWeight: '300' }}>
                {Math.round(avgPressure)}
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
                hPa
              </div>
            </div>
          )}

          {/* Осадки */}
          <div style={{
            borderRadius: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(4px)',
            padding: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <svg style={{ width: '20px', height: '20px', color: 'rgba(255, 255, 255, 0.6)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', marginBottom: '4px' }}>
              Precipitation
            </div>
            <div style={{ color: 'white', fontSize: '24px', fontWeight: '300' }}>
              {latestData.precip.toFixed(1)}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
              mm
            </div>
          </div>
        </div>

        {/* Временная шкала */}
        <div style={{
          borderRadius: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(4px)',
          padding: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '16px'
        }}>
          <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', marginBottom: '12px' }}>
            Recent Measurements
          </div>
          <div style={{ maxHeight: '192px', overflowY: 'auto' }}>
            {weatherData.slice(-8).reverse().map((point, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '14px',
                marginBottom: index < 7 ? '8px' : '0'
              }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  {new Date(point.timestamp).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ color: 'white', fontWeight: '300' }}>
                    {Math.round(point.temperature)}&deg;
                  </span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', width: '64px', textAlign: 'right' }}>
                    {Math.sqrt(point.wind_x ** 2 + point.wind_y ** 2).toFixed(1)} m/s
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Информация о данных */}
        <div style={{
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.4)',
          fontSize: '12px',
          paddingTop: '8px'
        }}>
          Total data points: {weatherData.length}
        </div>
      </div>
    </div>
  );
}
