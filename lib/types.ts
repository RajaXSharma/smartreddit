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
  isStreaming?: boolean;
}

// Reddit JSON API Types
export interface RedditListing {
  kind: 'Listing';
  data: {
    children: (RedditPostChild | RedditCommentChild | RedditMoreChild)[];
  };
}

export interface RedditPostChild {
  kind: 't3';
  data: RedditPostData;
}

export interface RedditCommentChild {
  kind: 't1';
  data: RedditCommentData;
}

export interface RedditMoreChild {
  kind: 'more';
  data: { children: string[] };
}

export interface RedditPostData {
  title: string;
  selftext: string;
  subreddit_name_prefixed: string;
  author: string;
  score: number;
  upvote_ratio: number;
  num_comments: number;
  created_utc: number;
}

export interface RedditCommentData {
  author: string;
  body: string;
  score: number;
  depth: number;
  replies: '' | RedditListing;
}

export type RedditResponse = [RedditListing, RedditListing];

export type ScrapeError = 'NOT_POST_PAGE' | 'FETCH_FAILED' | 'PARSE_ERROR';

export interface ScrapeSuccess {
  success: true;
  content: ScrapedContent;
}

export interface ScrapeFailure {
  success: false;
  error: ScrapeError;
}

export type ScrapeResult = ScrapeSuccess | ScrapeFailure;

export type ApiErrorType =
  | 'INVALID_KEY'
  | 'RATE_LIMITED'
  | 'NETWORK_ERROR'
  | 'PARSE_ERROR'
  | 'QUOTA_EXCEEDED';

export interface ApiError {
  type: ApiErrorType;
  message: string;
  retryAfter?: number;
}

export type ProviderId = 'gemini';
