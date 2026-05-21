"use client"

import { useEffect, useState, useRef } from "react"
import {
  Search, Mail, CheckCircle2, X, Send, Clock,
  CalendarDays, Inbox, MessageSquare, ArrowRight,
  Sparkles, MailOpen, Reply, SortAsc, SortDesc, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AdminShell from "../../../mainComponents/SideBar/AdminSiderbar"
import { useAppContext } from "../../AppContext"
import Pagination from "@/components/ui/paginations"

const AnimatedListItem = ({ children, index, isVisible }) => (
  <div
    className={`transform transition-all duration-500 ease-out ${
      isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-[0.98]"
    }`}
    style={{ transitionDelay: `${index * 60}ms` }}
  >
    {children}
  </div>
)

const LoadingOverlay = ({ isLoading }) => {
  if (!isLoading) return null
  return (
    <div className="absolute inset-0 bg-card/60 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-xl transition-opacity duration-300">
      <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full shadow-lg border border-primary/20">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
        <span className="text-[11px] font-semibold text-primary">Loading...</span>
      </div>
    </div>
  )
}

function MessagesSkeleton() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-10 h-10 bg-muted rounded-xl animate-pulse" />
            <div>
              <div className="h-5 w-24 bg-muted rounded animate-pulse mb-1.5" />
              <div className="h-3 w-44 bg-muted/60 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <div className="h-7 w-20 bg-muted rounded-full animate-pulse" />
          <div className="h-7 w-20 bg-muted rounded-full animate-pulse" />
          <div className="h-7 w-16 bg-muted rounded-full animate-pulse" />
        </div>
      </div>

      <Card className="border-border/50 mb-4">
        <CardContent className="p-3">
          <div className="flex gap-1.5 mb-3">
            <div className="h-9 w-24 bg-muted rounded-lg animate-pulse" />
            <div className="h-9 w-28 bg-muted/60 rounded-lg animate-pulse" />
            <div className="h-9 w-16 bg-muted/40 rounded-lg animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 flex-1 bg-muted/30 rounded-lg animate-pulse" />
            <div className="h-9 w-20 bg-muted/30 rounded-lg animate-pulse" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((item) => (
          <Card key={item} className="border-border/50 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary/20 rounded-r-full" />
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-3 pl-2.5">
                <div className="w-9 h-9 sm:w-11 sm:h-11 bg-muted animate-pulse rounded-xl shrink-0" />
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 mb-1.5">
                    <div className="h-3.5 w-28 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-36 bg-muted/60 animate-pulse rounded" />
                  </div>
                  <div className="h-3 w-full bg-muted/40 animate-pulse rounded mb-1.5" />
                  <div className="h-3 w-2/3 bg-muted/30 animate-pulse rounded mb-2 hidden sm:block" />
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-20 bg-muted/40 animate-pulse rounded" />
                    <div className="h-[18px] w-14 bg-muted/40 animate-pulse rounded-full" />
                  </div>
                </div>
                <div className="hidden sm:block w-9 h-9 bg-muted/40 animate-pulse rounded-xl shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function MessagesPage() {
  const { fetchMessages, replyToMessage } = useAppContext()

  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showContent, setShowContent] = useState(true)
  const [listVisible, setListVisible] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(false)

  const [activeTab, setActiveTab] = useState("new")
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [sortOrder, setSortOrder] = useState("desc")

  const [pagination, setPagination] = useState({
    currentPage: 1, totalPages: 1, totalItems: 0,
    itemsPerPage: 10, hasNextPage: false, hasPrevPage: false
  })
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [counts, setCounts] = useState({ new: 0, responded: 0, total: 0 })

  const [selectedMessage, setSelectedMessage] = useState(null)
  const [replyText, setReplyText] = useState("")
  const [sendingReply, setSendingReply] = useState(false)

  const hasMounted = useRef(false)
  const debounceRef = useRef(null)
  const fetchMessagesRef = useRef(fetchMessages)

  useEffect(() => {
    fetchMessagesRef.current = fetchMessages
  }, [fetchMessages])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(searchTerm), 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [searchTerm])

  const loadMessages = async ({ page = 1, showLoader = true, animate = true, search, tab, order, perPage }) => {
    if (animate) {
      setShowContent(false)
      setListVisible(false)
      await new Promise(resolve => setTimeout(resolve, 150))
    }
    if (showLoader) setLoading(true)
    else setLoadingMore(true)
    setIsAnimating(true)

    try {
      const response = await fetchMessagesRef.current({
        page,
        limit: perPage,
        search: search,
        status: tab,
        sortBy: "createdAt",
        sortOrder: order
      })
      setMessages(response.data)
      setPagination(response.pagination)
      setCounts(response.counts)
      setTimeout(() => { setShowContent(true); setListVisible(true) }, 80)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
      setTimeout(() => setIsAnimating(false), 300)
    }
  }

  useEffect(() => {
    if (hasMounted.current) return
    hasMounted.current = true
    setTimeout(() => setHeaderVisible(true), 100)
    loadMessages({
      page: 1,
      showLoader: true,
      animate: false,
      search: "",
      tab: "new",
      order: "desc",
      perPage: 10
    })
  }, [])

  useEffect(() => {
    if (!hasMounted.current) return
    loadMessages({
      page: 1,
      showLoader: false,
      animate: true,
      search: debouncedSearch,
      tab: activeTab,
      order: sortOrder,
      perPage: itemsPerPage
    })
  }, [debouncedSearch, activeTab, sortOrder, itemsPerPage])

  useEffect(() => {
    if (selectedMessage) document.body.style.overflow = "hidden"
    else document.body.style.overflow = "unset"
    return () => { document.body.style.overflow = "unset" }
  }, [selectedMessage])

  const handleTabChange = async (newTab) => {
    if (newTab === activeTab) return
    setShowContent(false)
    setListVisible(false)
    await new Promise(resolve => setTimeout(resolve, 200))
    setActiveTab(newTab)
  }

  const handlePageChange = (page) => {
    loadMessages({
      page,
      showLoader: false,
      animate: true,
      search: debouncedSearch,
      tab: activeTab,
      order: sortOrder,
      perPage: itemsPerPage
    })
  }

  const handleItemsPerPageChange = (value) => setItemsPerPage(value)
  const toggleSort = () => setSortOrder(prev => prev === "desc" ? "asc" : "desc")

  const handleReply = async () => {
    if (!replyText.trim()) return
    setSendingReply(true)
    try {
      await replyToMessage(selectedMessage._id, replyText)
      setMessages(prev => prev.map(msg =>
        msg._id === selectedMessage._id
          ? { ...msg, status: "Responded", reply: replyText }
          : msg
      ))
      setCounts(prev => ({
        ...prev,
        new: Math.max(0, prev.new - 1),
        responded: prev.responded + 1
      }))
      setSelectedMessage(prev => ({ ...prev, status: "Responded", reply: replyText }))
      setReplyText("")
    } catch (err) {
      console.error(err)
      alert("Failed to send reply.")
    } finally {
      setSendingReply(false)
    }
  }

  const formatDate = (d) => new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  })
  const formatDateShort = (d) => new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric"
  })
  const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : "??"

  if (loading) {
    return (
      <AdminShell>
        <MessagesSkeleton />
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <div className="max-w-6xl mx-auto">

        <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 transition-all duration-700 ${
          headerVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}>
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight">Messages</h1>
                <p className="text-muted-foreground text-[11px] font-medium">
                  Manage client inquiries and support
                </p>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <Badge variant="outline" className={`text-[10px] px-3 py-1.5 gap-1.5 transition-all duration-300 rounded-full font-bold ${
              activeTab === "new" ? "border-primary/40 shadow-sm shadow-primary/10 bg-primary/5" : "border-primary/20"
            } text-primary`}>
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              {counts.new} New
            </Badge>
            <Badge variant="outline" className={`text-[10px] px-3 py-1.5 gap-1.5 transition-all duration-300 rounded-full font-bold ${
              activeTab === "responded" ? "border-primary/40 shadow-sm shadow-primary/10 bg-primary/5" : "border-primary/20"
            } text-primary`}>
              <CheckCircle2 className="w-3 h-3" />
              {counts.responded} Done
            </Badge>
            <Badge variant="outline" className="text-[10px] px-3 py-1.5 text-muted-foreground rounded-full font-bold">
              {counts.total} Total
            </Badge>
          </div>
        </div>

        <div className={`transition-all duration-700 delay-100 ${
          headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          <Card className="border-border/50 mb-4 overflow-hidden">
            <CardContent className="p-3">
              <div className="flex gap-1.5 mb-3 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => handleTabChange("new")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                    activeTab === "new"
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Inbox className="w-3.5 h-3.5" />
                  Inbox
                  {counts.new > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                      activeTab === "new" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"
                    }`}>
                      {counts.new}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => handleTabChange("responded")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                    activeTab === "responded"
                      ? "bg-foreground text-background shadow-md"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Responded
                  {counts.responded > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                      activeTab === "responded" ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"
                    }`}>
                      {counts.responded}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => handleTabChange("all")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                    activeTab === "all"
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  All
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                    activeTab === "all" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {counts.total}
                  </span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 transition-colors duration-300 ${
                    searchTerm ? "text-primary" : "text-muted-foreground"
                  }`} />
                  <Input
                    placeholder="Search by name, email, or message..."
                    className={`pl-9 h-9 text-xs bg-muted/30 border-border/50 rounded-lg transition-all duration-300 ${
                      searchTerm ? "ring-1 ring-primary/50 border-primary/50 bg-primary/[0.02]" : "focus:ring-1 focus:ring-primary/30"
                    }`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && debouncedSearch === searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
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

                <button
                  onClick={toggleSort}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-muted/30 border border-border/50 rounded-lg hover:bg-primary/5 hover:border-primary/30 text-xs font-semibold text-muted-foreground hover:text-primary transition-all duration-300"
                >
                  <div className="relative w-3.5 h-3.5">
                    <SortDesc className={`w-3.5 h-3.5 absolute transition-all duration-300 ${sortOrder === "desc" ? "opacity-100 rotate-0" : "opacity-0 rotate-180"}`} />
                    <SortAsc className={`w-3.5 h-3.5 absolute transition-all duration-300 ${sortOrder === "asc" ? "opacity-100 rotate-0" : "opacity-0 -rotate-180"}`} />
                  </div>
                  <span className="hidden sm:inline">{sortOrder === "desc" ? "Newest" : "Oldest"}</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="relative min-h-[200px]">
          <LoadingOverlay isLoading={loadingMore && !isAnimating} />

          <div className={`space-y-2 transition-all duration-300 ${showContent ? "opacity-100" : "opacity-0"}`}>
            {messages.length === 0 ? (
              <Card className={`border-dashed border-2 border-primary/20 transition-all duration-500 ${showContent ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                <CardContent className="py-16 text-center">
                  <div className={`w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-700 ${
                    showContent ? "scale-100 rotate-0" : "scale-0 rotate-45"
                  }`}>
                    {activeTab === "new" ? <Sparkles className="w-8 h-8 text-primary/30" /> : <MailOpen className="w-8 h-8 text-primary/30" />}
                  </div>
                  <h3 className="text-sm font-black text-foreground mb-1.5">
                    {debouncedSearch ? "No results found" : activeTab === "new" ? "All caught up!" : "No messages"}
                  </h3>
                  <p className="text-muted-foreground text-xs max-w-[280px] mx-auto">
                    {debouncedSearch ? `No messages match "${debouncedSearch}"` : activeTab === "new" ? "You've responded to all messages" : "Messages will appear here"}
                  </p>
                  {debouncedSearch && (
                    <Button onClick={() => setSearchTerm("")} size="sm" className="mt-4 h-8 text-[10px] rounded-lg font-bold shadow-md shadow-primary/20">
                      Clear Search
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              messages.map((msg, index) => (
                <AnimatedListItem key={msg._id} index={index} isVisible={listVisible}>
                  <Card
                    onClick={() => setSelectedMessage(msg)}
                    className="group cursor-pointer border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.06] transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5"
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full transition-all duration-500 ${
                      msg.status === "Responded" ? "bg-foreground/20" : "bg-primary"
                    }`}>
                      {msg.status !== "Responded" && (
                        <div className="absolute inset-0 bg-primary/60 animate-pulse rounded-r-full" />
                      )}
                    </div>

                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />

                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 pl-2 sm:pl-2.5">
                        <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-[10px] sm:text-xs font-black shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${
                          msg.status === "Responded"
                            ? "bg-muted text-muted-foreground group-hover:bg-foreground group-hover:text-background group-hover:shadow-foreground/20"
                            : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-primary/25"
                        }`}>
                          {getInitials(msg.name)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 mb-0.5">
                            <h3 className="font-black text-foreground text-xs sm:text-[13px] truncate group-hover:text-primary transition-colors duration-300">{msg.name}</h3>
                            <span className="text-muted-foreground/60 text-[10px] truncate font-medium">{msg.email}</span>
                          </div>
                          <p className="text-muted-foreground/70 text-[11px] line-clamp-1 sm:line-clamp-2 mb-2 font-medium">{msg.message}</p>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground/50 font-semibold">
                              <CalendarDays className="w-2.5 h-2.5" />
                              <span className="hidden sm:inline">{formatDate(msg.createdAt)}</span>
                              <span className="sm:hidden">{formatDateShort(msg.createdAt)}</span>
                            </span>
                            {msg.status === "Responded" && (
                              <Badge variant="secondary" className="text-[8px] px-2 py-0.5 h-[18px] border-0 bg-foreground/5 text-foreground/50 gap-1 rounded-full font-bold">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Replied
                              </Badge>
                            )}
                            {(msg.status === "New" || msg.status === "Pending") && (
                              <Badge variant="secondary" className="text-[8px] px-2 py-0.5 h-[18px] border-0 bg-primary/10 text-primary gap-1 rounded-full font-bold">
                                <span className="w-1 h-1 bg-primary rounded-full animate-pulse" /> New
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl bg-muted/50 group-hover:bg-primary/10 transition-all duration-300 shrink-0 group-hover:translate-x-0.5">
                          <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-all duration-300" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedListItem>
              ))
            )}
          </div>

          {isAnimating && !showContent && (
            <div className="absolute inset-0 space-y-2">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="border-border/50 relative overflow-hidden" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary/20 rounded-r-full" />
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-3 pl-2.5">
                      <div className="w-9 h-9 sm:w-11 sm:h-11 bg-muted animate-pulse rounded-xl shrink-0" />
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 mb-1.5">
                          <div className="h-3.5 w-28 bg-muted animate-pulse rounded" />
                          <div className="h-3 w-36 bg-muted/60 animate-pulse rounded" />
                        </div>
                        <div className="h-3 w-full bg-muted/40 animate-pulse rounded mb-1.5" />
                        <div className="h-3 w-2/3 bg-muted/30 animate-pulse rounded mb-2 hidden sm:block" />
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-20 bg-muted/40 animate-pulse rounded" />
                          <div className="h-[18px] w-14 bg-muted/40 animate-pulse rounded-full" />
                        </div>
                      </div>
                      <div className="hidden sm:block w-9 h-9 bg-muted/40 animate-pulse rounded-xl shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className={`transition-all duration-500 ${
          showContent && pagination.totalPages > 0 && messages.length > 0
            ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          {pagination.totalPages > 0 && messages.length > 0 && (
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
                itemsPerPageOptions={[5, 10, 20, 50]}
              />
            </div>
          )}
        </div>
      </div>

      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-foreground/50 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setSelectedMessage(null)}
          />

          <div className="relative w-full sm:max-w-lg lg:max-w-2xl bg-card h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-400 border-l border-border/50">

            <div className="p-4 sm:p-5 border-b border-border/50 flex items-center justify-between bg-gradient-to-r from-primary/[0.03] to-transparent">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl transition-colors ${
                  selectedMessage.status === "Responded" ? "bg-foreground/5" : "bg-primary/10"
                }`}>
                  <Mail className={`w-4 h-4 ${
                    selectedMessage.status === "Responded" ? "text-foreground/50" : "text-primary"
                  }`} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-foreground">Message Details</h2>
                  <p className="text-[10px] text-muted-foreground/60 font-medium hidden sm:block">View and respond to this inquiry</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-2 hover:bg-primary/5 rounded-xl transition-all duration-300 hover:rotate-90"
              >
                <X className="w-4 h-4 text-muted-foreground hover:text-primary" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-muted/20">

              <Card className="mb-4 border-border/50 overflow-hidden">
                <div className={`h-1 ${selectedMessage.status === "Responded" ? "bg-foreground/10" : "bg-primary"}`} />
                <CardContent className="p-4">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-sm font-black shrink-0 shadow-lg ${
                      selectedMessage.status === "Responded"
                        ? "bg-foreground text-background shadow-foreground/20"
                        : "bg-primary text-primary-foreground shadow-primary/25"
                    }`}>
                      {getInitials(selectedMessage.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-[15px] text-foreground truncate">{selectedMessage.name}</h3>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 truncate font-medium">
                        <Mail className="w-3 h-3 shrink-0 text-primary" />
                        <span className="truncate">{selectedMessage.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/40 mt-0.5 font-medium">
                        <Clock className="w-3 h-3 shrink-0" /> {formatDate(selectedMessage.createdAt)}
                      </div>
                    </div>
                    {selectedMessage.status === "Responded" ? (
                      <Badge className="hidden sm:flex text-[8px] px-2 py-0.5 h-5 border-0 bg-foreground/5 text-foreground/50 gap-1 rounded-full font-bold">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Replied
                      </Badge>
                    ) : (
                      <Badge className="hidden sm:flex text-[8px] px-2 py-0.5 h-5 border-0 bg-primary/10 text-primary gap-1 rounded-full font-bold">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" /> New
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <MessageSquare className="w-3 h-3" />
                  </div>
                  <h4 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Client Message</h4>
                </div>
                <Card className="border-border/50">
                  <CardContent className="p-4 sm:p-5">
                    <p className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {selectedMessage.reply && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                      <Reply className="w-3 h-3" />
                    </div>
                    <h4 className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Your Reply</h4>
                  </div>
                  <Card className="border-primary/20 bg-primary/[0.02]">
                    <CardContent className="p-4 sm:p-5">
                      <p className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap">{selectedMessage.reply}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-5 border-t border-border/50 bg-card">
              <Card className="border-border/50 overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 transition-all duration-300">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  className="min-h-[70px] sm:min-h-[90px] border-none focus-visible:ring-0 resize-none p-3.5 text-xs bg-transparent"
                />
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 p-3 border-t border-border/30 bg-muted/20">
                  <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1.5 order-2 sm:order-1 truncate font-semibold">
                    <Send className="w-2.5 h-2.5 text-primary shrink-0" />
                    <span className="truncate">Reply to {selectedMessage.email}</span>
                  </span>
                  <Button
                    onClick={handleReply}
                    disabled={!replyText.trim() || sendingReply}
                    size="sm"
                    className="h-8 px-5 text-xs rounded-lg order-1 sm:order-2 group font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
                  >
                    {sendingReply ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        Send Reply
                        <Send className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                      </span>
                    )}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}