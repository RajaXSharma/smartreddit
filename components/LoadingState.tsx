export function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="bg-bg-primary border border-border rounded-[8px] p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-1 h-4 bg-border rounded-sm animate-pulse" />
          <div className="h-4 w-16 bg-border rounded animate-pulse" />
        </div>
        <div className="space-y-2.5">
          <div className="h-4 bg-border rounded animate-pulse" />
          <div className="h-4 bg-border rounded animate-pulse w-[90%]" />
          <div className="h-4 bg-border rounded animate-pulse w-[80%]" />
        </div>
        <div className="h-16 bg-border rounded mt-3 animate-pulse" />
        <div className="flex gap-2 mt-4">
          <div className="flex-1 h-9 bg-border rounded-[8px] animate-pulse" />
          <div className="flex-1 h-9 bg-border rounded-[8px] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
