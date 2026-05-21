"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { 
  Search, 
  Mail, 
  CheckCircle2, 
  X, 
  Send, 
  Clock, 
  CalendarDays,
  Inbox,
  MessageSquare,
  ArrowRight,
  Sparkles,
  MailOpen,
  Reply,
  SortAsc,
  SortDesc,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import AdminShell from "../../../mainComponents/SideBar/AdminSiderbar"
import { useAppContext } from "../../AppContext"
import MessagesSkeleton from "../../../mainComponents/Loaders/MessagesSkeleton"
import Pagination from "@/components/ui/paginations"

// Animation wrapper component for list items
const AnimatedListItem = ({ children, index, isVisible }) => {
  return (
    <div
      className={`transform transition-all duration-300 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-4'
      }`}
      style={{ 
        transitionDelay: `${index * 50}ms`
      }}
    >
      {children}
    </div>
  )
}

// Fade transition wrapper
const FadeTransition = ({ children, show, className = "" }) => {
  return (
    <div
      className={`transition-all duration-300 ease-in-out ${
        show 
          ? 'opacity-100 transform translate-y-0' 
          : 'opacity-0 transform -translate-y-2'
      } ${className}`}
    >
      {children}
    </div>
  )
}

// Loading overlay for smooth transitions
const LoadingOverlay = ({ isLoading }) => {
  if (!isLoading) return null
  
  return (
    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl transition-opacity duration-200">
      <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg border border-slate-100">
        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
        <span className="text-sm font-medium text-slate-600">Loading...</span>
      </div>
    </div>
  )
}

// Skeleton placeholder for smooth loading
const MessageSkeleton = () => (
  <div className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 animate-pulse">
    <div className="flex items-center gap-3 sm:gap-4 pl-2 sm:pl-3">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-200" />
      <div className="flex-1">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
        <div className="h-3 bg-slate-200 rounded w-2/3 mb-2" />
        <div className="h-3 bg-slate-200 rounded w-1/4" />
      </div>
    </div>
  </div>
)

