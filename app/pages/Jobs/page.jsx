"use client"

import { useEffect, useState, useRef } from "react"
import {
  Plus, Briefcase, Layers, Star, MapPin,
  Clock, Users, Eye, Pencil, Trash2,
  ToggleLeft, ToggleRight, Sparkles, Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import AdminShell from "../../../mainComponents/SideBar/AdminSiderbar"
import { useAppContext } from "../../AppContext"
import JobsSkeleton from "../../../mainComponents/Loaders/JobsSkeleton"
import JobFilters from "../../../mainComponents/Filters/JobFilters"
import JobModal from "../../../mainComponents/Modals/JobModal"
import DeleteModal from "../../../mainComponents/Modals/DeleteModal"
import ApplicantsDrawer from "../../../mainComponents/Drawers/ApplicantsDrawer"
import Pagination from "@/components/ui/paginations"

const AnimatedCard = ({ children, index, isVisible }) => (
  <div
    className={`transform transition-all duration-400 ease-out ${
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    }`}
    style={{ transitionDelay: `${index * 50}ms` }}
  >
    {children}
  </div>
)

export default function JobsAdmin() {
  const { fetchJobs, addJob, updateJob, deleteJob, isCheckingAuth } = useAppContext()

  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [activeFilter, setActiveFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("desc")

  const [pagination, setPagination] = useState({
    currentPage: 1, totalPages: 1, totalItems: 0,
    itemsPerPage: 12, hasNextPage: false, hasPrevPage: false
  })
  const [itemsPerPage, setItemsPerPage] = useState(12)

  // ─── Filter options built from all jobs seen ───
  const [filterOptions, setFilterOptions] = useState({ departments: [], types: [] })
  const masterFilterOptions = useRef({ departments: [], types: [] })

  const [isJobModalOpen, setIsJobModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isApplicantsOpen, setIsApplicantsOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const initialLoadDone = useRef(false)
  const isFirstFilterRun = useRef(true)
  const debounceRef = useRef(null)
  const fetchJobsRef = useRef(fetchJobs)

  // ─── Track current filter state in refs to avoid stale closures ───
  const searchRef = useRef("")
  const departmentRef = useRef("all")
  const typeRef = useRef("all")
  const activeFilterRef = useRef("all")
  const sortOrderRef = useRef("desc")
  const itemsPerPageRef = useRef(12)
  const currentPageRef = useRef(1)

  useEffect(() => { fetchJobsRef.current = fetchJobs }, [fetchJobs])

  // ─── Debounce search ───
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [searchTerm])

  // ─── Core load function — reads from refs, not state ───
  const executeLoadJobs = async ({
    page = 1,
    showLoader = true,
    animate = true,
    search,
    department,
    type,
    isActive,
    order,
    perPage
  }) => {
    if (animate) {
      setShowContent(false)
      await new Promise(resolve => setTimeout(resolve, 150))
    }
    if (showLoader) setLoading(true)
    else setLoadingMore(true)

    try {
      const response = await fetchJobsRef.current({
        page,
        limit: perPage,
        search,
        department,
        type,
        isActive,
        sortBy: "createdAt",
        sortOrder: order
      })

      const jobsData = response.data || []
      setJobs(jobsData)
      setPagination(response.pagination || {
        currentPage: 1, totalPages: 1, totalItems: 0,
        itemsPerPage: 12, hasNextPage: false, hasPrevPage: false
      })
      currentPageRef.current = response.pagination?.currentPage || page

      // ─── Build filter options from response.filters OR extract from data ───
      // Try response.filters first (if backend provides it)
      const incomingDepts = Array.isArray(response.filters?.departments)
        ? response.filters.departments.filter(Boolean)
        : []
      const incomingTypes = Array.isArray(response.filters?.types)
        ? response.filters.types.filter(Boolean)
        : []

      // Fallback: extract from the jobs data itself
      const extractedDepts = jobsData
        .map(j => j.department)
        .filter(Boolean)
      const extractedTypes = jobsData
        .map(j => j.type)
        .filter(Boolean)

      // Merge into master — never shrink the list
      const newDepts = incomingDepts.length > 0 ? incomingDepts : extractedDepts
      const newTypes = incomingTypes.length > 0 ? incomingTypes : extractedTypes

      newDepts.forEach(d => {
        if (d && !masterFilterOptions.current.departments.includes(d)) {
          masterFilterOptions.current.departments.push(d)
        }
      })
      newTypes.forEach(t => {
        if (t && !masterFilterOptions.current.types.includes(t)) {
          masterFilterOptions.current.types.push(t)
        }
      })

      setFilterOptions({
        departments: [...masterFilterOptions.current.departments],
        types: [...masterFilterOptions.current.types]
      })

      setTimeout(() => setShowContent(true), 80)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // ─── Initial load — wait for auth ───
  useEffect(() => {
    if (isCheckingAuth) return
    if (initialLoadDone.current) return
    initialLoadDone.current = true

    setTimeout(() => setHeaderVisible(true), 100)

    executeLoadJobs({
      page: 1, showLoader: true, animate: false,
      search: "", department: "all", type: "all",
      isActive: "all", order: "desc", perPage: 12
    })
  }, [isCheckingAuth])

  // ─── Filter effect — only fires when filters actually change ───
  useEffect(() => {
    // Skip the very first run (initial load handles it)
    if (isFirstFilterRun.current) {
      isFirstFilterRun.current = false
      return
    }

    // Skip if initial load hasn't happened yet
    if (!initialLoadDone.current) return

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      // Read current values from refs to avoid stale state
      executeLoadJobs({
        page: 1,
        showLoader: false,
        animate: true,
        search: debouncedSearch,
        category: selectedDepartment,
        department: selectedDepartment,
        type: selectedType,
        isActive: activeFilter,
        order: sortOrder,
        perPage: itemsPerPage
      })
    }, 0)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [debouncedSearch, selectedDepartment, selectedType, activeFilter, sortOrder, itemsPerPage])

  const handlePageChange = (page) => {
    executeLoadJobs({
      page, showLoader: false, animate: true,
      search: debouncedSearch, department: selectedDepartment,
      type: selectedType, isActive: activeFilter,
      order: sortOrder, perPage: itemsPerPage
    })
  }

  const handleItemsPerPageChange = (value) => setItemsPerPage(value)
  const toggleSort = () => setSortOrder(prev => prev === "desc" ? "asc" : "desc")

  const handleAddClick = () => { setSelectedJob(null); setIsJobModalOpen(true) }
  const handleEditClick = (job) => { setSelectedJob(job); setIsJobModalOpen(true) }
  const handleDeleteClick = (job) => { setSelectedJob(job); setIsDeleteModalOpen(true) }
  const handleViewApplicants = (job) => { setSelectedJob(job); setIsApplicantsOpen(true) }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedDepartment("all")
    setSelectedType("all")
    setActiveFilter("all")
  }

  const hasActiveFilters = !!(
    searchTerm ||
    selectedDepartment !== "all" ||
    selectedType !== "all" ||
    activeFilter !== "all"
  )

  // ─── Reload using current filter state (for after create/delete/update) ───
  const reloadCurrentView = () => {
    executeLoadJobs({
      page: currentPageRef.current,
      showLoader: false,
      animate: false,          // no animation — just refresh data silently
      search: debouncedSearch,
      department: selectedDepartment,
      type: selectedType,
      isActive: activeFilter,
      order: sortOrder,
      perPage: itemsPerPage
    })
  }

  // ─── After adding — go back to page 1, no filters ───
  const reloadAfterAdd = () => {
    // Reset filter states
    setSearchTerm("")
    setDebouncedSearch("")
    setSelectedDepartment("all")
    setSelectedType("all")
    setActiveFilter("all")
    setSortOrder("desc")

    // Directly call API — do NOT rely on useEffect
    // because state updates are async and the filter
    // useEffect would fire again with old values
    executeLoadJobs({
      page: 1,
      showLoader: false,
      animate: true,
      search: "",
      department: "all",
      type: "all",
      isActive: "all",
      order: "desc",
      perPage: itemsPerPage
    })
  }

  const handleSubmit = async (jobData) => {
    setIsSubmitting(true)
    try {
      if (selectedJob) {
        await updateJob(selectedJob._id, jobData)
        setIsJobModalOpen(false)
        setSelectedJob(null)
        // ─── After update: reload same page with same filters ───
        reloadCurrentView()
      } else {
        await addJob(jobData)
        setIsJobModalOpen(false)
        setSelectedJob(null)
        // ─── After add: reset to clean state ───
        reloadAfterAdd()
      }
    } catch (err) {
      console.error(err)
      alert(err.message || "Error saving job")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedJob) return
    setIsSubmitting(true)
    try {
      await deleteJob(selectedJob._id)
      setIsDeleteModalOpen(false)
      setSelectedJob(null)
      reloadCurrentView()
    } catch (err) {
      console.error(err)
      alert("Error deleting job")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ─── Optimistic toggle — update UI instantly, no API reload ───
  const handleToggleActive = async (job) => {
    // Optimistic update
    setJobs(prev =>
      prev.map(j => j._id === job._id ? { ...j, isActive: !j.isActive } : j)
    )
    try {
      await updateJob(job._id, { isActive: !job.isActive })
    } catch (err) {
      console.error(err)
      // Revert on failure
      setJobs(prev =>
        prev.map(j => j._id === job._id ? { ...j, isActive: job.isActive } : j)
      )
    }
  }

  if (loading) {
    return (
      <AdminShell>
        <JobsSkeleton />
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 transition-all duration-700 ${
          headerVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}>
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight">Jobs</h1>
                <p className="text-muted-foreground text-[11px] font-medium">
                  Manage job listings and applications
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 border-primary/20 text-primary text-[10px] px-3 py-1.5 rounded-full font-bold">
              <Layers className="w-3 h-3" />
              {pagination.totalItems} Jobs
            </Badge>
            <Button
              onClick={handleAddClick}
              size="sm"
              className="h-8 px-4 text-xs font-bold rounded-lg shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Job
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className={`transition-all duration-700 delay-100 ${
          headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          <JobFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            debouncedSearch={debouncedSearch}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={setSelectedDepartment}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            activeFilter={activeFilter}
            onActiveFilterChange={setActiveFilter}
            sortOrder={sortOrder}
            onSortToggle={toggleSort}
            filterOptions={filterOptions}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        {/* Content */}
        <div className={`relative transition-opacity duration-300 ${loadingMore ? "opacity-60" : ""}`}>
          {loadingMore && (
            <div className="absolute inset-0 z-10 flex items-start justify-center pt-20">
              <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full shadow-lg border border-primary/20">
                <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-[11px] font-semibold text-primary">Loading...</span>
              </div>
            </div>
          )}

          {jobs.length === 0 ? (
            <Card className={`border-dashed border-2 border-primary/20 transition-all duration-500 ${
              showContent ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}>
              <CardContent className="py-16 text-center">
                <div className={`w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-700 ${
                  showContent ? "scale-100 rotate-0" : "scale-0 rotate-45"
                }`}>
                  {hasActiveFilters
                    ? <Search className="w-8 h-8 text-primary/30" />
                    : <Sparkles className="w-8 h-8 text-primary/30" />
                  }
                </div>
                <h3 className="text-sm font-black text-foreground mb-1.5">
                  {debouncedSearch ? "No results found" : hasActiveFilters ? "No jobs match" : "No jobs yet"}
                </h3>
                <p className="text-muted-foreground text-xs max-w-[280px] mx-auto">
                  {debouncedSearch
                    ? `No jobs match "${debouncedSearch}"`
                    : hasActiveFilters
                      ? "Try adjusting your filters"
                      : "Start by adding your first job listing"
                  }
                </p>
                {hasActiveFilters ? (
                  <Button onClick={clearFilters} variant="outline" size="sm"
                    className="mt-4 h-8 text-[10px] rounded-lg font-bold">
                    Clear Filters
                  </Button>
                ) : (
                  <Button onClick={handleAddClick} size="sm"
                    className="mt-4 h-8 text-[10px] rounded-lg font-bold shadow-md shadow-primary/20">
                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Job
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {jobs.map((job, index) => (
                <AnimatedCard key={job._id} index={index} isVisible={showContent}>
                  <JobCard
                    job={job}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    onViewApplicants={handleViewApplicants}
                    onToggleActive={handleToggleActive}
                  />
                </AnimatedCard>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className={`transition-all duration-500 ${
          showContent && pagination.totalPages > 0 && jobs.length > 0
            ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          {pagination.totalPages > 0 && jobs.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border/50">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                hasNextPage={pagination.hasNextPage}
                hasPrevPage={pagination.hasPrevPage}
                isLoading={loadingMore}
                showItemsPerPage={true}
                showPageInfo={true}
                itemsPerPageOptions={[6, 12, 24, 48]}
              />
            </div>
          )}
        </div>
      </div>

      <JobModal
        isOpen={isJobModalOpen}
        onClose={() => { setIsJobModalOpen(false); setSelectedJob(null) }}
        onSubmit={handleSubmit}
        job={selectedJob}
        isLoading={isSubmitting}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedJob(null) }}
        onConfirm={handleDeleteConfirm}
        title="Delete Job"
        message={`Are you sure you want to delete "${selectedJob?.title}"? This action cannot be undone.`}
        isLoading={isSubmitting}
      />

      <ApplicantsDrawer
        isOpen={isApplicantsOpen}
        onClose={() => { setIsApplicantsOpen(false); setSelectedJob(null) }}
        job={selectedJob}
      />
    </AdminShell>
  )
}

// ─── Job Card Component ───────────────────────────────────────────────────────
function JobCard({ job, onEdit, onDelete, onViewApplicants, onToggleActive }) {
  const typeColors = {
    "Full-Time":  "bg-primary/10 text-primary",
    "Part-Time":  "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    "Contract":   "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    "Internship": "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    "Remote":     "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  }

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.07] transition-all duration-300 relative">
      <div className={`absolute top-0 left-0 right-0 h-[2px] transition-all duration-300 ${
        job.isActive
          ? "bg-gradient-to-r from-transparent via-primary/50 to-transparent group-hover:via-primary"
          : "bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent"
      }`} />

      <CardContent className="p-4 pt-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-1.5 mb-1">
              {job.isFeatured && (
                <div className="p-0.5 rounded-full bg-primary/10">
                  <Star className="w-2.5 h-2.5 text-primary fill-primary" />
                </div>
              )}
              <h3 className="text-[13px] font-black text-foreground truncate group-hover:text-primary transition-colors duration-300 leading-tight">
                {job.title}
              </h3>
            </div>
            <p className="text-[10px] font-bold text-primary/80 truncate">{job.department}</p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${
              job.isActive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-muted text-muted-foreground/50"
            }`}>
              {job.isActive ? "LIVE" : "OFF"}
            </span>
            <button
              onClick={() => onToggleActive(job)}
              className="transition-all duration-300 hover:scale-110"
              title={job.isActive ? "Deactivate" : "Activate"}
            >
              {job.isActive
                ? <ToggleRight className="w-6 h-6 text-primary" />
                : <ToggleLeft className="w-6 h-6 text-muted-foreground/40" />
              }
            </button>
          </div>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {job.type && (
            <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
              typeColors[job.type] || "bg-muted text-muted-foreground"
            }`}>
              <Clock className="w-2.5 h-2.5" />
              {job.type}
            </span>
          )}
          {job.location && (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
              <MapPin className="w-2.5 h-2.5" />
              {job.location}
            </span>
          )}
          {job.experience && (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
              {job.experience}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-[11px] text-muted-foreground/70 line-clamp-2 mb-3 leading-relaxed">
          {job.description}
        </p>

        {/* Skills */}
        {job.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {job.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="px-1.5 py-0.5 bg-primary/[0.06] text-primary/80 text-[8px] font-bold rounded-full border border-primary/10 whitespace-nowrap"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="px-1.5 py-0.5 text-muted-foreground/40 text-[8px] font-bold rounded-full bg-muted/50">
                +{job.skills.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Salary */}
        {job.salary && (
          <div className="flex items-center gap-1 mb-3">
            <span className="text-[10px] font-black text-foreground/80">💰 {job.salary}</span>
          </div>
        )}

        <Separator className="mb-3 opacity-50" />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onViewApplicants(job)}
            className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors duration-200 group/btn"
          >
            <div className="p-1 rounded-lg bg-muted/50 group-hover/btn:bg-primary/10 transition-colors duration-200">
              <Users className="w-3 h-3" />
            </div>
            <span>{job.applicantsCount || 0} Applicants</span>
          </button>

          <div className="flex items-center gap-0.5">
            <button
              onClick={() => onViewApplicants(job)}
              className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-primary hover:bg-primary/8 transition-all duration-200 hover:scale-110"
              title="View Applicants"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onEdit(job)}
              className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-primary hover:bg-primary/8 transition-all duration-200 hover:scale-110"
              title="Edit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(job)}
              className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/8 transition-all duration-200 hover:scale-110"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}