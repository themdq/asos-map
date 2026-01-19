import type { HistoricalWeatherData } from '../types/weather';

const API_BASE_URL = 'https://sfc.windbornesystems.com';

export async function fetchHistoricalWeather(stationId: string): Promise<HistoricalWeatherData> {
  try {
    const response = await fetch(`${API_BASE_URL}/historical_weather?station=${stationId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching historical weather:', error);
    throw error;
  }
}
