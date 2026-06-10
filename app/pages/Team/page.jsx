"use client"

import { useEffect, useState, useRef } from "react"
import { Plus, Users, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import AdminShell from "../../../mainComponents/SideBar/AdminSiderbar"
import { useAppContext } from "../../AppContext"
import TeamSkeleton from "../../../mainComponents/Loaders/TeamSkeleton"
import TeamFilters from "../../../mainComponents/Filters/TeamFilters"
import TeamGrid from "../../../mainComponents/Tables/TeamGrid"
import TeamModal from "../../../mainComponents/Modals/TeamModal"
import TeamViewModal from "../../../mainComponents/Modals/TeamViewModal"
import DeleteModal from "../../../mainComponents/Modals/DeleteModal"
import Pagination from "@/components/ui/paginations"

export default function TeamAdmin() {
  const { fetchTeam, addTeamMember, updateTeamMember, deleteTeamMember, isCheckingAuth } = useAppContext()

  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedRole, setSelectedRole] = useState("all")
  const [sortOrder, setSortOrder] = useState("asc")

  const [pagination, setPagination] = useState({
    currentPage: 1, totalPages: 1, totalItems: 0,
    itemsPerPage: 12, hasNextPage: false, hasPrevPage: false
  })
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [filterOptions, setFilterOptions] = useState({ departments: [], roles: [] })

  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [viewMember, setViewMember] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const initialLoadDone = useRef(false)
  const filterRunCount = useRef(0)
  const debounceRef = useRef(null)
  const fetchTeamRef = useRef(fetchTeam)
  const masterFilterOptions = useRef({ departments: [], roles: [] })
  const currentPageRef = useRef(1)
  const isLoadingRef = useRef(false)

  useEffect(() => {
    fetchTeamRef.current = fetchTeam
  }, [fetchTeam])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchTerm])

  const executeLoadMembers = async ({
    page = 1,
    showLoader = true,
    animate = true,
    search,
    department,
    role,
    order,
    perPage
  }) => {
    if (isLoadingRef.current) return
    isLoadingRef.current = true

    if (animate) {
      setShowContent(false)
      await new Promise(resolve => setTimeout(resolve, 150))
    }
    if (showLoader) setLoading(true)
    else setLoadingMore(true)

    try {
      const response = await fetchTeamRef.current({
        page,
        limit: perPage,
        search,
        department,
        role,
        isActive: "all",
        sortBy: "order",
        sortOrder: order
      })

      const membersData = response.data || []
      setMembers(membersData)
      setPagination(response.pagination || {
        currentPage: 1, totalPages: 1, totalItems: 0,
        itemsPerPage: 12, hasNextPage: false, hasPrevPage: false
      })
      currentPageRef.current = response.pagination?.currentPage || page

      const incomingDepts = Array.isArray(response.filters?.departments)
        ? response.filters.departments.filter(Boolean) : []
      const incomingRoles = Array.isArray(response.filters?.roles)
        ? response.filters.roles.filter(Boolean) : []

      const extractedDepts = membersData.map(m => m.department).filter(Boolean)
      const extractedRoles = membersData.map(m => m.role).filter(Boolean)

      const newDepts = incomingDepts.length > 0 ? incomingDepts : extractedDepts
      const newRoles = incomingRoles.length > 0 ? incomingRoles : extractedRoles

      newDepts.forEach(d => {
        if (d && !masterFilterOptions.current.departments.includes(d)) {
          masterFilterOptions.current.departments.push(d)
        }
      })
      newRoles.forEach(r => {
        if (r && !masterFilterOptions.current.roles.includes(r)) {
          masterFilterOptions.current.roles.push(r)
        }
      })

      setFilterOptions({
        departments: [...masterFilterOptions.current.departments],
        roles: [...masterFilterOptions.current.roles]
      })

      setTimeout(() => setShowContent(true), 80)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
      isLoadingRef.current = false
    }
  }

  useEffect(() => {
    if (isCheckingAuth) return
    if (initialLoadDone.current) return
    initialLoadDone.current = true
    setTimeout(() => setHeaderVisible(true), 100)
    executeLoadMembers({
      page: 1, showLoader: true, animate: false,
      search: "", department: "all", role: "all",
      order: "asc", perPage: 12
    })
  }, [isCheckingAuth])

  useEffect(() => {
    filterRunCount.current += 1
    if (filterRunCount.current <= 1) return
    if (!initialLoadDone.current) return

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      executeLoadMembers({
        page: 1, showLoader: false, animate: true,
        search: debouncedSearch, department: selectedDepartment,
        role: selectedRole, order: sortOrder, perPage: itemsPerPage
      })
    }, 50)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [debouncedSearch, selectedDepartment, selectedRole, sortOrder, itemsPerPage])

  const handlePageChange = (page) => {
    executeLoadMembers({
      page, showLoader: false, animate: true,
      search: debouncedSearch, department: selectedDepartment,
      role: selectedRole, order: sortOrder, perPage: itemsPerPage
    })
  }

  const handleItemsPerPageChange = (value) => setItemsPerPage(value)
  const toggleSort = () => setSortOrder(prev => prev === "asc" ? "desc" : "asc")

  const handleAddClick = () => { setSelectedMember(null); setIsTeamModalOpen(true) }
  const handleEditClick = (m) => { setSelectedMember(m); setIsTeamModalOpen(true) }
  const handleDeleteClick = (m) => { setSelectedMember(m); setIsDeleteModalOpen(true) }
  const handleViewClick = (m) => { setViewMember(m); setIsViewModalOpen(true) }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedDepartment("all")
    setSelectedRole("all")
  }

  const hasActiveFilters = !!(searchTerm || selectedDepartment !== "all" || selectedRole !== "all")

  const reloadCurrentView = () => {
    executeLoadMembers({
      page: currentPageRef.current, showLoader: false, animate: false,
      search: debouncedSearch, department: selectedDepartment,
      role: selectedRole, order: sortOrder, perPage: itemsPerPage
    })
  }

  const reloadAfterAdd = () => {
    setSearchTerm("")
    setDebouncedSearch("")
    setSelectedDepartment("all")
    setSelectedRole("all")
    setSortOrder("asc")
    executeLoadMembers({
      page: 1, showLoader: false, animate: true,
      search: "", department: "all", role: "all",
      order: "asc", perPage: itemsPerPage
    })
  }

  const handleSubmit = async (formData) => {
    setIsSubmitting(true)
    try {
      if (selectedMember) {
        await updateTeamMember(selectedMember._id, formData)
        setIsTeamModalOpen(false)
        setSelectedMember(null)
        reloadCurrentView()
      } else {
        await addTeamMember(formData)
        setIsTeamModalOpen(false)
        setSelectedMember(null)
        reloadAfterAdd()
      }
    } catch (err) {
      console.error(err)
      alert(err.message || "Error saving member")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedMember) return
    setIsSubmitting(true)
    try {
      await deleteTeamMember(selectedMember._id)
      setIsDeleteModalOpen(false)
      setSelectedMember(null)
      reloadCurrentView()
    } catch (err) {
      console.error(err)
      alert("Error deleting member")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <AdminShell>
        <TeamSkeleton />
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
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight">Team</h1>
                <p className="text-muted-foreground text-[11px] font-medium">Manage your team members</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 border-primary/20 text-primary text-[10px] px-3 py-1.5 rounded-full font-bold">
              <Layers className="w-3 h-3" />
              {pagination.totalItems} Members
            </Badge>
            <Button onClick={handleAddClick} size="sm"
              className="h-8 px-4 text-xs font-bold rounded-lg shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Member
            </Button>
          </div>
        </div>

        <div className={`transition-all duration-700 delay-100 ${
          headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          <TeamFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            debouncedSearch={debouncedSearch}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={setSelectedDepartment}
            selectedRole={selectedRole}
            onRoleChange={setSelectedRole}
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
          <TeamGrid
            members={members}
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
          showContent && pagination.totalPages > 0 && members.length > 0
            ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          {pagination.totalPages > 0 && members.length > 0 && (
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
                itemsPerPageOptions={[8, 12, 24, 48]}
              />
            </div>
          )}
        </div>
      </div>

      <TeamModal
        isOpen={isTeamModalOpen}
        onClose={() => { setIsTeamModalOpen(false); setSelectedMember(null) }}
        onSubmit={handleSubmit}
        member={selectedMember}
        isLoading={isSubmitting}
      />
      <TeamViewModal
        isOpen={isViewModalOpen}
        onClose={() => { setIsViewModalOpen(false); setViewMember(null) }}
        member={viewMember}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedMember(null) }}
        onConfirm={handleDeleteConfirm}
        title="Delete Member"
        message={`Are you sure you want to delete "${selectedMember?.name}"? This action cannot be undone.`}
        isLoading={isSubmitting}
      />
    </AdminShell>
  )
}