"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import { 
  Plus, Trash2, ExternalLink, Github, Folder, 
  Image as ImageIcon, Layers, Pencil, Eye, Search, 
  X, SortAsc, SortDesc, Filter, Loader2, Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AdminShell from "../../../mainComponents/SideBar/AdminSiderbar"
import { useAppContext } from "../../AppContext"
import ProjectsSkeleton from "../../../mainComponents/Loaders/ProjectsSkeleton"
import ProjectModal from "../../../mainComponents/Modals/ProjectModal"
import DeleteModal from "../../../mainComponents/Modals/DeleteModal"
import Pagination from "@/components/ui/paginations"
import { getImageUrl } from '@/utils/getImageUrl'

const AnimatedCard = ({ children, index, isVisible }) => (
  <div
    className={`transform transition-all duration-300 ease-out ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}
    style={{ transitionDelay: `${index * 50}ms` }}
  >
    {children}
  </div>
)

const ProjectImage = ({ src, alt, className = "" }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const imageUrl = getImageUrl(src)
  
  if (!imageUrl || hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
      </div>
    )
  }

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}
      <Image
        src={imageUrl}
        alt={alt || "Project image"}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={`object-cover transition-all duration-500 ${
          isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
        } ${className}`}
        onLoad={() => setIsLoading(false)}
        onError={() => { setIsLoading(false); setHasError(true) }}
        unoptimized
      />
    </>
  )
}

export default function ProjectsAdmin() {
  const { fetchProjects, addProject, updateProject, deleteProject } = useAppContext()
  
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showContent, setShowContent] = useState(false)
  
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const loadProjects = useCallback(async (page = 1, showLoader = true, animate = true) => {
    if (animate) {
      setShowContent(false)
      await new Promise(resolve => setTimeout(resolve, 150))
    }
    if (showLoader) setLoading(true)
    else setLoadingMore(true)
    
    try {
      const response = await fetchProjects({
        page, limit: itemsPerPage, search: debouncedSearch,
        category: selectedCategory, tag: selectedTag,
        sortBy: 'createdAt', sortOrder
      })
      setProjects(response.data)
      setPagination(response.pagination)
      setFilterOptions(response.filters)
      setTimeout(() => setShowContent(true), 50)
    } catch (err) { console.error(err) }
    finally { setLoading(false); setLoadingMore(false) }
  }, [fetchProjects, itemsPerPage, debouncedSearch, selectedCategory, selectedTag, sortOrder])

  useEffect(() => { loadProjects(1, true, false) }, [])
  useEffect(() => { if (!loading) loadProjects(1, false, true) },
    [debouncedSearch, selectedCategory, selectedTag, sortOrder, itemsPerPage])

  const handlePageChange = (page) => loadProjects(page, false, true)
  const handleItemsPerPageChange = (value) => setItemsPerPage(value)
  const toggleSort = () => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')

  const handleAddClick = () => { setSelectedProject(null); setIsProjectModalOpen(true) }
  const handleEditClick = (project) => { setSelectedProject(project); setIsProjectModalOpen(true) }
  const handleDeleteClick = (project) => { setSelectedProject(project); setIsDeleteModalOpen(true) }

  const handleSubmit = async (formData) => {
    setIsSubmitting(true)
    try {
      if (selectedProject) await updateProject(selectedProject._id, formData)
      else await addProject(formData)
      setIsProjectModalOpen(false); setSelectedProject(null)
      loadProjects(pagination.currentPage, false, true)
    } catch (err) { console.error(err); alert(err.message || "Error saving project") }
    finally { setIsSubmitting(false) }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedProject) return
    setIsSubmitting(true)
    try {
      await deleteProject(selectedProject._id)
      setIsDeleteModalOpen(false); setSelectedProject(null)
      loadProjects(pagination.currentPage, false, true)
    } catch (err) { console.error(err); alert("Error deleting project") }
    finally { setIsSubmitting(false) }
  }

  const clearFilters = () => { setSearchTerm(""); setSelectedCategory("all"); setSelectedTag("all") }
  const hasActiveFilters = searchTerm || selectedCategory !== "all" || selectedTag !== "all"

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
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2.5 mb-0.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Folder className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground">Projects</h1>
            </div>
            <p className="text-muted-foreground text-xs ml-0 sm:ml-11">
              Manage your portfolio projects
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 border-primary/20 text-primary text-[10px] px-2.5 py-1">
              <Layers className="w-3 h-3" />
              {pagination.totalItems} Projects
            </Badge>
            <Button onClick={handleAddClick} size="sm" className="h-8 px-3 text-xs font-semibold">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> 
              Add Project
            </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col gap-2.5 mb-5">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${
                searchTerm ? 'text-primary' : 'text-muted-foreground'
              }`} />
              <Input 
                placeholder="Search projects..." 
                className={`pl-9 h-9 text-xs bg-card border-border rounded-lg transition-all ${
                  searchTerm ? 'ring-1 ring-primary border-primary' : ''
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-accent rounded-full"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
            </div>

            <button
              onClick={toggleSort}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-card border border-border rounded-lg hover:bg-accent text-xs font-medium text-muted-foreground transition-colors"
            >
              {sortOrder === 'desc' ? <SortDesc className="w-3.5 h-3.5" /> : <SortAsc className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filters:</span>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-card border border-border rounded-md text-[11px] font-medium text-foreground outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              {filterOptions.categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-2.5 py-1.5 bg-card border border-border rounded-md text-[11px] font-medium text-foreground outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Tags</option>
              {filterOptions.tags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2 py-1.5 text-[11px] font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        </div>

        {loadingMore && (
          <div className="flex items-center justify-center gap-1.5 py-2 mb-3 text-xs text-muted-foreground">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Loading...
          </div>
        )}

        {/* Projects Grid */}
        <div className={`transition-opacity ${loadingMore ? 'opacity-60 pointer-events-none' : ''}`}>
          {projects.length === 0 ? (
            <Card className={`border-dashed border-2 text-center transition-all ${
              showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}>
              <CardContent className="py-16">
                <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
                  {hasActiveFilters ? <Search className="w-8 h-8 text-muted-foreground/40" /> : <Sparkles className="w-8 h-8 text-muted-foreground/40" />}
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1">
                  {hasActiveFilters ? "No projects found" : "No projects yet"}
                </h3>
                <p className="text-muted-foreground text-xs mb-5">
                  {hasActiveFilters ? "Try adjusting your filters" : "Start by adding your first project"}
                </p>
                {hasActiveFilters ? (
                  <Button onClick={clearFilters} variant="outline" size="sm" className="h-8 text-xs rounded-lg">Clear Filters</Button>
                ) : (
                  <Button onClick={handleAddClick} size="sm" className="h-8 text-xs rounded-lg">
                    <Plus className="w-3.5 h-3.5 mr-1.5" />Add Project
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {projects.map((project, index) => (
                <AnimatedCard key={project._id} index={index} isVisible={showContent}>
                  <Card className="group overflow-hidden border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/[0.05] transition-all">
                    
                    {/* Image */}
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      <ProjectImage 
                        src={project.image} 
                        alt={project.title}
                        className="group-hover:scale-105"
                      />
                      
                      {project.tag && (
                        <Badge className={`absolute top-2.5 left-2.5 text-[9px] px-1.5 py-0 h-5 z-20 border-0 font-bold ${
                          project.tag === 'Featured' ? 'bg-primary text-primary-foreground' 
                          : project.tag === 'New' ? 'bg-blue-500 text-white dark:bg-blue-600'
                          : project.tag === 'Popular' ? 'bg-rose-500 text-white dark:bg-rose-600'
                          : 'bg-foreground text-background'
                        }`}>
                          {project.tag}
                        </Badge>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-1.5 z-20">
                        {project.liveLink && (
                          <a href={project.liveLink} target="_blank" rel="noopener noreferrer"
                            className="p-2 bg-card rounded-lg hover:bg-accent transition-all hover:scale-110"
                            onClick={(e) => e.stopPropagation()}>
                            <Eye className="w-3.5 h-3.5 text-foreground" />
                          </a>
                        )}
                        {project.githubLink && (
                          <a href={project.githubLink} target="_blank" rel="noopener noreferrer"
                            className="p-2 bg-card rounded-lg hover:bg-accent transition-all hover:scale-110"
                            onClick={(e) => e.stopPropagation()}>
                            <Github className="w-3.5 h-3.5 text-foreground" />
                          </a>
                        )}
                        <button onClick={() => handleEditClick(project)}
                          className="p-2 bg-primary rounded-lg hover:bg-primary/90 transition-all hover:scale-110">
                          <Pencil className="w-3.5 h-3.5 text-primary-foreground" />
                        </button>
                        <button onClick={() => handleDeleteClick(project)}
                          className="p-2 bg-destructive rounded-lg hover:bg-destructive/90 transition-all hover:scale-110">
                          <Trash2 className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-4 flex-1 flex flex-col">
                      <p className="text-[10px] font-semibold text-primary mb-0.5">{project.category}</p>
                      <h3 className="text-sm font-bold text-foreground mb-1.5 line-clamp-1 group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-muted-foreground text-xs line-clamp-2 mb-3 flex-1">{project.description}</p>

                      {project.techStack?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {project.techStack.slice(0, 4).map((tech) => (
                            <span key={tech} className="px-1.5 py-0.5 bg-muted text-muted-foreground text-[9px] font-medium rounded border border-border">
                              {tech}
                            </span>
                          ))}
                          {project.techStack.length > 4 && (
                            <span className="px-1.5 py-0.5 bg-muted text-muted-foreground/60 text-[9px] font-medium rounded">
                              +{project.techStack.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center gap-2 pt-2.5 border-t border-border">
                        {project.liveLink && (
                          <a href={project.liveLink} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] font-medium text-primary hover:text-primary/80">
                            <ExternalLink className="w-3 h-3" />Live
                          </a>
                        )}
                        {project.liveLink && project.githubLink && (
                          <span className="w-0.5 h-0.5 bg-border rounded-full" />
                        )}
                        {project.githubLink && (
                          <a href={project.githubLink} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground">
                            <Github className="w-3 h-3" />Source
                          </a>
                        )}
                        <div className="ml-auto flex items-center gap-0.5">
                          <button onClick={() => handleEditClick(project)}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-all">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteClick(project)}
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
        {pagination.totalPages > 0 && projects.length > 0 && (
          <div className={`mt-6 pt-4 border-t border-border transition-all ${
            showContent ? 'opacity-100' : 'opacity-0'
          }`}>
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

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => { setIsProjectModalOpen(false); setSelectedProject(null) }}
        onSubmit={handleSubmit}
        project={selectedProject}
        isLoading={isSubmitting}
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