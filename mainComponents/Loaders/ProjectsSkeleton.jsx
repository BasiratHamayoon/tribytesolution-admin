"use client"

import { Card, CardContent } from "@/components/ui/card"

export default function ProjectsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-10 h-10 bg-muted rounded-xl animate-pulse" />
            <div>
              <div className="h-5 w-24 bg-muted rounded animate-pulse mb-1.5" />
              <div className="h-3 w-44 bg-muted/60 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block h-7 w-28 bg-muted rounded-full animate-pulse" />
          <div className="h-8 w-28 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>

      <Card className="border-border/50 mb-5">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <div className="h-9 flex-1 bg-muted/30 rounded-lg animate-pulse" />
            <div className="flex gap-2">
              <div className="h-9 w-32 bg-muted/30 rounded-lg animate-pulse" />
              <div className="h-9 w-24 bg-muted/30 rounded-lg animate-pulse" />
              <div className="h-9 w-20 bg-muted/30 rounded-lg animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                {["w-16", "w-16", "w-16", "w-10", "w-10", "w-14"].map((w, i) => (
                  <th key={i} className={`px-4 py-3 ${i === 1 ? "hidden md:table-cell" : ""} ${i === 2 ? "hidden lg:table-cell" : ""} ${i === 3 ? "hidden sm:table-cell" : ""} ${i === 4 ? "hidden lg:table-cell" : ""}`}>
                    <div className={`h-3 ${w} bg-muted animate-pulse rounded ${i === 5 ? "ml-auto" : ""}`} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <tr key={item} className="border-b border-border/20 animate-pulse">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-10 bg-muted rounded-lg shrink-0" />
                      <div>
                        <div className="h-3.5 w-32 bg-muted rounded mb-1.5" />
                        <div className="h-2.5 w-44 bg-muted/60 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="h-5 w-20 bg-muted rounded-full" />
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex gap-1">
                      <div className="h-4 w-12 bg-muted rounded-full" />
                      <div className="h-4 w-10 bg-muted rounded-full" />
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="h-[18px] w-14 bg-muted rounded-full" />
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex gap-1.5">
                      <div className="w-7 h-7 bg-muted rounded-lg" />
                      <div className="w-7 h-7 bg-muted rounded-lg" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <div className="w-7 h-7 bg-muted rounded-lg" />
                      <div className="w-7 h-7 bg-muted rounded-lg" />
                      <div className="w-7 h-7 bg-muted rounded-lg" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}