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
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6b7280'
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
      width: '100%',
      maxWidth: '400px',
      maxHeight: '70vh',
      overflowY: 'auto'
    }}>
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        color: '#1f2937',
        padding: '24px'
      }}>
        {/* Заголовок */}
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '4px'
        }}>
          {stationName}
        </h2>
        <p style={{
          color: '#6b7280',
          fontSize: '13px',
          marginBottom: '20px'
        }}>
          {new Date(latestData.timestamp).toLocaleString('ru-RU', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>

        {/* Основная температура */}
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{
            fontSize: '64px',
            fontWeight: '200',
            color: '#1f2937'
          }}>
            {Math.round(latestData.temperature)}&deg;
          </div>
          <div style={{
            color: '#6b7280',
            fontSize: '16px',
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
            borderRadius: '12px',
            backgroundColor: '#f9fafb',
            padding: '14px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'start',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <svg style={{ width: '18px', height: '18px', color: '#6b7280' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span style={{
                fontSize: '11px',
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: '500'
              }}>
                {getWindDirectionLabel(windDirection)}
              </span>
            </div>
            <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '4px' }}>
              Wind
            </div>
            <div style={{ color: '#1f2937', fontSize: '22px', fontWeight: '600' }}>
              {windSpeed.toFixed(1)}
            </div>
            <div style={{ color: '#9ca3af', fontSize: '11px' }}>
              m/s
            </div>
          </div>

          {/* Точка росы */}
          <div style={{
            borderRadius: '12px',
            backgroundColor: '#f9fafb',
            padding: '14px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <svg style={{ width: '18px', height: '18px', color: '#6b7280' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '4px' }}>
              Dew Point
            </div>
            <div style={{ color: '#1f2937', fontSize: '22px', fontWeight: '600' }}>
              {Math.round(latestData.dewpoint)}&deg;
            </div>
          </div>

          {/* Давление */}
          {avgPressure > 0 && (
            <div style={{
              borderRadius: '12px',
              backgroundColor: '#f9fafb',
              padding: '14px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ marginBottom: '8px' }}>
                <svg style={{ width: '18px', height: '18px', color: '#6b7280' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '4px' }}>
                Pressure
              </div>
              <div style={{ color: '#1f2937', fontSize: '22px', fontWeight: '600' }}>
                {Math.round(avgPressure)}
              </div>
              <div style={{ color: '#9ca3af', fontSize: '11px' }}>
                hPa
              </div>
            </div>
          )}

          {/* Осадки */}
          <div style={{
            borderRadius: '12px',
            backgroundColor: '#f9fafb',
            padding: '14px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <svg style={{ width: '18px', height: '18px', color: '#6b7280' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '4px' }}>
              Precipitation
            </div>
            <div style={{ color: '#1f2937', fontSize: '22px', fontWeight: '600' }}>
              {latestData.precip.toFixed(1)}
            </div>
            <div style={{ color: '#9ca3af', fontSize: '11px' }}>
              mm
            </div>
          </div>
        </div>

        {/* Временная шкала */}
        <div style={{
          borderRadius: '12px',
          backgroundColor: '#f9fafb',
          padding: '14px',
          border: '1px solid #e5e7eb',
          marginBottom: '12px'
        }}>
          <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '12px', fontWeight: '500' }}>
            Recent Measurements
          </div>
          <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
            {weatherData.slice(-8).reverse().map((point, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '13px',
                marginBottom: index < 7 ? '8px' : '0',
                paddingBottom: index < 7 ? '8px' : '0',
                borderBottom: index < 7 ? '1px solid #e5e7eb' : 'none'
              }}>
                <span style={{ color: '#6b7280', fontSize: '12px' }}>
                  {new Date(point.timestamp).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ color: '#1f2937', fontWeight: '600' }}>
                    {Math.round(point.temperature)}&deg;
                  </span>
                  <span style={{ color: '#6b7280', fontSize: '12px', width: '60px', textAlign: 'right' }}>
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
          color: '#9ca3af',
          fontSize: '11px',
          paddingTop: '4px'
        }}>
          Total data points: {weatherData.length}
        </div>
      </div>
    </div>
  );
}
