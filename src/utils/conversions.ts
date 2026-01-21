// Temperature conversions
export const toCelsius = (tempF: number): number => (tempF - 32) * 5 / 9;

export const convertTemperature = (tempF: number, unit: 'C' | 'F'): number => {
  return unit === 'C' ? toCelsius(tempF) : tempF;
};

// Wind speed conversions (from m/s)
export const convertWindSpeed = (speedMs: number, unit: 'kts' | 'mph'): number => {
  return unit === 'kts' ? speedMs * 1.94384 : speedMs * 2.237;
};

// Pressure conversions (from mb)
export const convertPressure = (pressureMb: number, unit: 'mb' | 'inHg'): number => {
  return unit === 'inHg' ? pressureMb * 0.02953 : pressureMb;
};

// Precipitation conversions (from mm)
export const convertPrecipitation = (precipMm: number, unit: 'mm' | 'in'): number => {
  return unit === 'in' ? precipMm / 25.4 : precipMm;
};

// Elevation conversions (from meters)
export const convertElevation = (meters: number, unit: 'mm' | 'in'): string => {
  return unit === 'in' ? `${Math.round(meters * 3.28084)}ft` : `${meters}m`;
};

// Calculate humidity from temperature and dewpoint (both in Fahrenheit)
export const calcHumidity = (tempF: number, dewpointF: number): number => {
  const temp = toCelsius(tempF);
  const dewpoint = toCelsius(dewpointF);
  const a = 17.625;
  const b = 243.04;
  const rh = 100 * Math.exp((a * dewpoint) / (b + dewpoint)) / Math.exp((a * temp) / (b + temp));
  return Math.min(100, Math.max(0, rh));
};

// Calculate wind speed and direction from components
export const calcWind = (windX: number, windY: number) => {
  const speedMs = Math.sqrt(windX ** 2 + windY ** 2);
  const direction = (Math.atan2(windY, windX) * 180 / Math.PI + 360) % 360;
  return { speedMs, direction };
};

// Get wind direction label from degrees
export const getWindDirectionLabel = (degrees: number): string => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(degrees / 45) % 8];
};

// Haversine distance between two points (returns km)
export const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
