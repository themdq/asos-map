import { useState, useMemo } from 'react';
import type { WeatherPoint } from '../types/weather';
import {
  convertTemperature,
  convertWindSpeed,
  convertPressure,
  convertPrecipitation,
  convertElevation,
  calcHumidity,
  calcWind,
  getWindDirectionLabel,
  toCelsius,
} from '../utils/conversions';
import { MetricRow } from './MetricRow';
import { WeatherIcon, type WeatherCondition } from './WeatherIcon';

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
  windSpeedUnit?: 'kts' | 'mph';
  pressureUnit?: 'mb' | 'inHg';
  precipitationUnit?: 'mm' | 'in';
  isFavorite?: boolean;
  onToggleFavorite?: (stationId: string) => void;
  onClose?: () => void;
}

// Temperature gradient based on Celsius value
const getTemperatureGradient = (tempC: number): string => {
  if (tempC < 0) return 'linear-gradient(90deg, #1e40af 0%, #3b82f6 100%)';
  if (tempC < 10) return 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)';
  if (tempC < 20) return 'linear-gradient(90deg, #eab308 0%, #fde047 100%)';
  if (tempC < 30) return 'linear-gradient(90deg, #ea580c 0%, #fb923c 100%)';
  return 'linear-gradient(90deg, #dc2626 0%, #f87171 100%)';
};

const defaultGradient = 'linear-gradient(90deg, hsla(74, 29%, 74%, 1) 0%, hsla(51, 57%, 70%, 1) 100%)';

const formatTime = (timestamp: string): string =>
  new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

const formatDate = (timestamp: string): string =>
  new Date(timestamp).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

