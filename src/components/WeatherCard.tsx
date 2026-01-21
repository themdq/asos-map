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
  windSpeedUnit?: 'kts' | 'mph';
  pressureUnit?: 'mb' | 'inHg';
  precipitationUnit?: 'mm' | 'in';
  isFavorite?: boolean;
  onToggleFavorite?: (stationId: string) => void;
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
  windSpeedUnit = 'kts',
  pressureUnit = 'mb',
  precipitationUnit = 'mm',
  isFavorite = false,
  onToggleFavorite
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
        <div className="bg-primary border border-border rounded-[5px] p-4 shadow-lg">
          <div className="flex items-center justify-start text-muted-foreground text-sm">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (weatherData.length === 0) {
    return (
      <div className="w-full">
        <div className="bg-primary border border-border rounded-[5px] p-4 shadow-lg">
          <h2 className="text-base font-semibold text-graphit leading-tight mb-1">
            {stationName}
          </h2>
          <div className="text-muted-foreground text-xs space-y-0.5 mb-3">
            <div className="flex items-center gap-1">
              <span>{stationId}</span>
              <span className="text-border">•</span>
              <span>{network.split('_')[0]}</span>
            </div>
            <button
              onClick={copyCoordinates}
              className="flex items-center gap-1 hover:text-secondary-foreground transition-colors group"
            >
              <span>{precipitationUnit === 'in' ? `${Math.round(elevation * 3.28084)}ft` : `${elevation}m`}</span>
              <span className="text-border">•</span>
              <span>{latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
              <svg
                className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copied && <span className="text-secondary-foreground text-[10px]">copied!</span>}
            </button>
          </div>
          <div className="text-muted-foreground text-sm text-center py-4">
            No weather data available
          </div>
        </div>
      </div>
    );
  }

  // Функции конвертации
  const convertTemp = (tempF: number) => {
    return temperatureUnit === 'C' ? (tempF - 32) * 5/9 : tempF;
  };

  const toCelsius = (tempF: number) => (tempF - 32) * 5/9;

  const convertWindSpeed = (speedMs: number) => {
    return windSpeedUnit === 'kts' ? speedMs * 1.94384 : speedMs * 2.237;
  };

  const convertPressure = (pressureMb: number) => {
    return pressureUnit === 'inHg' ? pressureMb * 0.02953 : pressureMb;
  };

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
    if (p === null) return 0;
    if (maxPressure === minPressure) return 50;
    return ((p - minPressure) / (maxPressure - minPressure)) * 100;
  };

  const normalizePrecip = (p: number) => {
    return (p / maxPrecip) * 100;
  };

  // Градиент для температуры: холодные цвета для низких, тёплые для высоких
  const getTemperatureGradient = (tempF: number) => {
    const tempC = toCelsius(tempF);
    if (tempC < 5) {
      // Очень холодно — сине-голубой
      return 'linear-gradient(90deg, hsla(200, 45%, 65%, 1) 0%, hsla(210, 50%, 55%, 1) 100%)';
    } else if (tempC < 15) {
      // Прохладно — голубовато-серый
      return 'linear-gradient(90deg, hsla(180, 30%, 70%, 1) 0%, hsla(195, 35%, 60%, 1) 100%)';
    } else if (tempC < 25) {
      // Тепло — жёлто-оранжевый
      return 'linear-gradient(90deg, hsla(43, 60%, 67%, 1) 0%, hsla(28, 49%, 56%, 1) 100%)';
    } else {
      // Жарко — оранжево-красный
      return 'linear-gradient(90deg, hsla(28, 55%, 58%, 1) 0%, hsla(15, 50%, 50%, 1) 100%)';
    }
  };

  // Градиент в цветах сайта
  const defaultGradient = 'linear-gradient(90deg, hsla(74, 29%, 74%, 1) 0%, hsla(51, 57%, 70%, 1) 100%)';

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
          <div className="text-muted-foreground text-xs uppercase">{label}</div>
          <div className="text-muted-foreground text-xs flex items-center gap-1">
            {value} {unit} {extra && <span className="text-muted-foreground flex items-center gap-0.5">{extra}</span>}
          </div>
        </div>
        <div className="w-32 h-3 bg-border rounded-full overflow-hidden">
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

  // Определяем тип погоды на основе данных
  const getWeatherCondition = () => {
    const tempC = toCelsius(currentData.temperature);
    const humidity = currentHumidity;
    const precip = currentData.precip;
    const dewpointDiff = Math.abs(toCelsius(currentData.temperature) - toCelsius(currentData.dewpoint));

    // Осадки
    if (precip > 0.1) {
      if (tempC <= 0) return 'snow';
      return 'rain';
    }

    // Туман (температура очень близка к точке росы)
    if (dewpointDiff < 2.5 && humidity > 90) {
      return 'fog';
    }

    // Сильный ветер
    if (windSpeedMs > 10) {
      return 'windy';
    }

    // Облачно (высокая влажность)
    if (humidity > 80) {
      return 'cloudy';
    }

    // Переменная облачность
    if (humidity > 50) {
      return 'partly-cloudy';
    }

    // Ясно/Солнечно
    return 'sunny';
  };

  const weatherCondition = getWeatherCondition();

  // Иконки погоды
  const WeatherIcon = ({ condition }: { condition: string }) => {
    const iconClass = "w-8 h-8 text-secondary-foreground";

    switch (condition) {
      case 'sunny':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        );
      case 'partly-cloudy':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <circle cx="8" cy="8" r="3" />
            <path d="M8 2v1M8 13v1M3 8H2M14 8h-1M4.5 4.5l.7.7M11.5 11.5l-.7-.7M4.5 11.5l.7-.7M11.5 4.5l-.7.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M18 17a4 4 0 00-8 0 3 3 0 00.1 6H18a3 3 0 000-6z" />
          </svg>
        );
      case 'cloudy':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 17a4 4 0 00-8 0 3.5 3.5 0 00.2 7H19a3.5 3.5 0 000-7z" />
            <path d="M13 12a3 3 0 00-6 0 2.5 2.5 0 000 5h3" opacity="0.5" />
          </svg>
        );
      case 'rain':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 13a4 4 0 00-8 0 3 3 0 00.1 6H18a3 3 0 000-6z" />
            <path d="M8 19v3M12 19v3M16 19v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        );
      case 'snow':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 10a4 4 0 00-8 0 3 3 0 00.1 6H18a3 3 0 000-6z" />
            <circle cx="8" cy="20" r="1" />
            <circle cx="12" cy="22" r="1" />
            <circle cx="16" cy="20" r="1" />
            <circle cx="10" cy="18" r="1" />
            <circle cx="14" cy="18" r="1" />
          </svg>
        );
      case 'fog':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 10h16M4 14h16M6 18h12M8 6h8" />
          </svg>
        );
      case 'windy':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9.59 4.59A2 2 0 1111 8H2M12.59 19.41A2 2 0 1014 16H2M17.73 7.73A2.5 2.5 0 1119.5 12H2" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <div className="bg-primary border border-border rounded-[5px] shadow-lg text-graphit p-4 relative">
        {/* Weather Icon */}
        <div className="absolute top-3 right-3">
          <WeatherIcon condition={weatherCondition} />
        </div>

        {/* Header: Name + Favorite */}
        <div className="flex items-start gap-2 mb-1 pr-10">
          <h2 className="text-base font-semibold text-graphit leading-tight">
            {stationName}
          </h2>
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(stationId)}
              className="shrink-0 p-0.5 -mt-0.5 text-secondary-foreground hover:text-secondary-foreground transition-colors cursor-pointer"
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill={isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={2}
              >
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
          <button
            onClick={copyCoordinates}
            className="flex items-center gap-1 hover:text-secondary-foreground transition-colors group"
          >
            <span>{precipitationUnit === 'in' ? `${Math.round(elevation * 3.28084)}ft` : `${elevation}m`}</span>
            <span className="text-border">•</span>
            
            <span>{latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
            <svg
              className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copied && <span className="text-secondary-foreground text-[10px]">copied!</span>}
            
            
          </button>
        </div>

        {/* Date/Time */}
        <div className="text-muted-foreground text-sm font-medium mb-3">
          {formatDate(currentData.timestamp)}, {formatTime(currentData.timestamp)} {formatTimezoneUTC(timezone)}
        </div>

        {/* Metrics List */}
        <div className="space-y-0 mb-3">
          <MetricRow
            label="Temperature"
            value={Math.round(currentTemp)}
            unit={`°${temperatureUnit}`}
            percent={normalizeTemp(currentData.temperature)}
            gradient={getTemperatureGradient(currentData.temperature)}
            extra={`${Math.round(convertTemp(maxTempRaw))}° / ${Math.round(convertTemp(minTempRaw))}°`}
          />
          <MetricRow
            label="Humidity"
            value={Math.round(currentHumidity)}
            unit="%"
            percent={normalizeHumidity(currentHumidity)}
            gradient={defaultGradient}
            extra={`dew ${Math.round(convertTemp(currentData.dewpoint))}°`}
          />
          <MetricRow
            label="Wind"
            value={windSpeed.toFixed(1)}
            unit={windSpeedUnit}
            percent={normalizeWind(windSpeed)}
            gradient={defaultGradient}
            extra={
              <>
                {getWindDirectionLabel(windDirection)}
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  style={{ transform: `rotate(${windDirection + 180}deg)` }}
                >
                  <path d="M12 2L6 12h4v10h4V12h4L12 2z" />
                </svg>
              </>
            }
          />
          <MetricRow
            label="Pressure"
            value={currentData.pressure
              ? (pressureUnit === 'inHg'
                  ? convertPressure(currentData.pressure).toFixed(2)
                  : Math.round(convertPressure(currentData.pressure)))
              : '—'}
            unit={pressureUnit}
            percent={normalizePressure(currentData.pressure)}
            gradient={defaultGradient}
          />
          <MetricRow
            label="Precipitation"
            value={currentPrecip.toFixed(precipitationUnit === 'in' ? 2 : 1)}
            unit={precipitationUnit}
            percent={normalizePrecip(currentPrecip)}
            gradient={defaultGradient}
          />
        </div>

        {/* Timeline */}
        <div className="pt-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted-foreground text-[10px]">
              {formatDate(weatherData[0].timestamp)}
            </span>
            <span className="text-muted-foreground text-[10px] font-medium">
              {weatherData.length} time points
            </span>
            <span className="text-muted-foreground text-[10px]">
              {formatDate(weatherData[weatherData.length - 1].timestamp)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={weatherData.length - 1}
            value={currentIndex}
            onChange={(e) => setSelectedIndex(Number(e.target.value))}
            className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-secondary-foreground"
          />
        </div>
      </div>
    </div>
  );
}
