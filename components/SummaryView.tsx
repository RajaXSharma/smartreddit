import { RefreshCw, Copy } from 'lucide-react';

interface SummaryData {
  tldr: string[];
  quote: string;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

interface SummaryViewProps {
  data: SummaryData;
  onRegenerate: () => void;
  onCopy: () => void;
}

export function SummaryView({ data, onRegenerate, onCopy }: SummaryViewProps) {
  return (
    <div className="bg-bg-primary border border-border rounded-[8px] p-4">
      <div className="flex justify-between items-center mb-3">
        <div className="font-semibold text-sm flex items-center gap-1.5">
          <span className="w-1 h-4 bg-accent rounded-sm" />
          TL;DR
        </div>
      </div>

      <ul className="list-none p-0 m-0">
        {data.tldr.map((point, i) => (
          <li
            key={i}
            className="relative pl-4 mb-2.5 text-sm leading-relaxed before:content-['•'] before:absolute before:left-0 before:text-text-secondary before:font-bold"
          >
            {point}
          </li>
        ))}
      </ul>

      {data.quote && (
        <div className="bg-bg-secondary border-l-[3px] border-accent p-3 italic text-text-primary text-xs my-3 rounded-r">
          "{data.quote}"
        </div>
      )}

      <div className="mt-4">
        <div className="text-xs text-text-secondary mb-1.5 flex justify-between">
          <span>Sentiment Analysis</span>
          <span>Positive ({data.sentiment.positive}%)</span>
        </div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden flex">
          <div
            className="h-full bg-[#46D160]"
            style={{ width: `${data.sentiment.positive}%` }}
          />
          <div
            className="h-full bg-[#FFB000]"
            style={{ width: `${data.sentiment.neutral}%` }}
          />
          <div
            className="h-full bg-accent"
            style={{ width: `${data.sentiment.negative}%` }}
          />
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={onRegenerate}
          className="flex-1 py-2 px-3 border border-border rounded-[8px] bg-bg-primary hover:bg-bg-secondary text-text-primary text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-[18px] h-[18px]" />
          Regenerate
        </button>
        <button
          onClick={onCopy}
          className="flex-1 py-2 px-3 border border-border rounded-[8px] bg-bg-primary hover:bg-bg-secondary text-text-primary text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Copy className="w-[18px] h-[18px]" />
          Copy
        </button>
      </div>
    </div>
  );
}
