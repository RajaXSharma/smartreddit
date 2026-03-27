import { useState, useEffect, useCallback } from 'react';
import type { ScrapedContent, ScrapeError } from '../lib/types';

interface UseRedditContentResult {
  content: ScrapedContent | null;
  isLoading: boolean;
  error: ScrapeError | null;
  refetch: () => void;
}

export function useRedditContent(): UseRedditContentResult {
  const [content, setContent] = useState<ScrapedContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ScrapeError | null>(null);

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        setError('FETCH_FAILED');
        setIsLoading(false);
        return;
      }

      const response = await browser.tabs.sendMessage(tab.id, { type: 'GET_CONTENT' });

      if (response.success) {
        setContent(response.content);
        setError(null);
      } else {
        setError(response.error);
        setContent(null);
      }
    } catch (err) {
      setError('FETCH_FAILED');
      setContent(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return { content, isLoading, error, refetch: fetchContent };
}
