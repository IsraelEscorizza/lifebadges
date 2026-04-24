export default function GroupsLoading() {
  return (
    <div className="pt-4 space-y-4 animate-pulse">
      <div className="h-7 w-24 bg-white/10 rounded-lg" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 border border-white/8 rounded-2xl">
          <div className="h-12 w-12 bg-white/10 rounded-xl flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-32 bg-white/10 rounded" />
            <div className="h-3 w-20 bg-white/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
