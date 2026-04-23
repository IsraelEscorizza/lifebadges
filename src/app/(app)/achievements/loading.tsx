export default function AchievementsLoading() {
  return (
    <div className="pt-4 space-y-4 animate-pulse">
      <div className="h-7 w-32 bg-white/10 rounded-lg" />
      <div className="flex gap-2 overflow-x-hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-9 w-24 bg-white/10 rounded-full flex-shrink-0" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-28 bg-white/5 border border-white/8 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
