import type { HistoricalWeatherData } from '../types/weather';

const API_BASE_URL = 'https://sfc.windbornesystems.com';

export async function fetchHistoricalWeather(stationId: string): Promise<HistoricalWeatherData> {
  try {
    const response = await fetch(`${API_BASE_URL}/historical_weather?station=${stationId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    let text = await response.text();

    // Workaround: сервер иногда возвращает некорректный JSON
    // Находим начало JSON объекта
    const jsonStart = text.indexOf('{');
    if (jsonStart > 0) {
      text = text.substring(jsonStart);
    }

    // Проверяем закрывающую скобку
    const trimmed = text.trim();
    if (!trimmed.endsWith('}')) {
      // Пытаемся найти последнюю полную структуру
      const lastBrace = text.lastIndexOf('}');
      if (lastBrace > 0) {
        text = text.substring(0, lastBrace + 1);
      } else {
        text = text + '}';
      }
    }

    const data = JSON.parse(text);
    return data;
  } catch (error) {
    console.error('Error fetching historical weather:', error);
    throw error;
  }
}
