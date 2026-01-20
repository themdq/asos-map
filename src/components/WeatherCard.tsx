import { useState } from 'react';
import type { WeatherPoint } from '../types/weather';

interface WeatherCardProps {
  stationName: string;
  stationId: string;
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  network: string;
  weatherData: WeatherPoint[];
  loading?: boolean;
  temperatureUnit?: 'C' | 'F';
  windSpeedUnit?: 'kmh' | 'mph';
  pressureUnit?: 'mb' | 'hPa';
  precipitationUnit?: 'mm' | 'in';
}

export default function WeatherCard({
  stationName,
  stationId,
  latitude,
  longitude,
  elevation,
  timezone,
  network,
  weatherData,
  loading,
  temperatureUnit = 'C',
  windSpeedUnit = 'kmh',
  pressureUnit = 'mb',
  precipitationUnit = 'mm'
}: WeatherCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const currentIndex = selectedIndex ?? weatherData.length - 1;

  const copyCoordinates = async () => {
    const coords = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    await navigator.clipboard.writeText(coords);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="bg-primary border border-gray-200 rounded-[5px] p-4 shadow-lg">
          <div className="flex items-center justify-start text-gray-500 text-sm">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (weatherData.length === 0) {
    return null;
  }

  // Функции конвертации
  const convertTemp = (tempF: number) => {
    return temperatureUnit === 'C' ? (tempF - 32) * 5/9 : tempF;
  };

  const toCelsius = (tempF: number) => (tempF - 32) * 5/9;

  const convertWindSpeed = (speedMs: number) => {
    return windSpeedUnit === 'kmh' ? speedMs * 3.6 : speedMs * 2.237;
  };

  const convertPressure = (pressureHPa: number) => pressureHPa;

  const convertPrecipitation = (precipMm: number) => {
    return precipitationUnit === 'in' ? precipMm / 25.4 : precipMm;
  };

  const calcHumidity = (tempF: number, dewpointF: number) => {
    const temp = toCelsius(tempF);
    const dewpoint = toCelsius(dewpointF);
    const a = 17.625;
    const b = 243.04;
    const rh = 100 * Math.exp((a * dewpoint) / (b + dewpoint)) / Math.exp((a * temp) / (b + temp));
    return Math.min(100, Math.max(0, rh));
  };

  const currentData = weatherData[currentIndex];

  // Расчёт ветра
  const windSpeedMs = Math.sqrt(currentData.wind_x ** 2 + currentData.wind_y ** 2);
  const windSpeed = convertWindSpeed(windSpeedMs);
  const windDirection = (Math.atan2(currentData.wind_y, currentData.wind_x) * 180 / Math.PI + 360) % 360;

  const getWindDirectionLabel = (degrees: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(degrees / 45) % 8];
  };

  // Мин/макс за период для нормализации градиентов
  const temperatures = weatherData.map(d => d.temperature);
  const minTempRaw = Math.min(...temperatures);
  const maxTempRaw = Math.max(...temperatures);

  const winds = weatherData.map(d => convertWindSpeed(Math.sqrt(d.wind_x ** 2 + d.wind_y ** 2)));
  const maxWind = Math.max(...winds);

  const pressures = weatherData.filter(d => d.pressure !== null).map(d => d.pressure as number);
  const minPressure = pressures.length > 0 ? Math.min(...pressures) : 0;
  const maxPressure = pressures.length > 0 ? Math.max(...pressures) : 1;

  const precips = weatherData.map(d => convertPrecipitation(d.precip));
  const maxPrecip = Math.max(...precips, 0.1);

  // Нормализация значений для градиентных полосок (0-100%)
  const normalizeTemp = (tempF: number) => {
    if (maxTempRaw === minTempRaw) return 50;
    return ((tempF - minTempRaw) / (maxTempRaw - minTempRaw)) * 100;
  };

  const normalizeHumidity = (h: number) => h;

  const normalizeWind = (w: number) => {
    if (maxWind === 0) return 0;
    return (w / maxWind) * 100;
  };

  const normalizePressure = (p: number | null) => {
    if (p === null || maxPressure === minPressure) return 50;
    return ((p - minPressure) / (maxPressure - minPressure)) * 100;
  };

  const normalizePrecip = (p: number) => {
    return (p / maxPrecip) * 100;
  };

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

  const formatTimezoneUTC = (tz: string) => {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        timeZoneName: 'shortOffset'
      });
      const parts = formatter.formatToParts(now);
      const offsetPart = parts.find(p => p.type === 'timeZoneName');
      return offsetPart?.value || tz;
    } catch {
      return tz;
    }
  };

  // Компонент метрики с градиентной полоской
  const MetricRow = ({
    label,
    value,
    unit,
    percent,
    gradient,
    extra
  }: {
    label: string;
    value: string | number;
    unit: string;
    percent: number;
    gradient: string;
    extra?: React.ReactNode;
  }) => (
    <div className="py-1.5">
      <div className="flex items-center gap-3">
        <div className="w-28 shrink-0">
          <div className="text-gray-500 text-xs uppercase">{label}</div>
          <div className="text-gray-500 text-xs flex items-center gap-1">
            {value} {unit} {extra && <span className="text-gray-400 flex items-center gap-0.5">{extra}</span>}
          </div>
        </div>
        <div className="w-32 h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded transition-all duration-300"
            style={{
              width: `${Math.max(percent, 3)}%`,
              background: gradient
            }}
          />
        </div>
      </div>
    </div>
  );

  const currentTemp = convertTemp(currentData.temperature);
  const currentHumidity = calcHumidity(currentData.temperature, currentData.dewpoint);
  const currentPrecip = convertPrecipitation(currentData.precip);

  return (
    <div className="w-full">
      <div className="bg-primary border border-gray-200 rounded-[5px] shadow-lg text-graphit p-4">
        {/* Header: Name */}
        <h2 className="text-base font-semibold text-graphit leading-tight mb-1">
          {stationName}
        </h2>

        {/* Station info */}
        <div className="text-gray-500 text-xs space-y-0.5 mb-3">
          
          <div className="flex items-center gap-1">
            
            <span>{stationId}</span>
            <span className="text-gray-300">•</span>
            <span>{network.split('_')[0]}</span>
          </div>
          <button
            onClick={copyCoordinates}
            className="flex items-center gap-1 hover:text-secondary-foreground transition-colors group"
          >
            <span>{elevation}m</span>
            <span className="text-gray-300">•</span>
            
            <span>{latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
            <svg
              className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copied && <span className="text-green-500 text-[10px]">copied!</span>}
            
            
          </button>
        </div>

        {/* Date/Time */}
        <div className="text-gray-500 text-sm font-medium mb-3">
          {formatDate(currentData.timestamp)}, {formatTime(currentData.timestamp)} {formatTimezoneUTC(timezone)}
        </div>

        {/* Metrics List */}
        <div className="space-y-0 mb-3">
          <MetricRow
            label="Temperature"
            value={Math.round(currentTemp)}
            unit={`°${temperatureUnit}`}
            percent={normalizeTemp(currentData.temperature)}
            gradient="linear-gradient(90deg, #fecaca 0%, #fca5a5 100%)"
            extra={`${Math.round(convertTemp(maxTempRaw))}° / ${Math.round(convertTemp(minTempRaw))}°`}
          />
          <MetricRow
            label="Humidity"
            value={Math.round(currentHumidity)}
            unit="%"
            percent={normalizeHumidity(currentHumidity)}
            gradient="linear-gradient(90deg, #a5f3fc 0%, #67e8f9 100%)"
            extra={`dew ${Math.round(convertTemp(currentData.dewpoint))}°`}
          />
          <MetricRow
            label="Wind"
            value={windSpeed.toFixed(1)}
            unit={windSpeedUnit}
            percent={normalizeWind(windSpeed)}
            gradient="linear-gradient(90deg, #ddd6fe 0%, #c4b5fd 100%)"
            extra={
              <>
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  style={{ transform: `rotate(${windDirection + 180}deg)` }}
                >
                  <path d="M12 2L6 12h4v10h4V12h4L12 2z" />
                </svg>
                {getWindDirectionLabel(windDirection)}
              </>
            }
          />
          <MetricRow
            label="Pressure"
            value={currentData.pressure ? Math.round(convertPressure(currentData.pressure)) : '—'}
            unit={pressureUnit}
            percent={normalizePressure(currentData.pressure)}
            gradient="linear-gradient(90deg, #fef08a 0%, #fde047 100%)"
          />
          <MetricRow
            label="Precipitation"
            value={currentPrecip.toFixed(precipitationUnit === 'in' ? 2 : 1)}
            unit={precipitationUnit}
            percent={normalizePrecip(currentPrecip)}
            gradient="linear-gradient(90deg, #bbf7d0 0%, #86efac 100%)"
          />
        </div>

        {/* Timeline */}
        <div className="pt-3">
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
