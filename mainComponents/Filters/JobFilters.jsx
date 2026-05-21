"use client"

import { useState, useRef, useEffect } from "react"
import {
  Search, X, SortAsc, SortDesc, Filter, Loader2,
  ChevronDown, Briefcase, Clock, Check, ToggleRight
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createPortal } from "react-dom"

function CustomDropdown({ value, onChange, options, placeholder, icon: Icon }) {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownStyle, setDropdownStyle] = useState({})
  const buttonRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        buttonRef.current && !buttonRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const handleScroll = () => setIsOpen(false)
    window.addEventListener("scroll", handleScroll, true)
    return () => window.removeEventListener("scroll", handleScroll, true)
  }, [])

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 6,
        left: rect.left,
        minWidth: Math.max(rect.width, 180),
        zIndex: 9999
      })
    }
    setIsOpen(prev => !prev)
  }

  const safeOptions = Array.isArray(options) ? options.filter(Boolean) : []
  const selectedLabel = value === "all" ? placeholder : value
  const isActive = value !== "all"

  const dropdown = isOpen ? (
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="bg-card border border-border rounded-xl shadow-2xl shadow-black/15 dark:shadow-black/40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-w-[240px]"
    >
      <div className="max-h-56 overflow-y-auto py-1 scrollbar-hide">
        <button
          type="button"
          onClick={() => { onChange("all"); setIsOpen(false) }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium transition-all duration-200 ${
            value === "all"
              ? "bg-primary/10 text-primary font-bold"
              : "text-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <span>{placeholder}</span>
          {value === "all" && <Check className="w-3.5 h-3.5 text-primary shrink-0 ml-3" />}
        </button>
        {safeOptions.length > 0 ? (
          safeOptions.map(opt => (
            <button
              type="button"
              key={opt}
              onClick={() => { onChange(opt); setIsOpen(false) }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium transition-all duration-200 ${
                value === opt
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <span className="truncate pr-2">{opt}</span>
              {value === opt && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
            </button>
          ))
        ) : (
          <div className="px-3.5 py-3 text-[10px] text-muted-foreground/50 text-center font-medium">
            No options available
          </div>
        )}
      </div>
    </div>
  ) : null

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className={`h-9 pl-3 pr-8 border rounded-lg text-xs font-semibold outline-none cursor-pointer transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap relative ${
          isActive
            ? "bg-primary/10 border-primary/30 text-primary ring-1 ring-primary/20"
            : "bg-muted/30 border-border/50 text-foreground hover:bg-muted/50 hover:border-primary/20"
        }`}
      >
        {Icon && <Icon className={`w-3 h-3 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground/50"}`} />}
        <span className="max-w-[100px] truncate">{selectedLabel}</span>
        {safeOptions.length > 0 && (
          <span className={`text-[8px] font-bold px-1 py-0 rounded-full ${
            isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground/50"
          }`}>
            {safeOptions.length}
          </span>
        )}
        <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 transition-transform duration-300 ${
          isOpen ? "rotate-180" : ""
        } ${isActive ? "text-primary" : "text-muted-foreground/50"}`} />
      </button>

      {typeof document !== "undefined" && dropdown && createPortal(dropdown, document.body)}
    </div>
  )
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
]

export default function JobFilters({
  searchTerm,
  onSearchChange,
  debouncedSearch,
  selectedDepartment,
  onDepartmentChange,
  selectedType,
  onTypeChange,
  activeFilter,
  onActiveFilterChange,
  sortOrder,
  onSortToggle,
  filterOptions,
  onClearFilters,
  hasActiveFilters
}) {
  const departments = Array.isArray(filterOptions?.departments)
    ? filterOptions.departments.filter(Boolean)
    : []
  const types = Array.isArray(filterOptions?.types)
    ? filterOptions.types.filter(Boolean)
    : []

  const activeLabel = STATUS_OPTIONS.find(o => o.value === activeFilter)?.label || "All Status"
  const isActiveFilterOn = activeFilter !== "all"

  return (
    <Card className="border-border/50 mb-5 relative">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-t-xl" />
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 transition-colors duration-300 ${
                searchTerm ? "text-primary" : "text-muted-foreground"
              }`} />
              <Input
                placeholder="Search jobs by title, department..."
                className={`pl-9 h-9 text-xs bg-muted/30 border-border/50 rounded-lg transition-all duration-300 ${
                  searchTerm
                    ? "ring-1 ring-primary/50 border-primary/50 bg-primary/[0.02]"
                    : "focus:ring-1 focus:ring-primary/30"
                }`}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              {searchTerm && debouncedSearch === searchTerm && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 hover:bg-primary/10 rounded-full transition-colors duration-200"
                >
                  <X className="w-3 h-3 text-muted-foreground hover:text-primary" />
                </button>
              )}
              {debouncedSearch !== searchTerm && searchTerm && (
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                </div>
              )}
            </div>

            {/* Dropdowns */}
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <CustomDropdown
                value={selectedDepartment}
                onChange={onDepartmentChange}
                options={departments}
                placeholder="All Departments"
                icon={Briefcase}
              />

              <CustomDropdown
                value={selectedType}
                onChange={onTypeChange}
                options={types}
                placeholder="All Types"
                icon={Clock}
              />

              {/* Status Toggle */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    const next = activeFilter === "all" ? "true" : activeFilter === "true" ? "false" : "all"
                    onActiveFilterChange(next)
                  }}
                  className={`h-9 pl-3 pr-3 border rounded-lg text-xs font-semibold outline-none cursor-pointer transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap ${
                    isActiveFilterOn
                      ? "bg-primary/10 border-primary/30 text-primary ring-1 ring-primary/20"
                      : "bg-muted/30 border-border/50 text-foreground hover:bg-muted/50 hover:border-primary/20"
                  }`}
                >
                  <ToggleRight className={`w-3 h-3 ${isActiveFilterOn ? "text-primary" : "text-muted-foreground/50"}`} />
                  <span>{activeLabel}</span>
                </button>
              </div>

              {/* Sort */}
              <button
                onClick={onSortToggle}
                className="flex items-center justify-center gap-1.5 px-3 h-9 bg-muted/30 border border-border/50 rounded-lg hover:bg-primary/5 hover:border-primary/30 text-xs font-bold text-muted-foreground hover:text-primary transition-all duration-300 whitespace-nowrap"
              >
                <div className="relative w-3.5 h-3.5">
                  <SortDesc className={`w-3.5 h-3.5 absolute transition-all duration-300 ${sortOrder === "desc" ? "opacity-100 rotate-0" : "opacity-0 rotate-180"}`} />
                  <SortAsc className={`w-3.5 h-3.5 absolute transition-all duration-300 ${sortOrder === "asc" ? "opacity-100 rotate-0" : "opacity-0 -rotate-180"}`} />
                </div>
                <span className="hidden sm:inline">{sortOrder === "desc" ? "Newest" : "Oldest"}</span>
              </button>
            </div>
          </div>

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold">
                <Filter className="w-3 h-3 text-primary" />
                Active:
              </div>
              {searchTerm && (
                <Badge variant="secondary" className="text-[9px] px-2 py-0.5 bg-primary/10 text-primary border-0 rounded-full font-bold gap-1 hover:bg-primary/15 transition-colors">
                  {searchTerm.length > 12 ? searchTerm.slice(0, 12) + "..." : searchTerm}
                  <button onClick={() => onSearchChange("")} className="hover:text-primary/60">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </Badge>
              )}
              {selectedDepartment !== "all" && (
                <Badge variant="secondary" className="text-[9px] px-2 py-0.5 bg-primary/10 text-primary border-0 rounded-full font-bold gap-1 hover:bg-primary/15 transition-colors">
                  {selectedDepartment}
                  <button onClick={() => onDepartmentChange("all")} className="hover:text-primary/60">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </Badge>
              )}
              {selectedType !== "all" && (
                <Badge variant="secondary" className="text-[9px] px-2 py-0.5 bg-primary/10 text-primary border-0 rounded-full font-bold gap-1 hover:bg-primary/15 transition-colors">
                  {selectedType}
                  <button onClick={() => onTypeChange("all")} className="hover:text-primary/60">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </Badge>
              )}
              {activeFilter !== "all" && (
                <Badge variant="secondary" className="text-[9px] px-2 py-0.5 bg-primary/10 text-primary border-0 rounded-full font-bold gap-1 hover:bg-primary/15 transition-colors">
                  {activeLabel}
                  <button onClick={() => onActiveFilterChange("all")} className="hover:text-primary/60">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </Badge>
              )}
              <button
                onClick={onClearFilters}
                className="text-[10px] font-bold text-primary/60 hover:text-primary hover:bg-primary/5 px-2 py-0.5 rounded-full transition-all duration-200"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}