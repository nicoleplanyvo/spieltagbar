export default function SpieleLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-[#1A1A2E] text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-10 w-48 bg-white/10 rounded animate-shimmer" />
          <div className="h-4 w-64 bg-white/10 rounded animate-shimmer mt-3" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Skeleton */}
        <div className="bg-white rounded-xl p-4 mb-6 space-y-3">
          <div className="flex gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 w-20 bg-gray-100 rounded-full animate-shimmer" />
            ))}
          </div>
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 w-28 bg-gray-100 rounded-full animate-shimmer" />
            ))}
          </div>
        </div>

        {/* Games Skeleton */}
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-100 animate-shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-gray-100 rounded animate-shimmer" />
                <div className="h-3 w-32 bg-gray-100 rounded animate-shimmer" />
              </div>
              <div className="h-8 w-16 bg-gray-100 rounded animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
