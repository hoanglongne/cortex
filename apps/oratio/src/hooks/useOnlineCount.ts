import useSWR from 'swr';
import { getOnlineLearnersCount } from '@/actions/stats';

// SWR fetcher wrapper
const onlineCountFetcher = () => getOnlineLearnersCount();

export function useOnlineCount() {
    const { data, error, isLoading } = useSWR(
        'online-count',
        onlineCountFetcher,
        {
            refreshInterval: 5000, // Refresh every 5 seconds for real-time feel
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 3000, // Cache for 3 seconds
        }
    );

    return {
        count: data?.count || 0,
        error: data?.error || error,
        isLoading,
    };
}
