"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Pencil, Trash2, Loader2, Star, DollarSign,
  Image as ImageIcon, Sparkles, Search, Plus, Eye
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getImageUrl } from "@/utils/getImageUrl"

const TableImage = ({ src, alt }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const imageUrl = getImageUrl(src)

  if (!imageUrl || hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
        <ImageIcon className="w-4 h-4 text-muted-foreground/30" />
      </div>
    )
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted z-10 rounded-lg">
          <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
        </div>
      )}
      <Image
        src={imageUrl}
        alt={alt || "Service"}
        fill
        sizes="80px"
        className={`object-cover transition-all duration-500 ${
          isLoading ? "opacity-0 scale-110" : "opacity-100 scale-100"
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => { setIsLoading(false); setHasError(true) }}
        unoptimized
      />
    </div>
  )
}

const AnimatedRow = ({ children, index, isVisible }) => (
  <tr
    className={`border-b border-border/20 transition-all duration-400 ease-out hover:bg-primary/[0.02] ${
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
    }`}
    style={{ transitionDelay: `${index * 40}ms` }}
  >
    {children}
  </tr>
)

export default function ServiceTable({
  services,
  isVisible,
  onEdit,
  onDelete,
  onView,
  onAdd,
  hasActiveFilters,
  onClearFilters,
  debouncedSearch
}) {
  if (services.length === 0) {
    return (
      <Card className={`border-dashed border-2 border-primary/20 transition-all duration-500 ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}>
        <CardContent className="py-16 text-center">
          <div className={`w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-700 ${
            isVisible ? "scale-100 rotate-0" : "scale-0 rotate-45"
          }`}>
            {hasActiveFilters
              ? <Search className="w-8 h-8 text-primary/30" />
              : <Sparkles className="w-8 h-8 text-primary/30" />
            }
          </div>
          <h3 className="text-sm font-black text-foreground mb-1.5">
            {debouncedSearch ? "No results found" : hasActiveFilters ? "No services match" : "No services yet"}
          </h3>
          <p className="text-muted-foreground text-xs max-w-[280px] mx-auto">
            {debouncedSearch
              ? `No services match "${debouncedSearch}"`
              : hasActiveFilters
                ? "Try adjusting your filters"
                : "Start by adding your first service"
            }
          </p>
          {hasActiveFilters ? (
            <Button onClick={onClearFilters} variant="outline" size="sm" className="mt-4 h-8 text-[10px] rounded-lg font-bold">
              Clear Filters
            </Button>
          ) : (
            <Button onClick={onAdd} size="sm" className="mt-4 h-8 text-[10px] rounded-lg font-bold shadow-md shadow-primary/20">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Service
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Card className="border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest px-4 py-3 w-[40%]">Service</th>
                <th className="text-left text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest px-4 py-3 hidden md:table-cell">Category</th>
                <th className="text-left text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest px-4 py-3 hidden lg:table-cell">Features</th>
                <th className="text-left text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest px-4 py-3 hidden sm:table-cell">Price</th>
                <th className="text-left text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest px-4 py-3 hidden sm:table-cell">Status</th>
                <th className="text-right text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service, index) => (
                <AnimatedRow key={service._id} index={index} isVisible={isVisible}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-9 sm:w-14 sm:h-10 rounded-lg overflow-hidden bg-muted shrink-0 relative">
                        <TableImage src={service.image} alt={service.title} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-[13px] font-bold text-foreground truncate max-w-[120px] sm:max-w-[180px] lg:max-w-[240px] hover:text-primary transition-colors duration-300 cursor-default">
                          {service.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground/50 truncate max-w-[120px] sm:max-w-[180px] lg:max-w-[240px] font-medium mt-0.5">
                          {service.description}
                        </p>
                        <p className="text-[10px] text-primary font-semibold md:hidden mt-0.5">
                          {service.category}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge variant="secondary" className="text-[9px] px-2 py-0.5 bg-muted/50 text-foreground/70 border-0 rounded-full font-semibold whitespace-nowrap">
                      {service.category}
                    </Badge>
                  </td>

                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1 max-w-[160px]">
                      {service.features && service.features.length > 0 ? (
                        <>
                          {service.features.slice(0, 2).map((feature, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-primary/8 text-primary/70 text-[8px] font-bold rounded-full border border-primary/10 whitespace-nowrap truncate max-w-[80px]">
                              {feature}
                            </span>
                          ))}
                          {service.features.length > 2 && (
                            <span className="px-1.5 py-0.5 bg-muted/50 text-muted-foreground/50 text-[8px] font-bold rounded-full whitespace-nowrap">
                              +{service.features.length - 2}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/30 font-medium">—</span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 hidden sm:table-cell">
                    {service.price ? (
                      <span className="flex items-center gap-0.5 text-[11px] font-bold text-foreground/70">
                        <DollarSign className="w-3 h-3 text-primary/60" />
                        {service.price}
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground/30 font-medium">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3 hidden sm:table-cell">
                    {service.popular ? (
                      <Badge className="text-[8px] px-2 py-0.5 h-[18px] border-0 font-bold rounded-full bg-primary/10 text-primary whitespace-nowrap gap-1">
                        <Star className="w-2.5 h-2.5 fill-primary" /> Popular
                      </Badge>
                    ) : (
                      <Badge className="text-[8px] px-2 py-0.5 h-[18px] border-0 font-bold rounded-full bg-muted/50 text-muted-foreground/50 whitespace-nowrap">
                        Standard
                      </Badge>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-0.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => onView(service)}
                            className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-primary hover:bg-primary/8 transition-all duration-200 hover:scale-110"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-[10px]">View</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => onEdit(service)}
                            className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-primary hover:bg-primary/8 transition-all duration-200 hover:scale-110"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-[10px]">Edit</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => onDelete(service)}
                            className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/8 transition-all duration-200 hover:scale-110"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-[10px]">Delete</TooltipContent>
                      </Tooltip>
                    </div>
                  </td>
                </AnimatedRow>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </TooltipProvider>
  )
}