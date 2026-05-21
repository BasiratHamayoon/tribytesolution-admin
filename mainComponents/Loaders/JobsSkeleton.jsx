"use client"

import { Card, CardContent } from "@/components/ui/card"

export default function JobsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-10 h-10 bg-muted rounded-xl animate-pulse" />
            <div>
              <div className="h-5 w-16 bg-muted rounded animate-pulse mb-1.5" />
              <div className="h-3 w-48 bg-muted/60 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block h-7 w-20 bg-muted rounded-full animate-pulse" />
          <div className="h-8 w-24 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Filter bar skeleton */}
      <div className="border border-border/50 rounded-xl p-3 sm:p-4 mb-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-muted/50 rounded-t-xl" />
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <div className="h-9 flex-1 bg-muted/30 rounded-lg animate-pulse" />
          <div className="flex gap-2">
            <div className="h-9 w-32 bg-muted/30 rounded-lg animate-pulse" />
            <div className="h-9 w-24 bg-muted/30 rounded-lg animate-pulse" />
            <div className="h-9 w-24 bg-muted/30 rounded-lg animate-pulse" />
            <div className="h-9 w-20 bg-muted/30 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-border/50 overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-muted/50" />
            <CardContent className="p-4 pt-5 animate-pulse">
              {/* Title row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 pr-2">
                  <div className="h-4 w-3/4 bg-muted rounded mb-1.5" />
                  <div className="h-3 w-1/3 bg-muted/60 rounded" />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-8 bg-muted rounded-full" />
                  <div className="w-6 h-6 bg-muted rounded" />
                </div>
              </div>

              {/* Chips */}
              <div className="flex gap-1.5 mb-3">
                <div className="h-5 w-16 bg-muted rounded-full" />
                <div className="h-5 w-20 bg-muted rounded-full" />
                <div className="h-5 w-14 bg-muted rounded-full" />
              </div>

              {/* Description */}
              <div className="mb-3 space-y-1.5">
                <div className="h-3 w-full bg-muted/60 rounded" />
                <div className="h-3 w-5/6 bg-muted/60 rounded" />
              </div>

              {/* Skills */}
              <div className="flex gap-1 mb-3">
                <div className="h-4 w-10 bg-muted rounded-full" />
                <div className="h-4 w-12 bg-muted rounded-full" />
                <div className="h-4 w-8 bg-muted rounded-full" />
              </div>

              {/* Salary */}
              <div className="h-3.5 w-24 bg-muted/60 rounded mb-3" />

              {/* Separator */}
              <div className="h-px bg-muted/50 mb-3" />

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="h-6 w-24 bg-muted rounded-lg" />
                <div className="flex gap-1">
                  <div className="w-7 h-7 bg-muted rounded-lg" />
                  <div className="w-7 h-7 bg-muted rounded-lg" />
                  <div className="w-7 h-7 bg-muted rounded-lg" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}