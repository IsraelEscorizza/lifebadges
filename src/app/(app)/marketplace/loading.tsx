export default function MarketplaceLoading() {
  return (
    <div className="pt-4 space-y-4 animate-pulse">
      <div className="h-7 w-36 bg-white/10 rounded-lg" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border border-white/8 rounded-2xl overflow-hidden">
          <div className="h-20 bg-white/10" />
          <div className="p-4 space-y-3">
            <div className="h-3.5 w-3/4 bg-white/10 rounded" />
            <div className="h-10 bg-white/5 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
