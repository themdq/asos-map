import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, persister } from '../lib/queryClient';
import WeatherStationsMap from './WeatherStationsMap';

export default function QueryProvider() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 }}
    >
      <WeatherStationsMap />
    </PersistQueryClientProvider>
  );
}
