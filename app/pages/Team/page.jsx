"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import {
  Plus, Trash2, Pencil, Search, X, SortAsc, SortDesc,
  Filter, Loader2, Sparkles, Users, Layers, Mail,
  Phone, Globe, Github, Linkedin, Twitter,
  Image as ImageIcon, ToggleLeft, ToggleRight, Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import AdminShell from "../../../mainComponents/SideBar/AdminSiderbar"
import { useAppContext } from "../../AppContext"
import TeamModal from "../../../mainComponents/Modals/TeamModal"
import DeleteModal from "../../../mainComponents/Modals/DeleteModal"
import Pagination from "@/components/ui/paginations"
import { getImageUrl } from "@/utils/getImageUrl"

const AnimatedCard = ({ children, index, isVisible }) => (
  <div className={`transform transition-all duration-300 ease-out ${
    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
  }`} style={{ transitionDelay: `${index * 50}ms` }}>{children}</div>
)

const TeamImage = ({ src, alt, name }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const imageUrl = getImageUrl(src)

  if (!imageUrl || hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
        <span className="text-2xl font-bold">{name?.charAt(0)?.toUpperCase() || "?"}</span>
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
      <Image src={imageUrl} alt={alt || name} fill
        sizes="(max-width: 768px) 100vw, 200px"
        className={`object-cover transition-all duration-500 ${isLoading ? "opacity-0" : "opacity-100"}`}
        onLoad={() => setIsLoading(false)}
        onError={() => { setIsLoading(false); setHasError(true) }}
        unoptimized />
    </>
  )
}

