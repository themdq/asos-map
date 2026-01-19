import type { Station } from '../types/station';

const API_BASE_URL = 'https://sfc.windbornesystems.com';

export async function fetchStations(): Promise<Station[]> {
  try {
      const response = await fetch(`${API_BASE_URL}/stations`);
      const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching stations:', error);
    throw error;
  }
}
