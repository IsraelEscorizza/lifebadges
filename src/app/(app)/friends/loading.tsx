export default function FriendsLoading() {
  return (
    <div className="pt-4 space-y-4 animate-pulse">
      <div className="h-7 w-20 bg-white/10 rounded-lg" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 border border-white/8 rounded-2xl">
          <div className="h-10 w-10 bg-white/10 rounded-full flex-shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3.5 w-28 bg-white/10 rounded" />
            <div className="h-3 w-20 bg-white/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
