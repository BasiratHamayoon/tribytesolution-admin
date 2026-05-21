"use client"

import { useEffect, useState, useRef } from "react"
import { Plus, Briefcase, Layers, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import AdminShell from "../../../mainComponents/SideBar/AdminSiderbar"
import { useAppContext } from "../../AppContext"
import ServicesSkeleton from "../../../mainComponents/Loaders/ServicesSkeleton"
import ServiceFilters from "../../../mainComponents/Filters/ServiceFilters"
import ServiceTable from "../../../mainComponents/Tables/ServiceTable"
import ServiceModal from "../../../mainComponents/Modals/ServiceModal"
import ServiceViewModal from "../../../mainComponents/Modals/ServiceViewModal"
import DeleteModal from "../../../mainComponents/Modals/DeleteModal"
import Pagination from "@/components/ui/paginations"

export default function ServicesAdmin() {
  const { fetchServices, addService, updateService, deleteService } = useAppContext()

  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showPopularOnly, setShowPopularOnly] = useState(false)
  const [sortOrder, setSortOrder] = useState("desc")

  const [pagination, setPagination] = useState({
    currentPage: 1, totalPages: 1, totalItems: 0,
    itemsPerPage: 12, hasNextPage: false, hasPrevPage: false
  })
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [filterOptions, setFilterOptions] = useState({ categories: [], popularCount: 0 })

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [viewService, setViewService] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const initialLoadDone = useRef(false)
  const isFirstFilterRun = useRef(true)
  const debounceRef = useRef(null)
  const fetchServicesRef = useRef(fetchServices)
  const skipNextFilterEffect = useRef(false)
  const masterFilterOptions = useRef({ categories: [], popularCount: 0 })

  useEffect(() => {
    fetchServicesRef.current = fetchServices
  }, [fetchServices])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchTerm])

  const executeLoadServices = async ({
    page = 1,
    showLoader = true,
    animate = true,
    search,
    category,
    popular,
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
      const response = await fetchServicesRef.current({
        page,
        limit: perPage,
        search,
        category,
        popular: popular ? "true" : "all",
        sortBy: "createdAt",
        sortOrder: order
      })

      setServices(response.data || [])
      setPagination(response.pagination || {
        currentPage: 1, totalPages: 1, totalItems: 0,
        itemsPerPage: 12, hasNextPage: false, hasPrevPage: false
      })

      const incomingCategories = Array.isArray(response.filters?.categories)
        ? response.filters.categories.filter(Boolean)
        : []
      const incomingPopularCount = response.filters?.popularCount || 0

      if (incomingCategories.length > 0) {
        masterFilterOptions.current.categories = incomingCategories
      }
      if (incomingPopularCount > 0) {
        masterFilterOptions.current.popularCount = incomingPopularCount
      }

      setFilterOptions({
        categories: [...masterFilterOptions.current.categories],
        popularCount: masterFilterOptions.current.popularCount
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

    executeLoadServices({
      page: 1,
      showLoader: true,
      animate: false,
      search: "",
      category: "all",
      popular: false,
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
      executeLoadServices({
        page: 1,
        showLoader: false,
        animate: true,
        search: debouncedSearch,
        category: selectedCategory,
        popular: showPopularOnly,
        order: sortOrder,
        perPage: itemsPerPage
      })
    }, 0)
  }, [debouncedSearch, selectedCategory, showPopularOnly, sortOrder, itemsPerPage])

  const handlePageChange = (page) => {
    executeLoadServices({
      page,
      showLoader: false,
      animate: true,
      search: debouncedSearch,
      category: selectedCategory,
      popular: showPopularOnly,
      order: sortOrder,
      perPage: itemsPerPage
    })
  }

  const handleItemsPerPageChange = (value) => setItemsPerPage(value)
  const toggleSort = () => setSortOrder(prev => prev === "desc" ? "asc" : "desc")

  const handleAddClick = () => { setSelectedService(null); setIsServiceModalOpen(true) }
  const handleEditClick = (service) => { setSelectedService(service); setIsServiceModalOpen(true) }
  const handleDeleteClick = (service) => { setSelectedService(service); setIsDeleteModalOpen(true) }
  const handleViewClick = (service) => { setViewService(service); setIsViewModalOpen(true) }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    setShowPopularOnly(false)
  }

  const hasActiveFilters = !!(searchTerm || selectedCategory !== "all" || showPopularOnly)

  const refreshWithoutFilters = () => {
    skipNextFilterEffect.current = true
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setSearchTerm("")
    setDebouncedSearch("")
    setSelectedCategory("all")
    setShowPopularOnly(false)
    setSortOrder("desc")
    executeLoadServices({
      page: 1,
      showLoader: false,
      animate: true,
      search: "",
      category: "all",
      popular: false,
      order: "desc",
      perPage: itemsPerPage
    })
  }

  const handleSubmit = async (formData) => {
    setIsSubmitting(true)
    try {
      if (selectedService) {
        await updateService(selectedService._id, formData)
        setIsServiceModalOpen(false)
        setSelectedService(null)
        executeLoadServices({
          page: pagination.currentPage,
          showLoader: false,
          animate: true,
          search: debouncedSearch,
          category: selectedCategory,
          popular: showPopularOnly,
          order: sortOrder,
          perPage: itemsPerPage
        })
      } else {
        await addService(formData)
        setIsServiceModalOpen(false)
        setSelectedService(null)
        refreshWithoutFilters()
      }
    } catch (err) {
      console.error(err)
      alert(err.message || "Error saving service")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedService) return
    setIsSubmitting(true)
    try {
      await deleteService(selectedService._id)
      setIsDeleteModalOpen(false)
      setSelectedService(null)
      executeLoadServices({
        page: pagination.currentPage,
        showLoader: false,
        animate: true,
        search: debouncedSearch,
        category: selectedCategory,
        popular: showPopularOnly,
        order: sortOrder,
        perPage: itemsPerPage
      })
    } catch (err) {
      console.error(err)
      alert("Error deleting service")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <AdminShell>
        <ServicesSkeleton />
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
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight">Services</h1>
                <p className="text-muted-foreground text-[11px] font-medium">
                  Manage your service offerings
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 border-primary/20 text-primary text-[10px] px-3 py-1.5 rounded-full font-bold">
              <Layers className="w-3 h-3" />
              {pagination.totalItems} Services
            </Badge>
            <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 border-primary/20 text-primary text-[10px] px-3 py-1.5 rounded-full font-bold">
              <Star className="w-3 h-3 fill-primary" />
              {filterOptions.popularCount} Popular
            </Badge>
            <Button
              onClick={handleAddClick}
              size="sm"
              className="h-8 px-4 text-xs font-bold rounded-lg shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Service
            </Button>
          </div>
        </div>

        <div className={`transition-all duration-700 delay-100 ${
          headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          <ServiceFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            debouncedSearch={debouncedSearch}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            showPopularOnly={showPopularOnly}
            onPopularToggle={() => setShowPopularOnly(prev => !prev)}
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

          <ServiceTable
            services={services}
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
          showContent && pagination.totalPages > 0 && services.length > 0
            ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          {pagination.totalPages > 0 && services.length > 0 && (
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

      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => { setIsServiceModalOpen(false); setSelectedService(null) }}
        onSubmit={handleSubmit}
        service={selectedService}
        isLoading={isSubmitting}
      />

      <ServiceViewModal
        isOpen={isViewModalOpen}
        onClose={() => { setIsViewModalOpen(false); setViewService(null) }}
        service={viewService}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedService(null) }}
        onConfirm={handleDeleteConfirm}
        title="Delete Service"
        message={`Are you sure you want to delete "${selectedService?.title}"? This action cannot be undone.`}
        isLoading={isSubmitting}
      />
    </AdminShell>
  )
}