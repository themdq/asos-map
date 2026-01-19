import type { Station } from '../types/station';

export async function fetchStations(): Promise<Station[]> {
  try {
    // Замените на ваш API
      const response = await fetch('https://sfc.windbornesystems.com/stations');
      const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching stations:', error);
    throw error;
  }
}
