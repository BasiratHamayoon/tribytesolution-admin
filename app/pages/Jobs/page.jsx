"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Plus, Trash2, Pencil, Search, X, SortAsc, SortDesc,
  Filter, Loader2, Sparkles, Briefcase, Layers, MapPin,
  Clock, Users, Eye, ToggleLeft, ToggleRight, Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import AdminShell from "../../../mainComponents/SideBar/AdminSiderbar"
import { useAppContext } from "../../AppContext"
import JobModal from "../../../mainComponents/Modals/JobModal"
import DeleteModal from "../../../mainComponents/Modals/DeleteModal"
import ApplicantsDrawer from "../../../mainComponents/Drawers/ApplicantsDrawer"
import Pagination from "@/components/ui/paginations"

const AnimatedCard = ({ children, index, isVisible }) => (
  <div
    className={`transform transition-all duration-300 ease-out ${
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    }`}
    style={{ transitionDelay: `${index * 50}ms` }}
  >
    {children}
  </div>
)

export default function JobsAdmin() {
  const { fetchJobs, addJob, updateJob, deleteJob } = useAppContext()

  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showContent, setShowContent] = useState(false)

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

  const [departments, setDepartments] = useState([])
  const [types, setTypes] = useState([])

  const [isJobModalOpen, setIsJobModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isApplicantsOpen, setIsApplicantsOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const loadJobs = useCallback(async (page = 1, showLoader = true, animate = true) => {
    if (animate) {
      setShowContent(false)
      await new Promise(resolve => setTimeout(resolve, 150))
    }
    if (showLoader) setLoading(true)
    else setLoadingMore(true)

    try {
      const response = await fetchJobs({
        page, limit: itemsPerPage, search: debouncedSearch,
        department: selectedDepartment, type: selectedType,
        isActive: activeFilter, sortBy: "createdAt", sortOrder
      })
      setJobs(response.data)
      setPagination(response.pagination)
      if (response.data.length > 0) {
        const depts = [...new Set(response.data.map(j => j.department).filter(Boolean))]
        const tps = [...new Set(response.data.map(j => j.type).filter(Boolean))]
        if (depts.length) setDepartments(depts)
        if (tps.length) setTypes(tps)
      }
      setTimeout(() => setShowContent(true), 50)
    } catch (err) { console.error(err) }
    finally { setLoading(false); setLoadingMore(false) }
  }, [fetchJobs, itemsPerPage, debouncedSearch, selectedDepartment, selectedType, activeFilter, sortOrder])

  useEffect(() => { loadJobs(1, true, false) }, [])
  useEffect(() => {
    if (!loading) loadJobs(1, false, true)
  }, [debouncedSearch, selectedDepartment, selectedType, activeFilter, sortOrder, itemsPerPage])

  const handlePageChange = (page) => loadJobs(page, false, true)
  const handleItemsPerPageChange = (value) => setItemsPerPage(value)
  const toggleSort = () => setSortOrder(prev => prev === "desc" ? "asc" : "desc")

  const handleAddClick = () => { setSelectedJob(null); setIsJobModalOpen(true) }
  const handleEditClick = (job) => { setSelectedJob(job); setIsJobModalOpen(true) }
  const handleDeleteClick = (job) => { setSelectedJob(job); setIsDeleteModalOpen(true) }
  const handleViewApplicants = (job) => { setSelectedJob(job); setIsApplicantsOpen(true) }

  const handleSubmit = async (jobData) => {
    setIsSubmitting(true)
    try {
      if (selectedJob) await updateJob(selectedJob._id, jobData)
      else await addJob(jobData)
      setIsJobModalOpen(false); setSelectedJob(null)
      loadJobs(pagination.currentPage, false, true)
    } catch (err) { console.error(err); alert(err.message || "Error saving job") }
    finally { setIsSubmitting(false) }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedJob) return
    setIsSubmitting(true)
    try {
      await deleteJob(selectedJob._id)
      setIsDeleteModalOpen(false); setSelectedJob(null)
      loadJobs(pagination.currentPage, false, true)
    } catch (err) { console.error(err); alert("Error deleting job") }
    finally { setIsSubmitting(false) }
  }

  const handleToggleActive = async (job) => {
    try {
      await updateJob(job._id, { isActive: !job.isActive })
      loadJobs(pagination.currentPage, false, false)
    } catch (err) { console.error(err) }
  }

  const clearFilters = () => {
    setSearchTerm(""); setSelectedDepartment("all")
    setSelectedType("all"); setActiveFilter("all")
  }

  const hasActiveFilters = searchTerm || selectedDepartment !== "all" || selectedType !== "all" || activeFilter !== "all"

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
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2.5 mb-0.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground">Jobs</h1>
            </div>
            <p className="text-muted-foreground text-xs ml-0 sm:ml-11">
              Manage job listings and applications
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 border-primary/20 text-primary text-[10px] px-2.5 py-1">
              <Layers className="w-3 h-3" />
              {pagination.totalItems} Jobs
            </Badge>
            <Button onClick={handleAddClick} size="sm" className="h-8 px-3 text-xs font-semibold">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Job
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-2.5 mb-5">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${
                searchTerm ? "text-primary" : "text-muted-foreground"
              }`} />
              <Input placeholder="Search jobs..." className={`pl-9 h-9 text-xs bg-card border-border rounded-lg ${
                searchTerm ? "ring-1 ring-primary border-primary" : ""
              }`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-accent rounded-full">
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
            <button onClick={toggleSort}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-card border border-border rounded-lg hover:bg-accent text-xs font-medium text-muted-foreground transition-colors">
              {sortOrder === "desc" ? <SortDesc className="w-3.5 h-3.5" /> : <SortAsc className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{sortOrder === "desc" ? "Newest" : "Oldest"}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filters:</span>
            </div>
            <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-2.5 py-1.5 bg-card border border-border rounded-md text-[11px] font-medium text-foreground outline-none focus:ring-1 focus:ring-primary">
              <option value="all">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}
              className="px-2.5 py-1.5 bg-card border border-border rounded-md text-[11px] font-medium text-foreground outline-none focus:ring-1 focus:ring-primary">
              <option value="all">All Types</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-card border border-border rounded-md text-[11px] font-medium text-foreground outline-none focus:ring-1 focus:ring-primary">
              <option value="all">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            {hasActiveFilters && (
              <button onClick={clearFilters}
                className="flex items-center gap-1 px-2 py-1.5 text-[11px] font-medium text-destructive hover:bg-destructive/10 rounded-md">
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        </div>

        {loadingMore && (
          <div className="flex items-center justify-center gap-1.5 py-2 mb-3 text-xs text-muted-foreground">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading...
          </div>
        )}

        {/* Jobs Grid */}
        <div className={`transition-opacity ${loadingMore ? "opacity-60 pointer-events-none" : ""}`}>
          {jobs.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="py-16 text-center">
                <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
                  {hasActiveFilters ? <Search className="w-7 h-7 text-muted-foreground/40" /> : <Sparkles className="w-7 h-7 text-muted-foreground/40" />}
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1">
                  {hasActiveFilters ? "No jobs found" : "No jobs yet"}
                </h3>
                <p className="text-muted-foreground text-xs mb-4">
                  {hasActiveFilters ? "Try adjusting your filters" : "Start by adding your first job listing"}
                </p>
                {hasActiveFilters ? (
                  <Button onClick={clearFilters} variant="outline" size="sm" className="h-8 text-xs rounded-lg">Clear Filters</Button>
                ) : (
                  <Button onClick={handleAddClick} size="sm" className="h-8 text-xs rounded-lg">
                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Job
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {jobs.map((job, index) => (
                <AnimatedCard key={job._id} index={index} isVisible={showContent}>
                  <Card className="group overflow-hidden border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/[0.05] transition-all">
                    <CardContent className="p-4">
                      {/* Top row */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            {job.isFeatured && (
                              <Star className="w-3 h-3 text-primary fill-primary shrink-0" />
                            )}
                            <h3 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                              {job.title}
                            </h3>
                          </div>
                          <p className="text-[10px] font-semibold text-primary">{job.department}</p>
                        </div>
                        <button onClick={() => handleToggleActive(job)}
                          className="shrink-0 ml-2" title={job.isActive ? "Active" : "Inactive"}>
                          {job.isActive ? (
                            <ToggleRight className="w-5 h-5 text-primary" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                          )}
                        </button>
                      </div>

                      {/* Info chips */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-5 border-0 bg-muted text-muted-foreground gap-1">
                          <MapPin className="w-2.5 h-2.5" /> {job.location}
                        </Badge>
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-5 border-0 bg-muted text-muted-foreground gap-1">
                          <Clock className="w-2.5 h-2.5" /> {job.type}
                        </Badge>
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-5 border-0 bg-muted text-muted-foreground gap-1">
                          {job.experience}
                        </Badge>
                      </div>

                      {/* Description */}
                      <p className="text-muted-foreground text-xs line-clamp-2 mb-3">{job.description}</p>

                      {/* Skills */}
                      {job.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {job.skills.slice(0, 4).map((skill) => (
                            <span key={skill} className="px-1.5 py-0.5 bg-primary/5 text-primary text-[9px] font-medium rounded border border-primary/10">
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 4 && (
                            <span className="px-1.5 py-0.5 text-muted-foreground/60 text-[9px] font-medium">
                              +{job.skills.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Salary */}
                      {job.salary && (
                        <p className="text-[10px] font-semibold text-foreground mb-3">
                          💰 {job.salary}
                        </p>
                      )}

                      <Separator className="mb-3" />

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <button onClick={() => handleViewApplicants(job)}
                          className="flex items-center gap-1 text-[10px] font-medium text-primary hover:text-primary/80 transition-colors">
                          <Users className="w-3 h-3" />
                          {job.applicantsCount || 0} Applicants
                        </button>
                        <div className="flex items-center gap-0.5">
                          <button onClick={() => handleViewApplicants(job)}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-all">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleEditClick(job)}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-all">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteClick(job)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 0 && jobs.length > 0 && (
          <div className={`mt-6 pt-4 border-t border-border transition-all ${showContent ? "opacity-100" : "opacity-0"}`}>
            <Pagination
              currentPage={pagination.currentPage} totalPages={pagination.totalPages}
              totalItems={pagination.totalItems} itemsPerPage={pagination.itemsPerPage}
              onPageChange={handlePageChange} onItemsPerPageChange={handleItemsPerPageChange}
              hasNextPage={pagination.hasNextPage} hasPrevPage={pagination.hasPrevPage}
              isLoading={loadingMore} showItemsPerPage={true} showPageInfo={true}
              itemsPerPageOptions={[6, 12, 24, 48]}
            />
          </div>
        )}
      </div>

      <JobModal isOpen={isJobModalOpen}
        onClose={() => { setIsJobModalOpen(false); setSelectedJob(null) }}
        onSubmit={handleSubmit} job={selectedJob} isLoading={isSubmitting} />

      <DeleteModal isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedJob(null) }}
        onConfirm={handleDeleteConfirm} title="Delete Job"
        message={`Are you sure you want to delete "${selectedJob?.title}"?`}
        isLoading={isSubmitting} />

      <ApplicantsDrawer isOpen={isApplicantsOpen}
        onClose={() => { setIsApplicantsOpen(false); setSelectedJob(null) }}
        job={selectedJob} />
    </AdminShell>
  )
}

function JobsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 bg-muted rounded-lg animate-pulse" />
            <div className="h-5 w-16 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-3 w-44 bg-muted/60 rounded animate-pulse ml-11" />
        </div>
        <div className="h-8 w-24 bg-muted rounded-lg animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}><CardContent className="p-4 space-y-2.5 animate-pulse">
            <div className="h-4 w-3/4 bg-muted rounded" />
            <div className="h-3 w-20 bg-muted/60 rounded" />
            <div className="flex gap-1.5">
              <div className="h-5 w-16 bg-muted rounded" />
              <div className="h-5 w-14 bg-muted rounded" />
            </div>
            <div className="h-3 w-full bg-muted/60 rounded" />
            <div className="h-3 w-5/6 bg-muted/60 rounded" />
          </CardContent></Card>
        ))}
      </div>
    </div>
  )
}