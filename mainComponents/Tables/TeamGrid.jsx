"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Pencil, Trash2, Loader2, Star, Eye,
  Sparkles, Search, Plus, Linkedin,
  Github, Twitter, Globe,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip, TooltipContent,
  TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip"
import { getImageUrl } from "@/utils/getImageUrl"

const MemberImage = ({ src, alt, name }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const imageUrl = getImageUrl(src)

  if (!imageUrl || hasError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-primary/5 text-primary">
        <span className="text-2xl font-black">
          {name?.charAt(0)?.toUpperCase() || "?"}
        </span>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
      <Image
        src={imageUrl}
        alt={alt || name}
        fill
        unoptimized
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className={`object-cover transition-all duration-500 ${
          isLoading ? "scale-110 opacity-0" : "scale-100 opacity-100"
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => { setIsLoading(false); setHasError(true) }}
      />
    </div>
  )
}

const AnimatedCard = ({ children, index, isVisible }) => (
  <div
    className={`h-full transform transition-all duration-500 ease-out ${
      isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
    }`}
    style={{ transitionDelay: `${index * 50}ms` }}
  >
    {children}
  </div>
)

export default function TeamGrid({
  members, isVisible, onEdit, onDelete, onView,
  onAdd, hasActiveFilters, onClearFilters, debouncedSearch,
}) {
  if (members.length === 0) {
    return (
      <Card
        className={`border-2 border-dashed border-primary/20 transition-all duration-500 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <CardContent className="py-16 text-center">
          <div
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 transition-all duration-700 ${
              isVisible ? "scale-100 rotate-0" : "scale-0 rotate-45"
            }`}
          >
            {hasActiveFilters
              ? <Search className="h-8 w-8 text-primary/30" />
              : <Sparkles className="h-8 w-8 text-primary/30" />
            }
          </div>
          <h3 className="mb-1.5 text-sm font-black text-foreground">
            {debouncedSearch
              ? "No results found"
              : hasActiveFilters
              ? "No members match"
              : "No team members yet"}
          </h3>
          <p className="mx-auto max-w-[280px] text-xs text-muted-foreground">
            {debouncedSearch
              ? `No members match "${debouncedSearch}"`
              : hasActiveFilters
              ? "Try adjusting your filters"
              : "Start by adding your first team member"}
          </p>
          {hasActiveFilters ? (
            <Button onClick={onClearFilters} variant="outline" size="sm"
              className="mt-4 h-8 rounded-lg text-[10px] font-bold">
              Clear Filters
            </Button>
          ) : (
            <Button onClick={onAdd} size="sm"
              className="mt-4 h-8 rounded-lg text-[10px] font-bold shadow-md shadow-primary/20">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Member
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {members.map((member, index) => (
          <AnimatedCard key={member._id} index={index} isVisible={isVisible}>
            <Card className="group flex h-full min-h-[370px] flex-col overflow-hidden rounded-xl border-border/50 p-0 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.07]">
              <div className="relative h-44 w-full overflow-hidden bg-muted">
                <div
                  className={`absolute left-0 right-0 top-0 z-30 h-[2px] transition-all duration-300 ${
                    member.isActive
                      ? "bg-gradient-to-r from-transparent via-primary/50 to-transparent group-hover:via-primary"
                      : "bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent"
                  }`}
                />
                <MemberImage src={member.image} alt={member.name} name={member.name} />

                {member.isFeatured && (
                  <Badge className="absolute right-2 top-2 z-20 h-5 gap-1 border-0 bg-primary px-2 py-0 text-[8px] font-bold text-primary-foreground">
                    <Star className="h-2.5 w-2.5 fill-current" /> Featured
                  </Badge>
                )}

                {!member.isActive && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                    <Badge className="border-0 bg-card text-[8px] font-bold text-muted-foreground">
                      Inactive
                    </Badge>
                  </div>
                )}

                <div className="absolute inset-0 z-20 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-all duration-300 group-hover:opacity-100">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" onClick={() => onView(member)}
                        className="rounded-xl bg-card p-2.5 shadow-lg transition-all hover:scale-110 hover:bg-accent">
                        <Eye className="h-4 w-4 text-primary" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-[10px]">View</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" onClick={() => onEdit(member)}
                        className="rounded-xl bg-card p-2.5 shadow-lg transition-all hover:scale-110 hover:bg-accent">
                        <Pencil className="h-4 w-4 text-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-[10px]">Edit</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" onClick={() => onDelete(member)}
                        className="rounded-xl bg-card p-2.5 shadow-lg transition-all hover:scale-110 hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-[10px]">Delete</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <CardContent className="flex flex-1 flex-col p-3 text-center">
                <div className="flex-1">
                  <h3 className="truncate text-sm font-black text-foreground transition-colors duration-300 group-hover:text-primary">
                    {member.name}
                  </h3>
                  <p className="truncate text-[10px] font-bold text-primary">
                    {member.role}
                  </p>
                  <p className="mb-2 text-[9px] font-medium text-muted-foreground/60">
                    {member.department}
                  </p>

                  <div className="mb-2 flex h-9 items-center justify-center gap-1">
                    {member.socialLinks?.linkedin && (
                      <a href={member.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                        aria-label="LinkedIn"
                        className="rounded-lg p-1.5 text-muted-foreground/40 transition-all duration-200 hover:bg-primary/8 hover:text-primary">
                        <Linkedin className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {member.socialLinks?.github && (
                      <a href={member.socialLinks.github} target="_blank" rel="noopener noreferrer"
                        aria-label="GitHub"
                        className="rounded-lg p-1.5 text-muted-foreground/40 transition-all duration-200 hover:bg-muted/50 hover:text-foreground">
                        <Github className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {member.socialLinks?.twitter && (
                      <a href={member.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                        aria-label="Twitter"
                        className="rounded-lg p-1.5 text-muted-foreground/40 transition-all duration-200 hover:bg-primary/8 hover:text-primary">
                        <Twitter className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {member.socialLinks?.website && (
                      <a href={member.socialLinks.website} target="_blank" rel="noopener noreferrer"
                        aria-label="Website"
                        className="rounded-lg p-1.5 text-muted-foreground/40 transition-all duration-200 hover:bg-primary/8 hover:text-primary">
                        <Globe className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>

                  {Array.isArray(member.skills) && member.skills.length > 0 && (
                    <div className="mb-2 flex min-h-[28px] flex-wrap items-center justify-center gap-1">
                      {member.skills.slice(0, 3).map((skill, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center rounded-md border border-primary/10 bg-primary/[0.06] px-2 py-0.5 text-[9px] font-bold leading-none text-primary/80"
                        >
                          {skill}
                        </span>
                      ))}
                      {member.skills.length > 3 && (
                        <span className="inline-flex items-center rounded-md bg-muted/50 px-2 py-0.5 text-[9px] font-bold leading-none text-muted-foreground/40">
                          +{member.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <Separator className="mb-2 opacity-50" />

                <div className="mt-auto flex items-center justify-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" onClick={() => onView(member)}
                        className="rounded-lg p-2 text-muted-foreground/40 transition-all duration-200 hover:scale-110 hover:bg-primary/8 hover:text-primary">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-[10px]">View</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" onClick={() => onEdit(member)}
                        className="rounded-lg p-2 text-muted-foreground/40 transition-all duration-200 hover:scale-110 hover:bg-primary/8 hover:text-primary">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-[10px]">Edit</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" onClick={() => onDelete(member)}
                        className="rounded-lg p-2 text-muted-foreground/40 transition-all duration-200 hover:scale-110 hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-[10px]">Delete</TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>
        ))}
      </div>
    </TooltipProvider>
  )
}