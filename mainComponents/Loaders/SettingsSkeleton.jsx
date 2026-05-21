"use client"

export default function SettingsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-0">
      
      {/* Header Skeleton */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-slate-200 rounded-xl animate-pulse"></div>
          <div className="h-8 w-28 sm:w-36 bg-slate-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="h-4 w-56 sm:w-72 bg-slate-100 rounded-lg animate-pulse ml-0 sm:ml-14"></div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Sidebar Skeleton - Desktop */}
        <div className="hidden lg:block lg:w-72 shrink-0">
          <div className="sticky top-6 space-y-4">
            {/* Tabs Skeleton */}
            <div className="bg-white rounded-2xl border border-slate-200 p-3">
              {[1, 2, 3].map((item) => (
                <div 
                  key={item}
                  className={`p-4 rounded-xl mb-2 last:mb-0 animate-pulse ${
                    item === 1 ? "bg-slate-100" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 w-16 bg-slate-200 rounded mb-1.5"></div>
                      <div className="h-3 w-24 bg-slate-100 rounded"></div>
                    </div>
                    <div className="w-4 h-4 bg-slate-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Security Card Skeleton */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-4 animate-pulse">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-emerald-100 rounded-lg"></div>
                <div className="h-4 w-28 bg-slate-200 rounded"></div>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center justify-between">
                    <div className="h-3 w-16 bg-slate-200 rounded"></div>
                    <div className="h-5 w-14 bg-slate-200 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Tabs Skeleton */}
        <div className="flex lg:hidden gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[1, 2, 3].map((item) => (
            <div 
              key={item}
              className={`h-11 rounded-xl animate-pulse shrink-0 ${
                item === 1 
                  ? "w-28 bg-slate-200" 
                  : "w-24 bg-slate-100"
              }`}
            ></div>
          ))}
        </div>

        {/* Content Area Skeleton */}
        <div className="flex-1">
          <ProfileTabSkeleton />
        </div>
      </div>
    </div>
  )
}

// Profile Tab Skeleton
function ProfileTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-slate-200 to-slate-300 p-6 sm:p-8 animate-pulse">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-300 rounded-2xl"></div>
            <div className="space-y-2">
              <div className="h-7 w-32 sm:w-40 bg-slate-300 rounded"></div>
              <div className="h-4 w-40 sm:w-48 bg-slate-300/70 rounded"></div>
              <div className="h-6 w-20 bg-slate-300/70 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="p-6 sm:p-8 animate-pulse">
          <div className="h-4 w-36 bg-slate-100 rounded mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div 
                key={item}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-3 w-20 bg-slate-200 rounded mb-1.5"></div>
                    <div className="h-4 w-32 bg-slate-100 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Name Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 animate-pulse">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-blue-100 rounded-xl"></div>
          <div>
            <div className="h-5 w-24 bg-slate-200 rounded mb-1"></div>
            <div className="h-3 w-36 bg-slate-100 rounded"></div>
          </div>
        </div>
        
        <div className="space-y-4 max-w-md">
          <div>
            <div className="h-4 w-16 bg-slate-200 rounded mb-2"></div>
            <div className="h-12 w-full bg-slate-100 rounded-xl"></div>
          </div>
          <div className="h-12 w-32 bg-slate-200 rounded-xl"></div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border border-red-200 p-6 sm:p-8 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-red-100 rounded-xl"></div>
          <div>
            <div className="h-5 w-24 bg-red-200 rounded mb-1"></div>
            <div className="h-3 w-32 bg-slate-100 rounded"></div>
          </div>
        </div>
        <div className="h-4 w-full max-w-md bg-slate-100 rounded mb-4"></div>
        <div className="h-11 w-32 bg-red-100 rounded-xl"></div>
      </div>
    </div>
  )
}

// Email Tab Skeleton
export function EmailTabSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 sm:p-8 border-b border-slate-100 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-blue-100 rounded-xl"></div>
          <div>
            <div className="h-6 w-32 bg-slate-200 rounded mb-1"></div>
            <div className="h-4 w-40 bg-slate-100 rounded"></div>
          </div>
        </div>
      </div>

      {/* Current Email */}
      <div className="p-6 sm:p-8 bg-slate-50/50 border-b border-slate-100 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl border border-slate-200"></div>
          <div>
            <div className="h-3 w-24 bg-slate-200 rounded mb-1.5"></div>
            <div className="h-5 w-48 bg-slate-100 rounded"></div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 sm:p-8 animate-pulse">
        <div className="space-y-5 max-w-md">
          <div>
            <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
            <div className="h-12 w-full bg-slate-100 rounded-xl"></div>
          </div>
          <div>
            <div className="h-4 w-36 bg-slate-200 rounded mb-2"></div>
            <div className="h-12 w-full bg-slate-100 rounded-xl"></div>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-blue-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-16 bg-blue-200 rounded"></div>
                <div className="h-3 w-full bg-blue-100 rounded"></div>
              </div>
            </div>
          </div>
          <div className="h-12 w-32 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  )
}

// Password Tab Skeleton
export function PasswordTabSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 sm:p-8 border-b border-slate-100 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-amber-100 rounded-xl"></div>
          <div>
            <div className="h-6 w-36 bg-slate-200 rounded mb-1"></div>
            <div className="h-4 w-44 bg-slate-100 rounded"></div>
          </div>
        </div>
      </div>

      {/* Requirements */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 animate-pulse">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-amber-100 rounded-lg shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 bg-amber-200 rounded mb-2"></div>
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-200 rounded-full"></div>
                <div className="h-3 w-40 bg-amber-100 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 sm:p-8 animate-pulse">
        <div className="space-y-5 max-w-md">
          {[1, 2, 3].map((item) => (
            <div key={item}>
              <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
              <div className="h-12 w-full bg-slate-100 rounded-xl"></div>
              {item === 2 && (
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-24 bg-slate-100 rounded"></div>
                    <div className="h-3 w-12 bg-slate-100 rounded"></div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                </div>
              )}
            </div>
          ))}
          <div className="h-12 w-40 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  )
}