import { useState } from 'react';
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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // При изменении данных сбрасываем на последнюю точку
  const currentIndex = selectedIndex ?? weatherData.length - 1;

  if (loading) {
    return (
      <div className="w-full">
        <div className="bg-primary border border-gray-200 rounded-[5px] p-6 shadow-lg">
          <div className="flex items-center justify-center text-gray-500 text-sm">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (weatherData.length === 0) {
    return null;
  }

  // Функции конвертации (данные приходят в Фаренгейтах)
  const convertTemp = (tempF: number) => {
    return temperatureUnit === 'C' ? (tempF - 32) * 5/9 : tempF;
  };

  // Конвертация в Цельсий для расчётов (формула Магнуса требует °C)
  const toCelsius = (tempF: number) => (tempF - 32) * 5/9;

  const convertWindSpeed = (speedMs: number) => {
    if (windSpeedUnit === 'kmh') {
      return speedMs * 3.6;
    } else {
      return speedMs * 2.237;
    }
  };

  const convertPressure = (pressureHPa: number) => {
    return pressureHPa;
  };

  const convertPrecipitation = (precipMm: number) => {
    return precipitationUnit === 'in' ? precipMm / 25.4 : precipMm;
  };

  // Расчёт относительной влажности по формуле Магнуса (требует °C)
  const calcHumidity = (tempF: number, dewpointF: number) => {
    const temp = toCelsius(tempF);
    const dewpoint = toCelsius(dewpointF);
    const a = 17.625;
    const b = 243.04;
    const rh = 100 * Math.exp((a * dewpoint) / (b + dewpoint)) / Math.exp((a * temp) / (b + temp));
    return Math.min(100, Math.max(0, rh));
  };

  // Текущая точка данных
  const currentData = weatherData[currentIndex];

  // Вычисляем скорость и направление ветра
  const windSpeedMs = Math.sqrt(currentData.wind_x ** 2 + currentData.wind_y ** 2);
  const windSpeed = convertWindSpeed(windSpeedMs);
  const windDirection = (Math.atan2(currentData.wind_y, currentData.wind_x) * 180 / Math.PI + 360) % 360;

  const getWindDirectionLabel = (degrees: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  // Мин/макс температура за весь период
  const temperatures = weatherData.map(d => d.temperature);
  const minTemp = convertTemp(Math.min(...temperatures));
  const maxTemp = convertTemp(Math.max(...temperatures));

  // Форматирование даты для слайдера
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="w-full">
      <div className="bg-primary border border-gray-200 rounded-[5px] shadow-lg text-graphit p-4">
        {/* Заголовок */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h2 className="text-base font-semibold text-graphit">
              {stationName}
            </h2>
            <p className="text-gray-500 text-xs">
              {formatDate(currentData.timestamp)}, {formatTime(currentData.timestamp)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-light text-graphit">
              {Math.round(convertTemp(currentData.temperature))}&deg;{temperatureUnit}
            </div>
            <div className="text-gray-400 text-[10px]">
              {Math.round(maxTemp)}&deg; / {Math.round(minTemp)}&deg;
            </div>
          </div>
        </div>

        {/* Сетка метрик */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {/* Ветер */}
          <div className="rounded bg-primary-foreground p-2 text-center">
            <div className="text-gray-400 text-[9px] mb-0.5">Wind</div>
            <div className="text-graphit text-sm font-semibold">
              {windSpeed.toFixed(1)}
            </div>
            <div className="text-gray-400 text-[9px]">{windSpeedUnit}</div>
            <span className="text-[9px] text-blue-500 font-medium">
              {getWindDirectionLabel(windDirection)}
            </span>
          </div>

          {/* Влажность */}
          <div className="rounded bg-primary-foreground p-2 text-center">
            <div className="text-gray-400 text-[9px] mb-0.5">Humidity</div>
            <div className="text-graphit text-sm font-semibold">
              {Math.round(calcHumidity(currentData.temperature, currentData.dewpoint))}%
            </div>
            <div className="text-gray-400 text-[9px]">
              dew {Math.round(convertTemp(currentData.dewpoint))}&deg;
            </div>
          </div>

          {/* Давление */}
          <div className="rounded bg-primary-foreground p-2 text-center">
            <div className="text-gray-400 text-[9px] mb-0.5">Pressure</div>
            <div className="text-graphit text-sm font-semibold">
              {currentData.pressure ? Math.round(convertPressure(currentData.pressure)) : '—'}
            </div>
            <div className="text-gray-400 text-[9px]">{pressureUnit}</div>
          </div>

          {/* Осадки */}
          <div className="rounded bg-primary-foreground p-2 text-center">
            <div className="text-gray-400 text-[9px] mb-0.5">Precip</div>
            <div className="text-graphit text-sm font-semibold">
              {convertPrecipitation(currentData.precip).toFixed(precipitationUnit === 'in' ? 2 : 1)}
            </div>
            <div className="text-gray-400 text-[9px]">{precipitationUnit}</div>
          </div>
        </div>

        {/* Временная шкала */}
        <div className="rounded bg-primary-foreground p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-[10px]">
              {formatDate(weatherData[0].timestamp)}
            </span>
            <span className="text-gray-500 text-[10px] font-medium">
              {weatherData.length} time points
            </span>
            <span className="text-gray-400 text-[10px]">
              {formatDate(weatherData[weatherData.length - 1].timestamp)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={weatherData.length - 1}
            value={currentIndex}
            onChange={(e) => setSelectedIndex(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-secondary-foreground"
          />
        </div>
      </div>
    </div>
  );
}
