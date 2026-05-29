export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-surface-50 rounded w-1/4"></div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-surface-30 rounded-2xl"></div>
        ))}
      </div>
    </div>
  );
}
