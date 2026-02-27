export default function BarDetailLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Skeleton */}
      <div className="relative h-64 bg-[#1A1A2E] animate-shimmer">
        <div className="absolute bottom-6 left-6 space-y-2">
          <div className="h-8 w-56 bg-white/10 rounded" />
          <div className="h-4 w-40 bg-white/10 rounded" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg p-6 space-y-3">
              <div className="h-5 w-32 bg-gray-100 rounded animate-shimmer" />
              <div className="h-4 w-full bg-gray-100 rounded animate-shimmer" />
              <div className="h-4 w-3/4 bg-gray-100 rounded animate-shimmer" />
            </div>
            <div className="bg-white rounded-lg p-6 space-y-3">
              <div className="h-5 w-32 bg-gray-100 rounded animate-shimmer" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-50 rounded animate-shimmer" />
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 space-y-3">
              <div className="h-5 w-24 bg-gray-100 rounded animate-shimmer" />
              <div className="h-10 w-full bg-gray-100 rounded animate-shimmer" />
              <div className="h-10 w-full bg-gray-100 rounded animate-shimmer" />
              <div className="h-10 w-full bg-[#00D26A]/20 rounded animate-shimmer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
