import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSummary } from '../lib/api';
import { saveSummary } from '../lib/storage';
import type { ScrapedContent } from '../lib/types';

export function useSummaryQuery(postUrl: string, content: ScrapedContent | null) {
  const query = useQuery({
    queryKey: ['summary', postUrl],
    queryFn: () => fetchSummary(content!),
    enabled: !!content,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
  });

  useEffect(() => {
    if (query.data && query.isSuccess && !query.isFetching) {
      saveSummary(postUrl, query.data);
    }
  }, [query.data, query.isSuccess, query.isFetching, postUrl]);

  return query;
}