const formatTimezoneUTC = (tz: string): string => {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'shortOffset',
    });
    const parts = formatter.formatToParts(new Date());
    return parts.find((p) => p.type === 'timeZoneName')?.value || tz;
  } catch {
    return tz;
  }
};

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
  windSpeedUnit = 'kts',
  pressureUnit = 'mb',
  precipitationUnit = 'mm',
  isFavorite = false,
  onToggleFavorite,
  onClose,
}: WeatherCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const currentIndex = Math.min(selectedIndex ?? weatherData.length - 1, weatherData.length - 1);

  const copyCoordinates = async () => {
    await navigator.clipboard.writeText(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Memoized calculations
  const calculations = useMemo(() => {
    if (weatherData.length === 0) return null;

    const temperatures = weatherData.map((d) => d.temperature ?? 0).filter((t) => t !== 0);
    const minTempRaw = temperatures.length > 0 ? Math.min(...temperatures) : 0;
    const maxTempRaw = temperatures.length > 0 ? Math.max(...temperatures) : 0;

    const winds = weatherData.map((d) => convertWindSpeed(calcWind(d.wind_x ?? 0, d.wind_y ?? 0).speedMs, windSpeedUnit));
    const maxWind = Math.max(...winds, 0);

    const pressures = weatherData.filter((d) => d.pressure != null).map((d) => d.pressure as number);
    const minPressure = pressures.length > 0 ? Math.min(...pressures) : 0;
    const maxPressure = pressures.length > 0 ? Math.max(...pressures) : 1;

    const precips = weatherData.map((d) => convertPrecipitation(d.precip ?? 0, precipitationUnit));
    const maxPrecip = Math.max(...precips, 0.1);

    return { minTempRaw, maxTempRaw, maxWind, minPressure, maxPressure, maxPrecip };
  }, [weatherData, windSpeedUnit, precipitationUnit]);

  // Loading state
  if (loading) {
    return (
      <div className="w-full">
        <div className="bg-primary border border-border rounded-[5px] p-4 shadow-lg">
          <div className="flex items-center justify-start text-muted-foreground text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  // Empty state
  if (weatherData.length === 0 || !calculations) {
    return (
      <div className="w-full">
        <div className="bg-primary border border-border rounded-[5px] p-4 shadow-lg relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-muted-foreground hover:text-secondary-foreground transition-colors"
              aria-label="Close weather card"
              title="Close"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
          <h2 className="text-base font-semibold text-graphit leading-tight mb-1">{stationName}</h2>
          <div className="text-muted-foreground text-xs space-y-0.5 mb-3">
            <div className="flex items-center gap-1">
              <span>{stationId}</span>
              <span className="text-border">•</span>
              <span>{network.split('_')[0]}</span>
            </div>
            <button onClick={copyCoordinates} className="flex items-center gap-1 hover:text-secondary-foreground transition-colors group">
              <span>{convertElevation(elevation, precipitationUnit)}</span>
              <span className="text-border">•</span>
              <span>{latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
              {copied && <span className="text-secondary-foreground text-[10px]">copied!</span>}
            </button>
          </div>
          <div className="text-muted-foreground text-sm text-center py-4">No weather data available</div>
        </div>
      </div>
    );
  }

  const currentData = weatherData[currentIndex];
  if (!currentData) return null;

  const { minTempRaw, maxTempRaw, maxWind, minPressure, maxPressure, maxPrecip } = calculations;

  // Current values (with null safety)
  const wind = calcWind(currentData.wind_x ?? 0, currentData.wind_y ?? 0);
  const windSpeed = convertWindSpeed(wind.speedMs, windSpeedUnit);
  const currentTemp = convertTemperature(currentData.temperature ?? 0, temperatureUnit);
  const currentHumidity = calcHumidity(currentData.temperature ?? 0, currentData.dewpoint ?? 0);
  const currentPrecip = convertPrecipitation(currentData.precip ?? 0, precipitationUnit);

  // Normalization helpers
  const normalizeTemp = (tempF: number) => {
    if (maxTempRaw === minTempRaw) return 50;
    return ((tempF - minTempRaw) / (maxTempRaw - minTempRaw)) * 100;
  };

  const normalizeWind = (w: number) => (maxWind === 0 ? 0 : (w / maxWind) * 100);

  const normalizePressure = (p: number | null) => {
    if (p === null) return 0;
    if (maxPressure === minPressure) return 50;
    return ((p - minPressure) / (maxPressure - minPressure)) * 100;
  };

  // Weather condition
  const getWeatherCondition = (): WeatherCondition => {
    const tempC = toCelsius(currentData.temperature ?? 0);
    const dewpointDiff = Math.abs(tempC - toCelsius(currentData.dewpoint ?? 0));

    if ((currentData.precip ?? 0) > 0.1) return tempC <= 0 ? 'snow' : 'rain';
    if (dewpointDiff < 2.5 && currentHumidity > 90) return 'fog';
    if (wind.speedMs > 10) return 'windy';
    if (currentHumidity > 80) return 'cloudy';
    if (currentHumidity > 50) return 'partly-cloudy';
    return 'sunny';
  };

  return (
    <div className="w-full">
      <div className="bg-primary border border-border rounded-[5px] shadow-lg text-graphit p-4 relative">
        {/* Weather Icon + Close */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <WeatherIcon condition={getWeatherCondition()} />
          {onClose && (
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-secondary-foreground transition-colors"
              aria-label="Close weather card"
              title="Close"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Header */}
        <div className="flex items-start gap-2 mb-1 pr-10">
          <h2 className="text-base font-semibold text-graphit leading-tight">{stationName}</h2>
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(stationId)}
              className="shrink-0 p-0.5 -mt-0.5 text-secondary-foreground hover:text-secondary-foreground transition-colors cursor-pointer"
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          )}
        </div>

        {/* Station info */}
        <div className="text-muted-foreground text-xs space-y-0.5 mb-3">
          <div className="flex items-center gap-1">
            <span>{stationId}</span>
            <span className="text-border">•</span>
            <span>{network.split('_')[0]}</span>
          </div>
          <button onClick={copyCoordinates} className="flex items-center gap-1 hover:text-secondary-foreground transition-colors group">
            <span>{convertElevation(elevation, precipitationUnit)}</span>
            <span className="text-border">•</span>
            <span>{latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
            <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copied && <span className="text-secondary-foreground text-[10px]">copied!</span>}
          </button>
        </div>

        {/* Date/Time */}
        <div className="text-muted-foreground text-sm font-medium mb-3">
          {formatDate(currentData.timestamp)}, {formatTime(currentData.timestamp)} {formatTimezoneUTC(timezone)}
        </div>

        {/* Metrics */}
        <div className="space-y-0 mb-3">
          <MetricRow
            label="Temperature"
            value={Math.round(currentTemp)}
            unit={`°${temperatureUnit}`}
            percent={normalizeTemp(currentData.temperature ?? 0)}
            gradient={getTemperatureGradient(toCelsius(currentData.temperature ?? 0))}
            extra={`${Math.round(convertTemperature(maxTempRaw, temperatureUnit))}° / ${Math.round(convertTemperature(minTempRaw, temperatureUnit))}°`}
          />
          <MetricRow
            label="Humidity"
            value={Math.round(currentHumidity)}
            unit="%"
            percent={currentHumidity}
            gradient={defaultGradient}
            extra={`dew ${Math.round(convertTemperature(currentData.dewpoint ?? 0, temperatureUnit))}°`}
          />
          <MetricRow
            label="Wind"
            value={windSpeed.toFixed(1)}
            unit={windSpeedUnit}
            percent={normalizeWind(windSpeed)}
            gradient={defaultGradient}
            extra={
              <>
                {getWindDirectionLabel(wind.direction)}
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" style={{ transform: `rotate(${wind.direction + 180}deg)` }}>
                  <path d="M12 2L6 12h4v10h4V12h4L12 2z" />
                </svg>
              </>
            }
          />
          <MetricRow
            label="Pressure"
            value={currentData.pressure ? (pressureUnit === 'inHg' ? convertPressure(currentData.pressure, pressureUnit).toFixed(2) : Math.round(convertPressure(currentData.pressure, pressureUnit))) : '—'}
            unit={pressureUnit}
            percent={normalizePressure(currentData.pressure)}
            gradient={defaultGradient}
          />
          <MetricRow
            label="Precipitation"
            value={currentPrecip.toFixed(precipitationUnit === 'in' ? 2 : 1)}
            unit={precipitationUnit}
            percent={(currentPrecip / maxPrecip) * 100}
            gradient={defaultGradient}
          />
        </div>

        {/* Timeline */}
        <div className="pt-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted-foreground text-[10px]">{formatDate(weatherData[0].timestamp)}</span>
            <span className="text-muted-foreground text-[10px] font-medium">{weatherData.length} time points</span>
            <span className="text-muted-foreground text-[10px]">{formatDate(weatherData[weatherData.length - 1].timestamp)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={weatherData.length - 1}
            value={currentIndex}
            onChange={(e) => setSelectedIndex(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
