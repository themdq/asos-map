import type { Station } from '../types/station';

const API_BASE_URL = 'https://sfc.windbornesystems.com';

export async function fetchStations(): Promise<Station[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/stations`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    let text = await response.text();

    // Workaround: server sometimes returns truncated JSON without a closing brace
    const trimmed = text.trim();
    if (!trimmed.endsWith(']')) {
      // Try to find the last complete object and close the array
      const lastCompleteObject = text.lastIndexOf('}');
      if (lastCompleteObject > 0) {
        text = text.substring(0, lastCompleteObject + 1) + ']';
      }
    }

    const data = JSON.parse(text);
    return data;
  } catch (error) {
    console.error('Error fetching stations:', error);
    throw error;
  }
}
