import type {
  ScrapedContent,
  Comment,
  RedditResponse,
  RedditPostData,
  RedditCommentChild,
  RedditListing,
} from './types';

export function formatRelativeTime(utcSeconds: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - utcSeconds;

  if (diff < 60) {
    return 'just now';
  } else if (diff < 3600) {
    const mins = Math.floor(diff / 60);
    return `${mins}m ago`;
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours}h ago`;
  } else if (diff < 604800) {
    const days = Math.floor(diff / 86400);
    return `${days}d ago`;
  } else if (diff < 2592000) {
    const weeks = Math.floor(diff / 604800);
    return `${weeks}w ago`;
  } else if (diff < 31536000) {
    const months = Math.floor(diff / 2592000);
    return `${months}mo ago`;
  } else {
    const years = Math.floor(diff / 31536000);
    return `${years}y ago`;
  }
}

function parsePost(postData: RedditPostData): Omit<ScrapedContent, 'comments'> {
  const body = postData.selftext === '[deleted]' || postData.selftext === '[removed]'
    ? ''
    : postData.selftext;

  return {
    title: postData.title,
    body,
    subreddit: postData.subreddit_name_prefixed,
    author: postData.author,
    timestamp: formatRelativeTime(postData.created_utc),
    upvotes: postData.score,
    commentCount: postData.num_comments,
    upvoteRatio: Math.round(postData.upvote_ratio * 100),
  };
}

function flattenComments(
  children: (RedditCommentChild | { kind: 'more' })[],
  result: Comment[]
): void {
  for (const child of children) {
    if (child.kind !== 't1') continue;

    const data = child.data;
    result.push({
      author: data.author,
      text: data.body,
      score: data.score,
      depth: data.depth,
    });

    if (data.replies && typeof data.replies === 'object') {
      flattenComments(
        data.replies.data.children as (RedditCommentChild | { kind: 'more' })[],
        result
      );
    }
  }
}

function parseComments(commentListing: RedditListing): Comment[] {
  const result: Comment[] = [];
  flattenComments(
    commentListing.data.children as (RedditCommentChild | { kind: 'more' })[],
    result
  );
  return result;
}
