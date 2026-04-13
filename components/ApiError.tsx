import { AlertCircle, RefreshCw, Settings } from 'lucide-react';
import type { ApiError as ApiErrorType } from '../lib/types';
import { useUIStore } from '../hooks/useUIStore';

interface ApiErrorProps {
  error: ApiErrorType;
  onRetry?: () => void;
}

export function ApiError({ error, onRetry }: ApiErrorProps) {
  const { toggleSettings } = useUIStore();

  const showSettings = error.type === 'INVALID_KEY' || error.type === 'QUOTA_EXCEEDED';
  const showRetry = error.type === 'NETWORK_ERROR' || error.type === 'PARSE_ERROR' || error.type === 'RATE_LIMITED';

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4 text-center">
      <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
        <AlertCircle className="w-5 h-5 text-red-500" />
      </div>
      <p className="text-sm text-text-secondary">{error.message}</p>

      <div className="flex gap-2">
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-bg-secondary rounded-lg hover:opacity-80 transition-opacity"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        )}
        {showSettings && (
          <button
            onClick={toggleSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-accent text-white rounded-lg hover:opacity-80 transition-opacity"
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </button>
        )}
      </div>
    </div>
  );
}