export default function MessagesPage() {
  const { fetchMessages, replyToMessage } = useAppContext()
  
  // Data state
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showContent, setShowContent] = useState(true)
  
  // Filter & Search state
  const [activeTab, setActiveTab] = useState("new")
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  })
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // Counts state
  const [counts, setCounts] = useState({
    new: 0,
    responded: 0,
    total: 0
  })
  
  // UI state
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [replyText, setReplyText] = useState("")
  const [sendingReply, setSendingReply] = useState(false)
  const [listVisible, setListVisible] = useState(false)

  // Refs
  const listContainerRef = useRef(null)
  const prevTabRef = useRef(activeTab)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Load messages with animation
  const loadMessages = useCallback(async (page = 1, showLoader = true, animate = true) => {
    if (animate) {
      setShowContent(false)
      setListVisible(false)
      await new Promise(resolve => setTimeout(resolve, 150))
    }
    
    if (showLoader) setLoading(true)
    else setLoadingMore(true)
    setIsAnimating(true)
    
    try {
      const response = await fetchMessages({
        page,
        limit: itemsPerPage,
        search: debouncedSearch,
        status: activeTab,
        sortBy,
        sortOrder
      })
      
      setMessages(response.data)
      setPagination(response.pagination)
      setCounts(response.counts)
      
      // Trigger animation after data loads
      setTimeout(() => {
        setShowContent(true)
        setListVisible(true)
      }, 50)
      
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
      setTimeout(() => setIsAnimating(false), 300)
    }
  }, [fetchMessages, itemsPerPage, debouncedSearch, activeTab, sortBy, sortOrder])

  // Initial load
  useEffect(() => {
    loadMessages(1, true, false)
  }, [])

  // When filters change (with animation)
  useEffect(() => {
    if (!loading) {
      loadMessages(1, false, true)
    }
  }, [debouncedSearch, activeTab, sortBy, sortOrder, itemsPerPage])

  // Handle body scroll lock for modal
  useEffect(() => {
    if (selectedMessage) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [selectedMessage])

  // Tab change handler with animation
  const handleTabChange = async (newTab) => {
    if (newTab === activeTab) return
    
    // Animate out
    setShowContent(false)
    setListVisible(false)
    
    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Change tab
    setActiveTab(newTab)
  }

  // Pagination handler
  const handlePageChange = (page) => {
    loadMessages(page, false, true)
  }

  // Items per page handler
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value)
  }

  // Toggle sort order
  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')
  }

  // Handle reply
  const handleReply = async () => {
    if (!replyText.trim()) return
    
    setSendingReply(true)
    try {
      await replyToMessage(selectedMessage._id, replyText)
      
      // Update local state with animation
      setMessages(prev => prev.map(msg => 
        msg._id === selectedMessage._id 
          ? { ...msg, status: "Responded", reply: replyText } 
          : msg
      ))
      
      // Update counts
      setCounts(prev => ({
        ...prev,
        new: Math.max(0, prev.new - 1),
        responded: prev.responded + 1
      }))
      
      setSelectedMessage(prev => ({ ...prev, status: "Responded", reply: replyText }))
      setReplyText("")
      alert("Reply sent successfully!")
    } catch (err) {
      console.error(err)
      alert("Failed to send email.")
    } finally {
      setSendingReply(false)
    }
  }

  // Utility functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateShort = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    })
  }

  const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : "??"

  // Loading state
  if (loading) {
    return (
      <AdminShell>
        <MessagesSkeleton />
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-0">
        
        {/* HEADER */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2.5 bg-slate-950 rounded-xl shadow-lg shadow-slate-950/20">
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-950">Messages</h1>
              </div>
              <p className="text-slate-500 text-sm sm:text-base ml-0 sm:ml-14">
                Manage client inquiries and support
              </p>
            </div>

            {/* Stats Pills - Desktop with animation */}
            <div className="hidden sm:flex items-center gap-3">
              <div 
                className={`flex items-center gap-2 px-4 py-2 bg-blue-400/10 border border-blue-400/20 rounded-full transition-all duration-300 ${
                  activeTab === 'new' ? 'scale-105 shadow-md' : ''
                }`}
              >
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-blue-600 tabular-nums">{counts.new} New</span>
              </div>
              <div 
                className={`flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full transition-all duration-300 ${
                  activeTab === 'responded' ? 'scale-105 shadow-md' : ''
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-semibold text-emerald-600 tabular-nums">{counts.responded} Done</span>
              </div>
              <div 
                className={`flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 rounded-full transition-all duration-300 ${
                  activeTab === 'all' ? 'scale-105 shadow-md' : ''
                }`}
              >
                <span className="text-sm font-semibold text-slate-600 tabular-nums">{counts.total} Total</span>
              </div>
            </div>
          </div>
        </div>

        {/* TABS with sliding indicator */}
        <div className="relative flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => handleTabChange("new")}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap transform ${
              activeTab === "new" 
                ? "bg-slate-950 text-white shadow-lg shadow-slate-950/30 scale-[1.02]" 
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 hover:scale-[1.01]"
            }`}
          >
            <Inbox className={`w-4 h-4 transition-colors duration-300 ${activeTab === "new" ? "text-blue-400" : ""}`} />
            Inbox
            {counts.new > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold transition-all duration-300 ${
                activeTab === "new" 
                  ? "bg-blue-400/20 text-blue-400" 
                  : "bg-blue-100 text-blue-600"
              }`}>
                {counts.new}
              </span>
            )}
          </button>
          <button
            onClick={() => handleTabChange("responded")}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap transform ${
              activeTab === "responded" 
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-[1.02]" 
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 hover:scale-[1.01]"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Responded
            {counts.responded > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold transition-all duration-300 ${
                activeTab === "responded" 
                  ? "bg-white/20 text-white" 
                  : "bg-emerald-100 text-emerald-600"
              }`}>
                {counts.responded}
              </span>
            )}
          </button>
          <button
            onClick={() => handleTabChange("all")}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap transform ${
              activeTab === "all" 
                ? "bg-slate-700 text-white shadow-lg shadow-slate-700/30 scale-[1.02]" 
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 hover:scale-[1.01]"
            }`}
          >
            <Mail className="w-4 h-4" />
            All Messages
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold transition-all duration-300 ${
              activeTab === "all" 
                ? "bg-white/20 text-white" 
                : "bg-slate-100 text-slate-600"
            }`}>
              {counts.total}
            </span>
          </button>
        </div>

        {/* SEARCH & SORT BAR */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
          {/* Search */}
          <div className="relative flex-1 group">
            <Search className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${
              searchTerm ? 'text-blue-500' : 'text-slate-400'
            }`} />
            <Input 
              placeholder="Search by name, email, or message..." 
              className={`pl-10 sm:pl-12 h-11 sm:h-12 bg-white border-slate-200 text-sm sm:text-base shadow-sm rounded-xl transition-all duration-300 ${
                searchTerm 
                  ? 'ring-2 ring-blue-400 border-blue-400' 
                  : 'focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400'
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className={`absolute right-3 top-1/2 -translate-y-1/2 transition-all duration-200 ${
              searchTerm ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}>
              <button 
                onClick={() => setSearchTerm("")}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            
            {/* Search indicator */}
            {debouncedSearch !== searchTerm && searchTerm && (
              <div className="absolute right-10 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              </div>
            )}
          </div>

          {/* Sort Toggle */}
          <button
            onClick={toggleSort}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200 text-sm font-medium text-slate-600 hover:scale-[1.02] active:scale-[0.98]"
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
              {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
            </span>
          </button>
        </div>

        {/* MESSAGE LIST with animations */}
        <div 
          ref={listContainerRef}
          className="relative min-h-[200px]"
        >
          {/* Loading Overlay */}
          <LoadingOverlay isLoading={loadingMore && !isAnimating} />
          
          <div className={`space-y-2 sm:space-y-3 transition-all duration-300 ${
            showContent ? 'opacity-100' : 'opacity-0'
          }`}>
            {messages.length === 0 ? (
              <div className={`text-center py-16 sm:py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 transition-all duration-500 ${
                showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}>
                <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform duration-500 ${
                  showContent ? 'scale-100 rotate-0' : 'scale-0 rotate-45'
                }`}>
                  {activeTab === "new" ? (
                    <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300" />
                  ) : (
                    <MailOpen className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300" />
                  )}
                </div>
                <h3 className={`text-lg sm:text-xl font-bold text-slate-950 mb-1 transition-all duration-300 delay-100 ${
                  showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                  {debouncedSearch 
                    ? "No results found" 
                    : activeTab === "new" 
                      ? "All caught up!" 
                      : "No messages"}
                </h3>
                <p className={`text-slate-500 text-sm sm:text-base transition-all duration-300 delay-150 ${
                  showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                  {debouncedSearch 
                    ? `No messages match "${debouncedSearch}"`
                    : activeTab === "new" 
                      ? "You've responded to all messages" 
                      : "Messages will appear here"}
                </p>
                {debouncedSearch && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className={`mt-4 px-4 py-2 bg-slate-950 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-all duration-300 delay-200 hover:scale-105 ${
                      showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              messages.map((msg, index) => (
                <AnimatedListItem key={msg._id} index={index} isVisible={listVisible}>
                  <div 
                    onClick={() => setSelectedMessage(msg)}
                    className="group bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-400/10 cursor-pointer transition-all duration-300 relative overflow-hidden hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {/* Status Indicator Bar with animation */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${
                      msg.status === "Responded" 
                        ? "bg-emerald-500" 
                        : "bg-blue-400"
                    }`}>
                      {msg.status !== "Responded" && (
                        <div className="absolute inset-0 bg-blue-300 animate-pulse" />
                      )}
                    </div>

                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 pl-2 sm:pl-3">
                      {/* Avatar with hover effect */}
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-sm sm:text-base font-bold shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${
                        msg.status === "Responded" 
                          ? "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200" 
                          : "bg-blue-400/10 text-blue-500 group-hover:bg-blue-400/20"
                      }`}>
                        {getInitials(msg.name)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 mb-1">
                          <h3 className="font-bold text-slate-950 text-base sm:text-lg truncate group-hover:text-blue-600 transition-colors duration-200">{msg.name}</h3>
                          <span className="text-slate-400 text-xs sm:text-sm truncate">{msg.email}</span>
                        </div>
                        
                        <p className="text-slate-600 text-sm line-clamp-1 sm:line-clamp-2 mb-2">
                          {msg.message}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <CalendarDays className="w-3 h-3" />
                            <span className="hidden sm:inline">{formatDate(msg.createdAt)}</span>
                            <span className="sm:hidden">{formatDateShort(msg.createdAt)}</span>
                          </span>
                          {msg.status === "Responded" && (
                            <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Replied
                            </span>
                          )}
                          {(msg.status === "New" || msg.status === "Pending") && (
                            <span className="flex items-center gap-1 text-xs text-blue-500 font-semibold bg-blue-400/10 px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span> New
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Arrow Icon with animation */}
                      <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-blue-400/10 transition-all duration-300 shrink-0 group-hover:translate-x-1">
                        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-400 transition-colors duration-200" />
                      </div>
                    </div>
                    
                    {/* Hover highlight effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/0 to-blue-400/0 group-hover:from-blue-400/5 group-hover:via-transparent group-hover:to-transparent transition-all duration-500 pointer-events-none" />
                  </div>
                </AnimatedListItem>
              ))
            )}
          </div>
          
          {/* Skeleton loading during animation */}
          {isAnimating && !showContent && (
            <div className="absolute inset-0 space-y-2 sm:space-y-3">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className="animate-pulse"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <MessageSkeleton />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PAGINATION with fade animation */}
        <div className={`transition-all duration-300 ${
          showContent && pagination.totalPages > 0 && messages.length > 0 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-4'
        }`}>
          {pagination.totalPages > 0 && messages.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-200">
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
                itemsPerPageOptions={[5, 10, 20, 50]}
              />
            </div>
          )}
        </div>
      </div>

      {/* MESSAGE DETAIL DRAWER with enhanced animations */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop with fade */}
          <div 
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setSelectedMessage(null)}
          />
          
          {/* Drawer with slide */}
          <div className="relative w-full sm:max-w-lg lg:max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl transition-colors duration-300 ${
                  selectedMessage.status === "Responded" 
                    ? "bg-emerald-100" 
                    : "bg-slate-950"
                }`}>
                  <Mail className={`w-5 h-5 transition-colors duration-300 ${
                    selectedMessage.status === "Responded" 
                      ? "text-emerald-500" 
                      : "text-blue-400"
                  }`} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-950">Message Details</h2>
                  <p className="text-xs text-slate-400 hidden sm:block">View and respond to this inquiry</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedMessage(null)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:rotate-90"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
              
              {/* Sender Info Card */}
              <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm animate-in slide-in-from-right duration-300 delay-100">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-lg sm:text-xl font-bold shadow-sm transition-all duration-300 ${
                  selectedMessage.status === "Responded" 
                    ? "bg-emerald-500 text-white" 
                    : "bg-slate-950 text-blue-400"
                }`}>
                  {getInitials(selectedMessage.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base sm:text-lg text-slate-950 truncate">{selectedMessage.name}</h3>
                  <div className="flex items-center gap-2 text-slate-500 text-xs sm:text-sm truncate">
                    <Mail className="w-3 h-3 shrink-0 text-blue-400" /> 
                    <span className="truncate">{selectedMessage.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm mt-1">
                    <Clock className="w-3 h-3 shrink-0" /> {formatDate(selectedMessage.createdAt)}
                  </div>
                </div>
                {selectedMessage.status === "Responded" ? (
                  <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-600 rounded-full text-xs font-semibold animate-in zoom-in duration-300">
                    <CheckCircle2 className="w-3 h-3" /> Replied
                  </div>
                ) : (
                  <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-blue-400/10 text-blue-500 rounded-full text-xs font-semibold">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span> New
                  </div>
                )}
              </div>

              {/* Client Message */}
              <div className="mb-6 sm:mb-8 animate-in slide-in-from-right duration-300 delay-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-slate-950 rounded-lg">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Client Message</h4>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <p className="text-base sm:text-lg text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              {/* Previous Reply */}
              {selectedMessage.reply && (
                <div className="mb-6 sm:mb-8 animate-in slide-in-from-right duration-300 delay-300">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-emerald-500 rounded-lg">
                      <Reply className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Your Reply</h4>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 sm:p-5 hover:shadow-md transition-shadow duration-300">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedMessage.reply}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Reply Input */}
            <div className="p-4 sm:p-6 border-t border-slate-100 bg-white animate-in slide-in-from-bottom duration-300 delay-200">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400 transition-all duration-300">
                <Textarea 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  className="min-h-[80px] sm:min-h-[100px] border-none focus-visible:ring-0 resize-none p-3 sm:p-4 text-sm sm:text-base bg-transparent"
                />
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 p-3 border-t border-slate-200 bg-white">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5 order-2 sm:order-1">
                    <Send className="w-3 h-3 text-blue-400" />
                    <span className="truncate">Reply to {selectedMessage.email}</span>
                  </span>
                  <Button 
                    onClick={handleReply}
                    disabled={!replyText.trim() || sendingReply}
                    className="bg-slate-950 hover:bg-slate-800 text-white rounded-xl px-6 py-2.5 shadow-lg shadow-slate-950/20 hover:shadow-slate-950/30 transition-all duration-300 disabled:opacity-50 disabled:shadow-none order-1 sm:order-2 group hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {sendingReply ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Send Reply
                        <Send className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}