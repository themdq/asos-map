// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min — данные считаются свежими
      gcTime: 1000 * 60 * 60 * 24, // 24 часа — хранить в памяти/storage
      retry: 2,
      refetchOnWindowFocus: false,
    }
  }
});

// Persister для localStorage
export const persister = createAsyncStoragePersister({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  key: 'asos-map-cache',
});
