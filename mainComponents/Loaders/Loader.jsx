"use client"

import { Loader2 } from "lucide-react"

// Default Loader - Full screen centered
export default function Loader({ text = "Loading...", fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-slate-600 font-medium">{text}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="relative inline-block">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
        </div>
        <p className="mt-4 text-slate-600">{text}</p>
      </div>
    </div>
  )
}

// Inline Loader - Small spinner for buttons
export function InlineLoader({ size = "sm", color = "white" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  }

  const colorClasses = {
    white: "text-white",
    blue: "text-blue-600",
    slate: "text-slate-600"
  }

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`} />
  )
}

// Skeleton Loader - For content placeholders
export function SkeletonLoader({ type = "card", count = 1 }) {
  const skeletons = Array(count).fill(null)

  if (type === "card") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {skeletons.map((_, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-pulse relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
              <div className="w-16 h-6 bg-slate-200 rounded-full"></div>
            </div>
            <div className="w-20 h-8 bg-slate-200 rounded mb-2"></div>
            <div className="w-28 h-4 bg-slate-100 rounded"></div>
            
            {/* Shimmer */}
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
          </div>
        ))}
      </div>
    )
  }

  if (type === "list") {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {skeletons.map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 border-b border-slate-100 last:border-b-0 animate-pulse relative overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
              <div>
                <div className="w-32 h-4 bg-slate-200 rounded mb-2"></div>
                <div className="w-24 h-3 bg-slate-100 rounded"></div>
              </div>
            </div>
            <div className="w-16 h-6 bg-slate-200 rounded-full"></div>
            
            {/* Shimmer */}
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
          </div>
        ))}
      </div>
    )
  }

  if (type === "table") {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex gap-4">
            <div className="w-1/4 h-4 bg-slate-200 rounded"></div>
            <div className="w-1/4 h-4 bg-slate-200 rounded"></div>
            <div className="w-1/4 h-4 bg-slate-200 rounded"></div>
            <div className="w-1/4 h-4 bg-slate-200 rounded"></div>
          </div>
        </div>
        {skeletons.map((_, index) => (
          <div key={index} className="p-4 border-b border-slate-100 animate-pulse relative overflow-hidden">
            <div className="flex gap-4">
              <div className="w-1/4 h-4 bg-slate-100 rounded"></div>
              <div className="w-1/4 h-4 bg-slate-100 rounded"></div>
              <div className="w-1/4 h-4 bg-slate-100 rounded"></div>
              <div className="w-1/4 h-4 bg-slate-100 rounded"></div>
            </div>
            
            {/* Shimmer */}
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
          </div>
        ))}
      </div>
    )
  }

  if (type === "text") {
    return (
      <div className="space-y-2 animate-pulse">
        {skeletons.map((_, index) => (
          <div key={index} className="h-4 bg-slate-200 rounded w-full"></div>
        ))}
      </div>
    )
  }

  if (type === "avatar") {
    return (
      <div className="flex items-center gap-4 animate-pulse">
        <div className="w-16 h-16 bg-slate-200 rounded-full"></div>
        <div>
          <div className="h-5 w-32 bg-slate-200 rounded mb-2"></div>
          <div className="h-4 w-24 bg-slate-100 rounded"></div>
        </div>
      </div>
    )
  }

  return null
}

// Page Loader - For entire page loading
export function PageLoader({ text = "Loading page..." }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="relative inline-block">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
        </div>
        <p className="mt-6 text-slate-600 font-medium">{text}</p>
        <p className="mt-2 text-slate-400 text-sm">Please wait...</p>
      </div>
    </div>
  )
}

// Dots Loader - Animated dots
export function DotsLoader({ color = "blue", size = "md" }) {
  const colorClass = {
    blue: "bg-blue-600",
    slate: "bg-slate-600",
    white: "bg-white"
  }

  const sizeClass = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-3 h-3"
  }

  return (
    <div className="flex items-center gap-1">
      <div className={`${sizeClass[size]} ${colorClass[color]} rounded-full animate-bounce`} style={{ animationDelay: "0ms" }}></div>
      <div className={`${sizeClass[size]} ${colorClass[color]} rounded-full animate-bounce`} style={{ animationDelay: "150ms" }}></div>
      <div className={`${sizeClass[size]} ${colorClass[color]} rounded-full animate-bounce`} style={{ animationDelay: "300ms" }}></div>
    </div>
  )
}

// Pulse Loader - Pulsing circle
export function PulseLoader({ color = "blue", size = "md" }) {
  const colorClass = {
    blue: "bg-blue-600",
    slate: "bg-slate-600",
    emerald: "bg-emerald-600"
  }

  const sizeClass = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  }

  return (
    <div className="relative inline-flex">
      <div className={`${sizeClass[size]} ${colorClass[color]} rounded-full animate-ping opacity-75`}></div>
      <div className={`${sizeClass[size]} ${colorClass[color]} rounded-full absolute top-0 left-0`}></div>
    </div>
  )
}

// Bar Loader - Progress bar style
export function BarLoader({ color = "blue" }) {
  const colorClass = {
    blue: "bg-blue-600",
    slate: "bg-slate-600",
    emerald: "bg-emerald-600"
  }

  return (
    <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
      <div className={`h-full ${colorClass[color]} rounded-full animate-loading-bar`}></div>
    </div>
  )
}