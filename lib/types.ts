export interface ScrapedContent {
  title: string;
  body: string;
  subreddit: string;
  author: string;
  timestamp: string;
  upvotes: number;
  commentCount: number;
  upvoteRatio: number;
  comments: Comment[];
}

export interface Comment {
  author: string;
  text: string;
  score: number;
  depth: number;
}

export interface SummaryResponse {
  tldr: string[];
  quote: string;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
