import type { WeatherPoint } from '../types/weather';

interface WeatherCardProps {
  stationName: string;
  weatherData: WeatherPoint[];
  loading?: boolean;
  temperatureUnit?: 'C' | 'F';
  windSpeedUnit?: 'kmh' | 'mph';
  pressureUnit?: 'mb' | 'hPa';
  precipitationUnit?: 'mm' | 'in';
}

export default function WeatherCard({
  stationName,
  weatherData,
  loading,
  temperatureUnit = 'C',
  windSpeedUnit = 'kmh',
  pressureUnit = 'mb',
  precipitationUnit = 'mm'
}: WeatherCardProps) {
  if (loading) {
    return (
      <div className="w-full">
        <div className="bg-brand-50 border border-gray-200 rounded-xl p-8 shadow-lg">
          <div className="flex items-center justify-center text-gray-500">
            Data Loading...
          </div>
        </div>
      </div>
    );
  }

  if (weatherData.length === 0) {
    return null;
  }

  // Функции конвертации
  const convertTemp = (tempC: number) => {
    return temperatureUnit === 'F' ? (tempC * 9/5) + 32 : tempC;
  };

  const convertWindSpeed = (speedMs: number) => {
    // Исходная скорость в m/s, конвертируем в km/h или mph
    if (windSpeedUnit === 'kmh') {
      return speedMs * 3.6; // m/s -> km/h
    } else {
      return speedMs * 2.237; // m/s -> mph
    }
  };

  const convertPressure = (pressureHPa: number) => {
    // Давление приходит в hPa, mb = hPa (они равны)
    return pressureHPa;
  };

  const convertPrecipitation = (precipMm: number) => {
    return precipitationUnit === 'in' ? precipMm / 25.4 : precipMm;
  };

  // Берем последнюю точку данных для основной информации
  const latestData = weatherData[weatherData.length - 1];

  // Вычисляем скорость ветра из компонентов (в m/s)
  const windSpeedMs = Math.sqrt(latestData.wind_x ** 2 + latestData.wind_y ** 2);
  const windSpeed = convertWindSpeed(windSpeedMs);

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
  const minTemp = convertTemp(Math.min(...temperatures));
  const maxTemp = convertTemp(Math.max(...temperatures));

  // Средние значения
  const avgPressureRaw = weatherData
    .filter(d => d.pressure !== null)
    .reduce((sum, d, _, arr) => sum + (d.pressure || 0) / arr.length, 0);
  const avgPressure = convertPressure(avgPressureRaw);

  return (
    <div className="w-full max-h-[70vh] overflow-y-auto">
      <div className="bg-primary border border-gray-200 rounded-2xl shadow-lg text-gray-800 p-6">
        {/* Заголовок */}
        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          {stationName}
        </h2>
        <p className="text-gray-500 text-[13px] mb-5">
          {new Date(latestData.timestamp).toLocaleString('en-US', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>

        {/* Основная температура */}
        <div className="text-center py-5">
          <div className="text-[64px] font-extralight text-gray-800">
            {Math.round(convertTemp(latestData.temperature))}&deg;{temperatureUnit}
          </div>
          <div className="text-gray-500 text-base mt-2">
            Max: {Math.round(maxTemp)}&deg; Min: {Math.round(minTemp)}&deg;
          </div>
        </div>

        {/* Сетка с деталями */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Ветер */}
          <div className="rounded-xl bg-secondary-foreground p-3.5 border border-gray-200">
            <div className="flex items-start justify-between mb-2">
              <svg className="w-[18px] h-[18px] text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span className="text-[11px] bg-blue-500 text-white px-2 py-0.5 rounded font-medium">
                {getWindDirectionLabel(windDirection)}
              </span>
            </div>
            <div className="text-gray-500 text-[11px] mb-1">
              Wind
            </div>
            <div className="text-gray-800 text-[22px] font-semibold">
              {windSpeed.toFixed(1)}
            </div>
            <div className="text-gray-400 text-[11px]">
              {windSpeedUnit}
            </div>
          </div>

          {/* Точка росы */}
          <div className="rounded-xl bg-secondary-foreground p-3.5 border border-gray-200">
            <div className="mb-2">
              <svg className="w-[18px] h-[18px] text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="text-gray-500 text-[11px] mb-1">
              Dew Point
            </div>
            <div className="text-gray-800 text-[22px] font-semibold">
              {Math.round(convertTemp(latestData.dewpoint))}&deg;
            </div>
          </div>

          {/* Давление */}
          {avgPressure > 0 && (
            <div className="rounded-xl bg-secondary-foreground p-3.5 border border-gray-200">
              <div className="mb-2">
                <svg className="w-[18px] h-[18px] text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="text-gray-500 text-[11px] mb-1">
                Pressure
              </div>
              <div className="text-gray-800 text-[22px] font-semibold">
                {Math.round(avgPressure)}
              </div>
              <div className="text-gray-400 text-[11px]">
                {pressureUnit}
              </div>
            </div>
          )}

          {/* Осадки */}
          <div className="rounded-xl bg-secondary-foreground p-3.5 border border-gray-200">
            <div className="mb-2">
              <svg className="w-[18px] h-[18px] text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div className="text-gray-500 text-[11px] mb-1">
              Precipitation
            </div>
            <div className="text-gray-800 text-[22px] font-semibold">
              {convertPrecipitation(latestData.precip).toFixed(precipitationUnit === 'in' ? 2 : 1)}
            </div>
            <div className="text-gray-400 text-[11px]">
              {precipitationUnit}
            </div>
          </div>
        </div>

        {/* Временная шкала */}
        <div className="rounded-xl bg-secondary-foreground p-3.5 border border-gray-200 mb-3">
          <div className="text-gray-500 text-[11px] mb-3 font-medium">
            Recent Measurements
          </div>
          <div className="max-h-[180px] overflow-y-auto">
            {weatherData.slice(-8).reverse().map((point, index) => (
              <div
                key={index}
                className={`
                  flex items-center justify-between text-[13px]
                  ${index < 7 ? 'mb-2 pb-2 border-b border-gray-200' : ''}
                `}
              >
                <span className="text-gray-500 text-xs">
                  {new Date(point.timestamp).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-gray-800 font-semibold">
                    {Math.round(convertTemp(point.temperature))}&deg;
                  </span>
                  <span className="text-gray-500 text-xs w-[70px] text-right">
                    {convertWindSpeed(Math.sqrt(point.wind_x ** 2 + point.wind_y ** 2)).toFixed(1)} {windSpeedUnit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Информация о данных */}
        <div className="text-center text-gray-400 text-[11px] pt-1">
          Total data points: {weatherData.length}
        </div>
      </div>
    </div>
  );
}
