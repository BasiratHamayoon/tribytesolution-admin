"use client"

export default function MessagesSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-0">
      
      {/* Header Skeleton */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-slate-200 rounded-xl animate-pulse"></div>
              <div className="h-8 w-32 sm:w-40 bg-slate-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="h-4 w-48 sm:w-64 bg-slate-100 rounded-lg animate-pulse ml-0 sm:ml-14"></div>
          </div>

          {/* Stats Pills */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="h-10 w-24 bg-blue-100 rounded-full animate-pulse"></div>
            <div className="h-10 w-24 bg-emerald-100 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2 mb-4 sm:mb-6">
        <div className="h-11 sm:h-12 w-28 sm:w-32 bg-slate-200 rounded-xl animate-pulse"></div>
        <div className="h-11 sm:h-12 w-32 sm:w-36 bg-slate-100 rounded-xl animate-pulse"></div>
      </div>

      {/* Search Bar Skeleton */}
      <div className="mb-4 sm:mb-6">
        <div className="h-11 sm:h-12 w-full bg-white border border-slate-200 rounded-xl animate-pulse"></div>
      </div>

      {/* Message List Skeleton */}
      <div className="space-y-2 sm:space-y-3">
        {[1, 2, 3, 4, 5].map((item) => (
          <MessageCardSkeleton key={item} index={item} />
        ))}
      </div>
    </div>
  )
}

function MessageCardSkeleton({ index }) {
  return (
    <div 
      className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 relative overflow-hidden animate-pulse"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Status Bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-200"></div>

      <div className="flex items-start sm:items-center gap-3 sm:gap-4 pl-2 sm:pl-3">
        {/* Avatar */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-200 rounded-xl sm:rounded-2xl shrink-0"></div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name & Email */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
            <div className="h-5 w-28 sm:w-36 bg-slate-200 rounded"></div>
            <div className="h-4 w-36 sm:w-44 bg-slate-100 rounded"></div>
          </div>
          
          {/* Message Preview */}
          <div className="space-y-1.5 mb-3">
            <div className="h-4 w-full bg-slate-100 rounded"></div>
            <div className="h-4 w-3/4 bg-slate-100 rounded hidden sm:block"></div>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-5 w-20 bg-slate-100 rounded"></div>
            <div className="h-5 w-14 bg-slate-100 rounded-full"></div>
          </div>
        </div>

        {/* Arrow */}
        <div className="hidden sm:block w-10 h-10 bg-slate-100 rounded-xl shrink-0"></div>
      </div>

      {/* Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
    </div>
  )
}