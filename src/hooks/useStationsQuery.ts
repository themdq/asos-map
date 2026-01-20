// src/hooks/useStationsQuery.ts
import { useQuery } from '@tanstack/react-query';
import { fetchStations } from '@/api/stations';

export function useStationsQuery() {
  return useQuery({
    queryKey: ['stations'],
    queryFn: fetchStations,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });
}