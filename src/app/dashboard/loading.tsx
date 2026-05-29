export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-surface-30 rounded-[2rem]"></div>
        ))}
      </div>
    </div>
  );
}
