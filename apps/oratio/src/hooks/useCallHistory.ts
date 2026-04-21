import useSWR from 'swr';
import { getCallHistory } from '@/actions/matchmaking';

// SWR fetcher wrapper
const callHistoryFetcher = () => getCallHistory(30);

export function useCallHistory() {
  const { data, error, isLoading, mutate } = useSWR(
    'call-history',
    callHistoryFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 10000, // Cache for 10 seconds
    }
  );

  return {
    sessions: data?.sessions || [],
    error: data?.error || error,
    isLoading,
    refresh: mutate,
  };
}

// Prefetch function to warm up cache
export function prefetchCallHistory() {
  // This will trigger SWR to fetch and cache the data
  return getCallHistory(30);
}
