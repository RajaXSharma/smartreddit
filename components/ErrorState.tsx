import { AlertCircle, RefreshCw } from 'lucide-react';
import type { ScrapeError } from '../lib/types';

interface ErrorStateProps {
  error: ScrapeError;
  onRetry: () => void;
}

const errorMessages: Record<ScrapeError, { title: string; description: string; showRetry: boolean }> = {
  NOT_POST_PAGE: {
    title: 'No post detected',
    description: 'Navigate to a Reddit post to get started.',
    showRetry: false,
  },
  FETCH_FAILED: {
    title: 'Failed to load',
    description: 'Could not fetch post data. Please try again.',
    showRetry: true,
  },
  PARSE_ERROR: {
    title: 'Something went wrong',
    description: 'Could not parse post data. Please try again.',
    showRetry: true,
  },
};

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const { title, description, showRetry } = errorMessages[error];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <AlertCircle className="w-12 h-12 text-text-secondary mb-4" />
      <h3 className="font-semibold text-base mb-2">{title}</h3>
      <p className="text-sm text-text-secondary mb-4">{description}</p>
      {showRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-[8px] font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      )}
    </div>
  );
}
