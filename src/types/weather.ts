export interface WeatherPoint {
  timestamp: string;
  temperature: number;
  wind_x: number;
  wind_y: number;
  dewpoint: number;
  pressure: number | null;
  precip: number;
}

export interface HistoricalWeatherData {
  points: WeatherPoint[];
}
