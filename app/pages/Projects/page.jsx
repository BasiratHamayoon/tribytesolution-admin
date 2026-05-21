"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Plus, Folder, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import AdminShell from "../../../mainComponents/SideBar/AdminSiderbar"
import { useAppContext } from "../../AppContext"
import ProjectsSkeleton from "../../../mainComponents/Loaders/ProjectsSkeleton"
import ProjectFilters from "../../../mainComponents/Filters/ProjectFilters"
import ProjectTable from "../../../mainComponents/Tables/ProjectTable"
import ProjectModal from "../../../mainComponents/Modals/ProjectModal"
import ProjectViewModal from "../../../mainComponents/Modals/ProjectViewModal"
import DeleteModal from "../../../mainComponents/Modals/DeleteModal"
import Pagination from "@/components/ui/paginations"

export default function ProjectsAdmin() {
  const { fetchProjects, addProject, updateProject, deleteProject } = useAppContext()

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedTag, setSelectedTag] = useState("all")
  const [sortOrder, setSortOrder] = useState("desc")

  const [pagination, setPagination] = useState({
    currentPage: 1, totalPages: 1, totalItems: 0,
    itemsPerPage: 12, hasNextPage: false, hasPrevPage: false
  })
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [filterOptions, setFilterOptions] = useState({ categories: [], tags: [] })

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [viewProject, setViewProject] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const initialLoadDone = useRef(false)
  const isFirstFilterRun = useRef(true)
  const debounceRef = useRef(null)
  const fetchProjectsRef = useRef(fetchProjects)
  const skipNextFilterEffect = useRef(false)
  const masterFilterOptions = useRef({ categories: [], tags: [] })

  useEffect(() => {
    fetchProjectsRef.current = fetchProjects
  }, [fetchProjects])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchTerm])

  const executeLoadProjects = async ({
    page = 1,
    showLoader = true,
    animate = true,
    search,
    category,
    tag,
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
      const response = await fetchProjectsRef.current({
        page,
        limit: perPage,
        search,
        category,
        tag,
        sortBy: "createdAt",
        sortOrder: order
      })

      setProjects(response.data || [])
      setPagination(response.pagination || {
        currentPage: 1, totalPages: 1, totalItems: 0,
        itemsPerPage: 12, hasNextPage: false, hasPrevPage: false
      })

      const incomingCategories = Array.isArray(response.filters?.categories)
        ? response.filters.categories.filter(Boolean)
        : []
      const incomingTags = Array.isArray(response.filters?.tags)
        ? response.filters.tags.filter(Boolean)
        : []

      if (incomingCategories.length > 0) {
        masterFilterOptions.current.categories = incomingCategories
      }
      if (incomingTags.length > 0) {
        masterFilterOptions.current.tags = incomingTags
      }

      setFilterOptions({
        categories: [...masterFilterOptions.current.categories],
        tags: [...masterFilterOptions.current.tags]
      })

      setTimeout(() => setShowContent(true), 80)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    if (initialLoadDone.current) return
    initialLoadDone.current = true

    setTimeout(() => setHeaderVisible(true), 100)

    executeLoadProjects({
      page: 1,
      showLoader: true,
      animate: false,
      search: "",
      category: "all",
      tag: "all",
      order: "desc",
      perPage: 12
    })
  }, [])

  useEffect(() => {
    if (isFirstFilterRun.current) {
      isFirstFilterRun.current = false
      return
    }

    if (skipNextFilterEffect.current) {
      skipNextFilterEffect.current = false
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      executeLoadProjects({
        page: 1,
        showLoader: false,
        animate: true,
        search: debouncedSearch,
        category: selectedCategory,
        tag: selectedTag,
        order: sortOrder,
        perPage: itemsPerPage
      })
    }, 0)
  }, [debouncedSearch, selectedCategory, selectedTag, sortOrder, itemsPerPage])

  const handlePageChange = (page) => {
    executeLoadProjects({
      page,
      showLoader: false,
      animate: true,
      search: debouncedSearch,
      category: selectedCategory,
      tag: selectedTag,
      order: sortOrder,
      perPage: itemsPerPage
    })
  }

  const handleItemsPerPageChange = (value) => setItemsPerPage(value)
  const toggleSort = () => setSortOrder(prev => prev === "desc" ? "asc" : "desc")

  const handleAddClick = () => { setSelectedProject(null); setIsProjectModalOpen(true) }
  const handleEditClick = (project) => { setSelectedProject(project); setIsProjectModalOpen(true) }
  const handleDeleteClick = (project) => { setSelectedProject(project); setIsDeleteModalOpen(true) }
  const handleViewClick = (project) => { setViewProject(project); setIsViewModalOpen(true) }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    setSelectedTag("all")
  }

  const hasActiveFilters = !!(searchTerm || selectedCategory !== "all" || selectedTag !== "all")

  const refreshWithoutFilters = () => {
    skipNextFilterEffect.current = true
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setSearchTerm("")
    setDebouncedSearch("")
    setSelectedCategory("all")
    setSelectedTag("all")
    setSortOrder("desc")
    executeLoadProjects({
      page: 1,
      showLoader: false,
      animate: true,
      search: "",
      category: "all",
      tag: "all",
      order: "desc",
      perPage: itemsPerPage
    })
  }

  const handleSubmit = async (formData) => {
    setIsSubmitting(true)
    try {
      if (selectedProject) {
        await updateProject(selectedProject._id, formData)
        setIsProjectModalOpen(false)
        setSelectedProject(null)
        executeLoadProjects({
          page: pagination.currentPage,
          showLoader: false,
          animate: true,
          search: debouncedSearch,
          category: selectedCategory,
          tag: selectedTag,
          order: sortOrder,
          perPage: itemsPerPage
        })
      } else {
        await addProject(formData)
        setIsProjectModalOpen(false)
        setSelectedProject(null)
        refreshWithoutFilters()
      }
    } catch (err) {
      console.error(err)
      alert(err.message || "Error saving project")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedProject) return
    setIsSubmitting(true)
    try {
      await deleteProject(selectedProject._id)
      setIsDeleteModalOpen(false)
      setSelectedProject(null)
      executeLoadProjects({
        page: pagination.currentPage,
        showLoader: false,
        animate: true,
        search: debouncedSearch,
        category: selectedCategory,
        tag: selectedTag,
        order: sortOrder,
        perPage: itemsPerPage
      })
    } catch (err) {
      console.error(err)
      alert("Error deleting project")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <AdminShell>
        <ProjectsSkeleton />
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <div className="max-w-7xl mx-auto">

        <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 transition-all duration-700 ${
          headerVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}>
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Folder className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight">Projects</h1>
                <p className="text-muted-foreground text-[11px] font-medium">
                  Manage your portfolio projects
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 border-primary/20 text-primary text-[10px] px-3 py-1.5 rounded-full font-bold">
              <Layers className="w-3 h-3" />
              {pagination.totalItems} Projects
            </Badge>
            <Button
              onClick={handleAddClick}
              size="sm"
              className="h-8 px-4 text-xs font-bold rounded-lg shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Project
            </Button>
          </div>
        </div>

        <div className={`transition-all duration-700 delay-100 ${
          headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          <ProjectFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            debouncedSearch={debouncedSearch}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedTag={selectedTag}
            onTagChange={setSelectedTag}
            sortOrder={sortOrder}
            onSortToggle={toggleSort}
            filterOptions={filterOptions}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        <div className={`relative transition-opacity duration-300 ${loadingMore ? "opacity-60" : ""}`}>
          {loadingMore && (
            <div className="absolute inset-0 z-10 flex items-start justify-center pt-20">
              <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full shadow-lg border border-primary/20">
                <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-[11px] font-semibold text-primary">Loading...</span>
              </div>
            </div>
          )}

          <ProjectTable
            projects={projects}
            isVisible={showContent}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onView={handleViewClick}
            onAdd={handleAddClick}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
            debouncedSearch={debouncedSearch}
          />
        </div>

        <div className={`transition-all duration-500 ${
          showContent && pagination.totalPages > 0 && projects.length > 0
            ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          {pagination.totalPages > 0 && projects.length > 0 && (
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

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => { setIsProjectModalOpen(false); setSelectedProject(null) }}
        onSubmit={handleSubmit}
        project={selectedProject}
        isLoading={isSubmitting}
      />

      <ProjectViewModal
        isOpen={isViewModalOpen}
        onClose={() => { setIsViewModalOpen(false); setViewProject(null) }}
        project={viewProject}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedProject(null) }}
        onConfirm={handleDeleteConfirm}
        title="Delete Project"
        message={`Are you sure you want to delete "${selectedProject?.title}"? This action cannot be undone.`}
        isLoading={isSubmitting}
      />
    </AdminShell>
  )
}