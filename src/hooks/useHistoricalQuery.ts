import { useQuery } from '@tanstack/react-query';
import { fetchHistoricalWeather } from '@/api/weather';

export function useHistoricalQuery(stationId?: string) {
  return useQuery({
    queryKey: ['historical', stationId],
    queryFn: () => fetchHistoricalWeather(stationId!),
    enabled: !!stationId,
    staleTime: 60_000,
    gcTime: 15 * 60_000,
  });
}