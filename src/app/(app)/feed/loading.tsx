export default function FeedLoading() {
  return (
    <div className="space-y-4 pt-4 animate-pulse">
      <div className="h-7 w-16 bg-white/10 rounded-lg" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white/5 border border-white/8 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white/10 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 w-32 bg-white/10 rounded" />
              <div className="h-3 w-24 bg-white/5 rounded" />
            </div>
          </div>
          <div className="h-16 bg-white/5 rounded-xl" />
          <div className="h-2 bg-white/5 rounded-full" />
        </div>
      ))}
    </div>
  );
}
