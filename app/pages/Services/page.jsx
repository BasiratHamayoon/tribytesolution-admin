"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Briefcase, 
  Star,
  Layers,
  DollarSign,
  Search,
  X,
  SortAsc,
  SortDesc,
  Filter,
  Loader2,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AdminShell from "../../../mainComponents/SideBar/AdminSiderbar"
import { useAppContext } from "../../AppContext"
import ServicesSkeleton from "../../../mainComponents/Loaders/ServicesSkeleton"
import ServiceModal from "../../../mainComponents/Modals/ServiceModal"
import DeleteModal from "../../../mainComponents/Modals/DeleteModal"
import Pagination from "@/components/ui/paginations"
import { getImageUrl } from "@/utils/getImageUrl"

// Animation wrapper
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

// Reusable Service Image Component
const ServiceImage = ({ src, alt, icon, className = "" }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  
  const imageUrl = getImageUrl(src)
  
  // Fallback to icon if no image or error
  if (!imageUrl || hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50">
        <div className="text-5xl">{icon || "💼"}</div>
      </div>
    )
  }

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      )}
      <Image
        src={imageUrl}
        alt={alt || "Service image"}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={`object-cover transition-all duration-500 ${
          isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
        } ${className}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setHasError(true)
        }}
        unoptimized // Remove this if you configure domains in next.config.js
      />
    </>
  )
}

export default function ServicesAdmin() {
  const { fetchServices, addService, deleteService, updateService } = useAppContext()
  
  // Data state
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showContent, setShowContent] = useState(false)
  
  // Filter & Search state
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showPopularOnly, setShowPopularOnly] = useState(false)
  const [sortOrder, setSortOrder] = useState("desc")
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
    hasNextPage: false,
    hasPrevPage: false
  })
  const [itemsPerPage, setItemsPerPage] = useState(12)
  
  // Filter options from backend
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    popularCount: 0
  })
  
  // Modal states
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Load services
  const loadServices = useCallback(async (page = 1, showLoader = true, animate = true) => {
    if (animate) {
      setShowContent(false)
      await new Promise(resolve => setTimeout(resolve, 150))
    }
    
    if (showLoader) setLoading(true)
    else setLoadingMore(true)
    
    try {
      const response = await fetchServices({
        page,
        limit: itemsPerPage,
        search: debouncedSearch,
        category: selectedCategory,
        popular: showPopularOnly ? 'true' : 'all',
        sortBy: 'createdAt',
        sortOrder
      })
      
      setServices(response.data)
      setPagination(response.pagination)
      setFilterOptions(response.filters)
      
      setTimeout(() => setShowContent(true), 50)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [fetchServices, itemsPerPage, debouncedSearch, selectedCategory, showPopularOnly, sortOrder])

  // Initial load
  useEffect(() => {
    loadServices(1, true, false)
  }, [])

  // When filters change
  useEffect(() => {
    if (!loading) {
      loadServices(1, false, true)
    }
  }, [debouncedSearch, selectedCategory, showPopularOnly, sortOrder, itemsPerPage])

  // Handlers
  const handlePageChange = (page) => {
    loadServices(page, false, true)
  }

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value)
  }

  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')
  }

  const handleAddClick = () => {
    setSelectedService(null)
    setIsServiceModalOpen(true)
  }

  const handleEditClick = (service) => {
    setSelectedService(service)
    setIsServiceModalOpen(true)
  }

  const handleDeleteClick = (service) => {
    setSelectedService(service)
    setIsDeleteModalOpen(true)
  }

  const handleSubmit = async (formData) => {
    setIsSubmitting(true)
    try {
      if (selectedService) {
        await updateService(selectedService._id, formData)
      } else {
        await addService(formData)
      }
      setIsServiceModalOpen(false)
      setSelectedService(null)
      loadServices(pagination.currentPage, false, true)
    } catch (err) {
      console.error(err)
      alert(err.message || (selectedService ? "Error updating service" : "Error adding service"))
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
      loadServices(pagination.currentPage, false, true)
    } catch (err) {
      console.error(err)
      alert("Error deleting service")
    } finally {
      setIsSubmitting(false)
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    setShowPopularOnly(false)
  }

  const hasActiveFilters = searchTerm || selectedCategory !== "all" || showPopularOnly

  // Loading state
  if (loading) {
    return (
      <AdminShell>
        <ServicesSkeleton />
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-0">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 bg-slate-950 rounded-xl shadow-lg shadow-slate-950/20">
                <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-950">Services</h1>
            </div>
            <p className="text-slate-500 text-sm sm:text-base ml-0 sm:ml-14">
              Manage your service offerings
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-400/10 border border-blue-400/20 rounded-full">
              <Layers className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-blue-600 tabular-nums">
                {pagination.totalItems} Services
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
              <Star className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-amber-600 tabular-nums">
                {filterOptions.popularCount} Popular
              </span>
            </div>
            <Button
              onClick={handleAddClick}
              className="bg-slate-950 hover:bg-slate-800 rounded-xl px-4 sm:px-6 py-2.5 font-semibold shadow-lg shadow-slate-950/20 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 mr-2 text-blue-400" /> 
              Add Service
            </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col gap-3 mb-6">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${
                searchTerm ? 'text-blue-500' : 'text-slate-400'
              }`} />
              <Input 
                placeholder="Search services..." 
                className={`pl-10 sm:pl-12 h-11 sm:h-12 bg-white border-slate-200 text-sm sm:text-base shadow-sm rounded-xl transition-all duration-300 ${
                  searchTerm 
                    ? 'ring-2 ring-blue-400 border-blue-400' 
                    : 'focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400'
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
              {debouncedSearch !== searchTerm && searchTerm && (
                <div className="absolute right-10 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                </div>
              )}
            </div>

            {/* Sort Toggle */}
            <button
              onClick={toggleSort}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200 text-sm font-medium text-slate-600"
            >
              <div className="relative w-4 h-4">
                <SortDesc className={`w-4 h-4 absolute transition-all duration-300 ${
                  sortOrder === 'desc' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-180'
                }`} />
                <SortAsc className={`w-4 h-4 absolute transition-all duration-300 ${
                  sortOrder === 'asc' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'
                }`} />
              </div>
              <span className="hidden sm:inline">
                {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
              </span>
            </button>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters:</span>
            </div>
            
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 cursor-pointer hover:border-slate-300 transition-colors outline-none"
            >
              <option value="all">All Categories</option>
              {filterOptions.categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Popular Filter */}
            <button
              onClick={() => setShowPopularOnly(!showPopularOnly)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                showPopularOnly
                  ? 'bg-amber-100 text-amber-700 border border-amber-300'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <Star className={`w-4 h-4 ${showPopularOnly ? 'fill-amber-500 text-amber-500' : ''}`} />
              Popular Only
            </button>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Loading Overlay */}
        {loadingMore && (
          <div className="flex items-center justify-center gap-2 py-2 mb-4 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading...
          </div>
        )}

        {/* Services Grid */}
        <div className={`transition-opacity ${loadingMore ? 'opacity-60 pointer-events-none' : ''}`}>
          {services.length === 0 ? (
            <div className={`text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 transition-all ${
              showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}>
              <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {hasActiveFilters ? <Search className="w-10 h-10 text-slate-300" /> : <Sparkles className="w-10 h-10 text-slate-300" />}
              </div>
              <h3 className="text-xl font-bold text-slate-950 mb-1">
                {hasActiveFilters ? "No services found" : "No services yet"}
              </h3>
              <p className="text-slate-500 mb-6">
                {hasActiveFilters ? "Try adjusting your filters" : "Start by adding your first service"}
              </p>
              {hasActiveFilters ? (
                <Button onClick={clearFilters} variant="outline" className="rounded-xl">Clear Filters</Button>
              ) : (
                <Button onClick={handleAddClick} className="bg-slate-950 hover:bg-slate-800 rounded-xl">
                  <Plus className="w-4 h-4 mr-2 text-blue-400" />Add Service
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <AnimatedCard key={service._id} index={index} isVisible={showContent}>
                  <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-400/30 transition-all overflow-hidden flex flex-col">
                    
                    {/* Service Image - Using Next.js Image */}
                    <div className="aspect-video bg-slate-100 relative overflow-hidden">
                      <ServiceImage 
                        src={service.image} 
                        alt={service.title}
                        icon={service.icon}
                        className="group-hover:scale-110"
                      />
                      
                      {/* Popular Badge */}
                      {service.popular && (
                        <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 bg-amber-400 text-amber-950 text-xs font-bold rounded-lg shadow-sm z-20">
                          <Star className="w-3 h-3 fill-amber-950" /> Popular
                        </span>
                      )}

                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 z-20">
                        <button
                          onClick={() => handleEditClick(service)}
                          className="p-2.5 bg-blue-500 rounded-xl hover:bg-blue-600 transition-all hover:scale-110"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(service)}
                          className="p-2.5 bg-red-500 rounded-xl hover:bg-red-600 transition-all hover:scale-110"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      {/* Category & Icon Row */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{service.icon || "💼"}</span>
                        <p className="text-xs font-medium text-blue-500">{service.category}</p>
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-lg font-bold text-slate-950 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {service.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">
                        {service.description}
                      </p>

                      {/* Features as Tags */}
                      {service.features?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {service.features.slice(0, 4).map((feature, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md border border-slate-200"
                            >
                              {feature}
                            </span>
                          ))}
                          {service.features.length > 4 && (
                            <span className="px-2 py-1 bg-slate-100 text-slate-400 text-xs font-medium rounded-md">
                              +{service.features.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                        {/* Price */}
                        {service.price && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                            <DollarSign className="w-3.5 h-3.5" />
                            {service.price}
                          </span>
                        )}

                        {/* Action Buttons */}
                        <div className="ml-auto flex items-center gap-1">
                          <button 
                            onClick={() => handleEditClick(service)}
                            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(service)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 0 && services.length > 0 && (
          <div className={`mt-8 pt-6 border-t border-slate-200 transition-all duration-300 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
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

      {/* Service Modal (Add/Edit) */}
      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => {
          setIsServiceModalOpen(false)
          setSelectedService(null)
        }}
        onSubmit={handleSubmit}
        service={selectedService}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedService(null)
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Service"
        message={`Are you sure you want to delete "${selectedService?.title}"? This action cannot be undone.`}
        isLoading={isSubmitting}
      />
    </AdminShell>
  )
}