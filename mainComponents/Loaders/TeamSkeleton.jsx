"use client"

import { Card, CardContent } from "@/components/ui/card"

export default function TeamSkeleton() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-10 h-10 bg-muted rounded-xl animate-pulse" />
            <div>
              <div className="h-5 w-16 bg-muted rounded animate-pulse mb-1.5" />
              <div className="h-3 w-40 bg-muted/60 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block h-7 w-28 bg-muted rounded-full animate-pulse" />
          <div className="h-8 w-28 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>

      <div className="border border-border/50 rounded-xl p-3 sm:p-4 mb-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-muted/50 rounded-t-xl" />
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="h-9 flex-1 bg-muted/30 rounded-lg animate-pulse" />
          <div className="flex gap-2">
            <div className="h-9 w-32 bg-muted/30 rounded-lg animate-pulse" />
            <div className="h-9 w-24 bg-muted/30 rounded-lg animate-pulse" />
            <div className="h-9 w-20 bg-muted/30 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="border-border/50 overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-muted/50" />
            <div className="aspect-square bg-muted animate-pulse" />
            <CardContent className="p-3 animate-pulse">
              <div className="text-center space-y-1.5">
                <div className="h-4 w-24 bg-muted rounded mx-auto" />
                <div className="h-3 w-16 bg-muted/60 rounded mx-auto" />
                <div className="h-2.5 w-20 bg-muted/40 rounded mx-auto" />
              </div>
              <div className="flex justify-center gap-1.5 mt-3">
                <div className="w-5 h-5 bg-muted rounded" />
                <div className="w-5 h-5 bg-muted rounded" />
                <div className="w-5 h-5 bg-muted rounded" />
              </div>
              <div className="h-px bg-muted/50 my-2.5" />
              <div className="flex justify-center gap-1">
                <div className="w-7 h-7 bg-muted rounded-lg" />
                <div className="w-7 h-7 bg-muted rounded-lg" />
                <div className="w-7 h-7 bg-muted rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}