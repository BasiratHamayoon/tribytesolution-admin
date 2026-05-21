"use client"

import {
  ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight,
  MoreHorizontal
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Pagination({
  currentPage, totalPages, totalItems, itemsPerPage,
  onPageChange, onItemsPerPageChange,
  hasNextPage, hasPrevPage, isLoading = false,
  showItemsPerPage = true, showPageInfo = true,
  itemsPerPageOptions = [5, 10, 20, 50], className = ""
}) {
  const getPageNumbers = () => {
    const pages = []
    const max = 5
    if (totalPages <= max + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push({ type: "page", value: i })
    } else {
      pages.push({ type: "page", value: 1 })
      if (currentPage <= 3) {
        for (let i = 2; i <= 4; i++) pages.push({ type: "page", value: i })
        pages.push({ type: "ellipsis", value: "end" })
        pages.push({ type: "page", value: totalPages })
      } else if (currentPage >= totalPages - 2) {
        pages.push({ type: "ellipsis", value: "start" })
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push({ type: "page", value: i })
      } else {
        pages.push({ type: "ellipsis", value: "start" })
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push({ type: "page", value: i })
        pages.push({ type: "ellipsis", value: "end" })
        pages.push({ type: "page", value: totalPages })
      }
    }
    return pages
  }

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !isLoading) onPageChange(page)
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)
  if (totalPages <= 1 && !showItemsPerPage) return null

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Mobile */}
      <div className="flex flex-col sm:hidden gap-3">
        {showPageInfo && totalItems > 0 && (
          <p className="text-[11px] text-muted-foreground text-center">
            <span className="font-semibold text-foreground">{startItem}-{endItem}</span> of{" "}
            <span className="font-semibold text-foreground">{totalItems}</span>
          </p>
        )}
        <div className="flex items-center justify-center gap-1.5">
          <Button variant="outline" size="sm" className="h-7 px-2.5 text-[10px]"
            onClick={() => goToPage(currentPage - 1)} disabled={!hasPrevPage || isLoading}>
            <ChevronLeft className="w-3.5 h-3.5 mr-0.5" /> Prev
          </Button>
          <div className="flex items-center gap-1 px-2 py-1 bg-card border border-border rounded-md">
            <input type="number" min={1} max={totalPages} value={currentPage}
              onChange={(e) => { const p = parseInt(e.target.value); if (!isNaN(p)) goToPage(p) }}
              disabled={isLoading}
              className="w-8 text-center text-[11px] font-medium border-none focus:outline-none bg-transparent text-foreground" />
            <span className="text-[10px] text-muted-foreground">/ {totalPages}</span>
          </div>
          <Button variant="outline" size="sm" className="h-7 px-2.5 text-[10px]"
            onClick={() => goToPage(currentPage + 1)} disabled={!hasNextPage || isLoading}>
            Next <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Button>
        </div>
        {showItemsPerPage && onItemsPerPageChange && (
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[10px] text-muted-foreground">Show:</span>
            <select value={itemsPerPage} onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              disabled={isLoading}
              className="px-2 py-1 bg-card border border-border rounded-md text-[10px] font-medium text-foreground focus:ring-1 focus:ring-primary outline-none">
              {itemsPerPageOptions.map(o => <option key={o} value={o}>{o} per page</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden sm:flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {showItemsPerPage && onItemsPerPageChange && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground">Rows:</span>
              <select value={itemsPerPage} onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                disabled={isLoading}
                className="px-2 py-1 bg-card border border-border rounded-md text-[11px] font-medium text-foreground focus:ring-1 focus:ring-primary cursor-pointer hover:border-primary/40 transition-colors outline-none">
                {itemsPerPageOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          )}
          {showPageInfo && totalItems > 0 && (
            <p className="text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">{startItem}-{endItem}</span> of{" "}
              <span className="font-semibold text-foreground">{totalItems}</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          <Button variant="outline" size="icon" className="h-7 w-7"
            onClick={() => goToPage(1)} disabled={!hasPrevPage || isLoading}>
            <ChevronsLeft className="w-3.5 h-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7"
            onClick={() => goToPage(currentPage - 1)} disabled={!hasPrevPage || isLoading}>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>

          <div className="flex items-center gap-0.5 mx-1">
            {getPageNumbers().map((item) =>
              item.type === "ellipsis" ? (
                <span key={`e-${item.value}`} className="w-7 h-7 flex items-center justify-center text-muted-foreground">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </span>
              ) : (
                <Button key={item.value} variant={currentPage === item.value ? "default" : "outline"}
                  size="sm" className="h-7 min-w-[28px] px-2 text-[11px] font-semibold"
                  onClick={() => goToPage(item.value)} disabled={isLoading}>
                  {item.value}
                </Button>
              )
            )}
          </div>

          <Button variant="outline" size="icon" className="h-7 w-7"
            onClick={() => goToPage(currentPage + 1)} disabled={!hasNextPage || isLoading}>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7"
            onClick={() => goToPage(totalPages)} disabled={!hasNextPage || isLoading}>
            <ChevronsRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}