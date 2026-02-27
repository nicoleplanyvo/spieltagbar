export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header Skeleton */}
      <div className="bg-[#1A1A2E] text-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 animate-shimmer" />
            <div className="h-5 w-40 bg-white/10 rounded animate-shimmer" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Spiele Skeleton */}
        <div className="h-7 w-48 bg-gray-200 rounded animate-shimmer mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 space-y-3">
              <div className="h-4 w-24 bg-gray-100 rounded animate-shimmer" />
              <div className="h-5 w-full bg-gray-100 rounded animate-shimmer" />
              <div className="h-5 w-full bg-gray-100 rounded animate-shimmer" />
              <div className="h-3 w-32 bg-gray-100 rounded animate-shimmer" />
            </div>
          ))}
        </div>

        {/* Reservierungen Skeleton */}
        <div className="h-7 w-56 bg-gray-200 rounded animate-shimmer mb-4" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-gray-100 rounded animate-shimmer" />
                <div className="h-3 w-48 bg-gray-100 rounded animate-shimmer" />
              </div>
              <div className="h-8 w-20 bg-gray-100 rounded animate-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
