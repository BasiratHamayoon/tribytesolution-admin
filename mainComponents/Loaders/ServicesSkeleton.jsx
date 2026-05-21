"use client"

export default function ServicesSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-0">
      
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {/* Icon */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-slate-200 rounded-xl animate-pulse"></div>
            {/* Title */}
            <div className="h-8 w-28 sm:w-36 bg-slate-200 rounded-lg animate-pulse"></div>
          </div>
          {/* Subtitle */}
          <div className="h-4 w-44 sm:w-56 bg-slate-100 rounded-lg animate-pulse ml-0 sm:ml-14"></div>
        </div>

        {/* Right Side - Stats & Button */}
        <div className="flex items-center gap-3">
          {/* Services Count Pill */}
          <div className="hidden sm:block h-10 w-28 bg-blue-100 rounded-full animate-pulse"></div>
          {/* Popular Count Pill */}
          <div className="hidden sm:block h-10 w-24 bg-amber-100 rounded-full animate-pulse"></div>
          {/* Add Button */}
          <div className="h-11 w-32 sm:w-36 bg-slate-200 rounded-xl animate-pulse"></div>
        </div>
      </div>

      {/* Category Sections */}
      <div className="space-y-8">
        {[1, 2].map((section) => (
          <div key={section}>
            {/* Category Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-28 bg-slate-100 rounded-lg animate-pulse"></div>
              <div className="flex-1 h-px bg-slate-200"></div>
              <div className="h-4 w-20 bg-slate-100 rounded animate-pulse"></div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3].map((item) => (
                <ServiceCardSkeleton key={item} index={(section - 1) * 3 + item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ServiceCardSkeleton({ index }) {
  return (
    <div 
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col relative"
      style={{ animationDelay: `${index * 75}ms` }}
    >
      {/* Card Header */}
      <div className="p-5 sm:p-6 flex-1 animate-pulse">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-100 rounded-xl"></div>
            <div>
              {/* Popular Badge */}
              <div className="h-5 w-16 bg-amber-100 rounded-full mb-1.5"></div>
              {/* Title */}
              <div className="h-6 w-28 sm:w-32 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5 mb-4">
          <div className="h-4 w-full bg-slate-100 rounded"></div>
          <div className="h-4 w-4/5 bg-slate-100 rounded"></div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <div className="h-6 w-20 bg-emerald-50 rounded-md"></div>
          <div className="h-6 w-24 bg-emerald-50 rounded-md"></div>
          <div className="h-6 w-18 bg-emerald-50 rounded-md"></div>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-100 rounded"></div>
          <div className="h-6 w-28 bg-slate-200 rounded"></div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 sm:px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between animate-pulse">
        <div className="h-4 w-24 bg-slate-200 rounded"></div>
        <div className="flex items-center gap-1">
          <div className="w-8 h-8 bg-slate-100 rounded-lg"></div>
          <div className="w-8 h-8 bg-slate-100 rounded-lg"></div>
        </div>
      </div>

      {/* Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
    </div>
  )
}

// Single Category Skeleton (for partial loading)
export function ServicesCategorySkeleton({ cardCount = 3 }) {
  return (
    <div>
      {/* Category Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-8 w-28 bg-slate-100 rounded-lg animate-pulse"></div>
        <div className="flex-1 h-px bg-slate-200"></div>
        <div className="h-4 w-20 bg-slate-100 rounded animate-pulse"></div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {Array.from({ length: cardCount }).map((_, item) => (
          <ServiceCardSkeleton key={item} index={item} />
        ))}
      </div>
    </div>
  )
}

// Empty State Skeleton
export function ServicesEmptySkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-slate-200 rounded-xl animate-pulse"></div>
            <div className="h-8 w-28 sm:w-36 bg-slate-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="h-4 w-44 sm:w-56 bg-slate-100 rounded-lg animate-pulse ml-0 sm:ml-14"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block h-10 w-28 bg-blue-100 rounded-full animate-pulse"></div>
          <div className="hidden sm:block h-10 w-24 bg-amber-100 rounded-full animate-pulse"></div>
          <div className="h-11 w-32 sm:w-36 bg-slate-200 rounded-xl animate-pulse"></div>
        </div>
      </div>

      {/* Empty State Box */}
      <div className="text-center py-16 sm:py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 animate-pulse">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-2xl mx-auto mb-4"></div>
        <div className="h-6 w-36 bg-slate-200 rounded mx-auto mb-2"></div>
        <div className="h-4 w-56 bg-slate-100 rounded mx-auto mb-6"></div>
        <div className="h-11 w-48 bg-slate-200 rounded-xl mx-auto"></div>
      </div>
    </div>
  )
}