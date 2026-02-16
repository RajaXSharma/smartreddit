import { useQuery } from '@tanstack/react-query';
import { fetchSummary } from '../lib/api';
import type { ScrapedContent } from '../lib/types';

export function useSummaryQuery(postUrl: string, content: ScrapedContent | null) {
  return useQuery({
    queryKey: ['summary', postUrl],
    queryFn: () => fetchSummary(content!),
    enabled: !!content,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
