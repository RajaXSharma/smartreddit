import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getPostCache } from '../lib/storage';

export function useHydrateCache(postUrl: string | null) {
  const queryClient = useQueryClient();
  const hydratedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!postUrl || hydratedRef.current.has(postUrl)) return;

    const hydrate = async () => {
      const cached = await getPostCache(postUrl);
      if (!cached) return;

      if (cached.summary) {
        queryClient.setQueryData(['summary', postUrl], cached.summary);
      }

      if (cached.chat.length > 0) {
        queryClient.setQueryData(['chat', postUrl], cached.chat);
      }

      hydratedRef.current.add(postUrl);
    };

    hydrate();
  }, [postUrl, queryClient]);
}
