export default function BarDashboardLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header Skeleton */}
      <div className="bg-[#1A1A2E] text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/10 animate-shimmer" />
            <div className="space-y-2">
              <div className="h-8 w-48 bg-white/10 rounded animate-shimmer" />
              <div className="h-4 w-24 bg-white/10 rounded animate-shimmer" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 animate-shimmer" />
              <div className="space-y-2">
                <div className="h-6 w-12 bg-gray-100 rounded animate-shimmer" />
                <div className="h-3 w-20 bg-gray-100 rounded animate-shimmer" />
              </div>
            </div>
          ))}
        </div>

        {/* Tab Skeleton */}
        <div className="flex gap-4 mb-6 border-b pb-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 w-24 bg-gray-200 rounded animate-shimmer" />
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-5 space-y-3">
              <div className="h-5 w-3/4 bg-gray-100 rounded animate-shimmer" />
              <div className="h-4 w-1/2 bg-gray-100 rounded animate-shimmer" />
              <div className="h-3 w-1/3 bg-gray-100 rounded animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
