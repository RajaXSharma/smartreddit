interface PostInfoProps {
  subreddit: string;
  author: string;
  timestamp: string;
  title: string;
  upvotes: string;
  comments: string;
  upvoteRatio: string;
  avatarUrl?: string;
}

export function PostInfo({
  subreddit,
  author,
  timestamp,
  title,
  upvotes,
  comments,
  upvoteRatio,
}: PostInfoProps) {
  return (
    <div className="flex flex-col gap-3 mb-5 pb-5 border-b border-border">
      <div className="flex items-center gap-2.5">
        <div className="w-[50px] h-[50px] rounded-full bg-gradient-to-br from-accent to-[#FF8717] p-0.5 relative">
          <div className="absolute inset-0.5 bg-bg-primary rounded-full" />
          <div className="absolute inset-1 bg-accent/20 rounded-full flex items-center justify-center">
            <span className="text-accent font-bold text-lg">r/</span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{subreddit}</span>
          <span className="text-xs text-text-secondary">
            Posted by u/{author} • {timestamp}
          </span>
        </div>
      </div>

      <div className="text-sm leading-relaxed">{title}</div>

      <div className="flex justify-around py-3 border-t border-b border-border mt-2">
        <div className="flex flex-col items-center">
          <span className="font-semibold text-sm">{upvotes}</span>
          <span className="text-xs text-text-secondary">upvotes</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-semibold text-sm">{comments}</span>
          <span className="text-xs text-text-secondary">comments</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-semibold text-sm">{upvoteRatio}</span>
          <span className="text-xs text-text-secondary">upvoted</span>
        </div>
      </div>
    </div>
  );
}