export default function TeamAdmin() {
  const { fetchTeam, addTeamMember, updateTeamMember, deleteTeamMember } = useAppContext()

  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showContent, setShowContent] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [sortOrder, setSortOrder] = useState("asc")

  const [pagination, setPagination] = useState({
    currentPage: 1, totalPages: 1, totalItems: 0,
    itemsPerPage: 12, hasNextPage: false, hasPrevPage: false
  })
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [departments, setDepartments] = useState([])

  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const loadMembers = useCallback(async (page = 1, showLoader = true, animate = true) => {
    if (animate) { setShowContent(false); await new Promise(r => setTimeout(r, 150)) }
    if (showLoader) setLoading(true)
    else setLoadingMore(true)

    try {
      const response = await fetchTeam({
        page, limit: itemsPerPage, search: debouncedSearch,
        department: selectedDepartment, isActive: "all",
        sortBy: "order", sortOrder
      })
      setMembers(response.data)
      setPagination(response.pagination)
      if (response.filters?.departments) setDepartments(response.filters.departments)
      setTimeout(() => setShowContent(true), 50)
    } catch (err) { console.error(err) }
    finally { setLoading(false); setLoadingMore(false) }
  }, [fetchTeam, itemsPerPage, debouncedSearch, selectedDepartment, sortOrder])

  useEffect(() => { loadMembers(1, true, false) }, [])
  useEffect(() => { if (!loading) loadMembers(1, false, true) },
    [debouncedSearch, selectedDepartment, sortOrder, itemsPerPage])

  const handlePageChange = (page) => loadMembers(page, false, true)
  const handleItemsPerPageChange = (value) => setItemsPerPage(value)
  const toggleSort = () => setSortOrder(prev => prev === "asc" ? "desc" : "asc")

  const handleAddClick = () => { setSelectedMember(null); setIsTeamModalOpen(true) }
  const handleEditClick = (m) => { setSelectedMember(m); setIsTeamModalOpen(true) }
  const handleDeleteClick = (m) => { setSelectedMember(m); setIsDeleteModalOpen(true) }

  const handleSubmit = async (formData) => {
    setIsSubmitting(true)
    try {
      if (selectedMember) await updateTeamMember(selectedMember._id, formData)
      else await addTeamMember(formData)
      setIsTeamModalOpen(false); setSelectedMember(null)
      loadMembers(pagination.currentPage, false, true)
    } catch (err) { console.error(err); alert(err.message || "Error saving member") }
    finally { setIsSubmitting(false) }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedMember) return
    setIsSubmitting(true)
    try {
      await deleteTeamMember(selectedMember._id)
      setIsDeleteModalOpen(false); setSelectedMember(null)
      loadMembers(pagination.currentPage, false, true)
    } catch (err) { console.error(err); alert("Error deleting member") }
    finally { setIsSubmitting(false) }
  }

  const clearFilters = () => { setSearchTerm(""); setSelectedDepartment("all") }
  const hasActiveFilters = searchTerm || selectedDepartment !== "all"

  if (loading) return <AdminShell><TeamSkeleton /></AdminShell>

  return (
    <AdminShell>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2.5 mb-0.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground">Team</h1>
            </div>
            <p className="text-muted-foreground text-xs ml-0 sm:ml-11">Manage your team members</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 border-primary/20 text-primary text-[10px] px-2.5 py-1">
              <Layers className="w-3 h-3" /> {pagination.totalItems} Members
            </Badge>
            <Button onClick={handleAddClick} size="sm" className="h-8 px-3 text-xs font-semibold">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Member
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-2.5 mb-5">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${searchTerm ? "text-primary" : "text-muted-foreground"}`} />
              <Input placeholder="Search members..." className={`pl-9 h-9 text-xs bg-card border-border rounded-lg ${searchTerm ? "ring-1 ring-primary border-primary" : ""}`}
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-accent rounded-full">
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
            <button onClick={toggleSort} className="flex items-center justify-center gap-1.5 px-3 py-2 bg-card border border-border rounded-lg hover:bg-accent text-xs font-medium text-muted-foreground">
              {sortOrder === "asc" ? <SortAsc className="w-3.5 h-3.5" /> : <SortDesc className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{sortOrder === "asc" ? "A-Z" : "Z-A"}</span>
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-2.5 py-1.5 bg-card border border-border rounded-md text-[11px] font-medium text-foreground outline-none focus:ring-1 focus:ring-primary">
              <option value="all">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 px-2 py-1.5 text-[11px] font-medium text-destructive hover:bg-destructive/10 rounded-md">
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

        {/* Grid */}
        <div className={`transition-opacity ${loadingMore ? "opacity-60 pointer-events-none" : ""}`}>
          {members.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="py-16 text-center">
                <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
                  {hasActiveFilters ? <Search className="w-7 h-7 text-muted-foreground/40" /> : <Sparkles className="w-7 h-7 text-muted-foreground/40" />}
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1">{hasActiveFilters ? "No members found" : "No team members yet"}</h3>
                <p className="text-muted-foreground text-xs mb-4">{hasActiveFilters ? "Try adjusting your filters" : "Start by adding your first team member"}</p>
                {hasActiveFilters ? (
                  <Button onClick={clearFilters} variant="outline" size="sm" className="h-8 text-xs rounded-lg">Clear Filters</Button>
                ) : (
                  <Button onClick={handleAddClick} size="sm" className="h-8 text-xs rounded-lg"><Plus className="w-3.5 h-3.5 mr-1.5" /> Add Member</Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {members.map((member, index) => (
                <AnimatedCard key={member._id} index={index} isVisible={showContent}>
                  <Card className="group overflow-hidden border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/[0.05] transition-all text-center">
                    {/* Image */}
                    <div className="w-full aspect-square relative overflow-hidden bg-muted">
                      <TeamImage src={member.image} alt={member.name} name={member.name} />
                      {member.isFeatured && (
                        <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground text-[8px] px-1.5 py-0 h-4 border-0 z-20">
                          <Star className="w-2.5 h-2.5 mr-0.5 fill-current" /> Featured
                        </Badge>
                      )}
                      {!member.isActive && (
                        <div className="absolute inset-0 bg-foreground/40 z-10 flex items-center justify-center">
                          <Badge className="bg-card text-muted-foreground text-[9px] border-0">Inactive</Badge>
                        </div>
                      )}
                      {/* Hover */}
                      <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-1.5 z-20">
                        <button onClick={() => handleEditClick(member)} className="p-2 bg-primary rounded-lg hover:bg-primary/90 transition-all hover:scale-110">
                          <Pencil className="w-3.5 h-3.5 text-primary-foreground" />
                        </button>
                        <button onClick={() => handleDeleteClick(member)} className="p-2 bg-destructive rounded-lg hover:bg-destructive/90 transition-all hover:scale-110">
                          <Trash2 className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                    </div>

                    <CardContent className="p-3">
                      <h3 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">{member.name}</h3>
                      <p className="text-[10px] text-primary font-semibold">{member.role}</p>
                      <p className="text-[9px] text-muted-foreground mb-2">{member.department}</p>

                      {/* Social links */}
                      <div className="flex items-center justify-center gap-1 mb-2">
                        {member.socialLinks?.linkedin && (
                          <a href={member.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                            className="p-1 text-muted-foreground hover:text-primary rounded transition-colors">
                            <Linkedin className="w-3 h-3" />
                          </a>
                        )}
                        {member.socialLinks?.github && (
                          <a href={member.socialLinks.github} target="_blank" rel="noopener noreferrer"
                            className="p-1 text-muted-foreground hover:text-primary rounded transition-colors">
                            <Github className="w-3 h-3" />
                          </a>
                        )}
                        {member.socialLinks?.twitter && (
                          <a href={member.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                            className="p-1 text-muted-foreground hover:text-primary rounded transition-colors">
                            <Twitter className="w-3 h-3" />
                          </a>
                        )}
                        {member.socialLinks?.website && (
                          <a href={member.socialLinks.website} target="_blank" rel="noopener noreferrer"
                            className="p-1 text-muted-foreground hover:text-primary rounded transition-colors">
                            <Globe className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      <Separator className="mb-2" />

                      <div className="flex items-center justify-center gap-0.5">
                        <button onClick={() => handleEditClick(member)}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-all">
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleDeleteClick(member)}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              ))}
            </div>
          )}
        </div>

        {pagination.totalPages > 0 && members.length > 0 && (
          <div className={`mt-6 pt-4 border-t border-border transition-all ${showContent ? "opacity-100" : "opacity-0"}`}>
            <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages}
              totalItems={pagination.totalItems} itemsPerPage={pagination.itemsPerPage}
              onPageChange={handlePageChange} onItemsPerPageChange={handleItemsPerPageChange}
              hasNextPage={pagination.hasNextPage} hasPrevPage={pagination.hasPrevPage}
              isLoading={loadingMore} showItemsPerPage={true} showPageInfo={true}
              itemsPerPageOptions={[8, 12, 24, 48]} />
          </div>
        )}
      </div>

      <TeamModal isOpen={isTeamModalOpen}
        onClose={() => { setIsTeamModalOpen(false); setSelectedMember(null) }}
        onSubmit={handleSubmit} member={selectedMember} isLoading={isSubmitting} />

      <DeleteModal isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedMember(null) }}
        onConfirm={handleDeleteConfirm} title="Delete Member"
        message={`Are you sure you want to delete "${selectedMember?.name}"?`}
        isLoading={isSubmitting} />
    </AdminShell>
  )
}

function TeamSkeleton() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1"><div className="w-9 h-9 bg-muted rounded-lg animate-pulse" /><div className="h-5 w-16 bg-muted rounded animate-pulse" /></div>
          <div className="h-3 w-36 bg-muted/60 rounded animate-pulse ml-11" />
        </div>
        <div className="h-8 w-28 bg-muted rounded-lg animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="overflow-hidden"><div className="aspect-square bg-muted animate-pulse" />
            <CardContent className="p-3 space-y-1.5 animate-pulse text-center">
              <div className="h-3.5 w-24 bg-muted rounded mx-auto" />
              <div className="h-3 w-16 bg-muted/60 rounded mx-auto" />
              <div className="h-2.5 w-20 bg-muted/40 rounded mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}