"use client"

import { Card, CardContent } from "@/components/ui/card"

export default function ProjectsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 bg-muted rounded-lg animate-pulse" />
            <div className="h-5 w-24 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-3 w-40 bg-muted/60 rounded animate-pulse ml-11" />
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block h-7 w-24 bg-muted rounded-full animate-pulse" />
          <div className="h-8 w-28 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Card key={item} className="overflow-hidden border-border">
            <div className="aspect-video bg-muted animate-pulse relative">
              <div className="absolute top-2.5 left-2.5 h-5 w-14 bg-muted-foreground/10 rounded" />
            </div>
            <CardContent className="p-4 animate-pulse">
              <div className="h-3 w-16 bg-muted rounded mb-1.5" />
              <div className="h-4 w-3/4 bg-muted rounded mb-1.5" />
              <div className="space-y-1 mb-3">
                <div className="h-3 w-full bg-muted/60 rounded" />
                <div className="h-3 w-5/6 bg-muted/60 rounded" />
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                <div className="h-5 w-12 bg-muted rounded" />
                <div className="h-5 w-14 bg-muted rounded" />
                <div className="h-5 w-10 bg-muted rounded" />
              </div>
              <div className="flex items-center justify-between pt-2.5 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-12 bg-muted rounded" />
                  <div className="h-3 w-10 bg-muted rounded" />
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 bg-muted rounded" />
                  <div className="w-6 h-6 bg-muted rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}