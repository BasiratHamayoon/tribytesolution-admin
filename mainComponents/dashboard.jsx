"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import {
  MessageSquare,
  Briefcase,
  Users,
  AlertCircle,
  BarChart3,
  ArrowUpRight,
  BriefcaseBusiness,
  TrendingUp,
  Clock,
  Sparkles,
} from "lucide-react"
import { useAppContext } from "../app/AppContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

function StatCard({ title, value, icon: Icon, sub, index, gradient }) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 120)
    return () => clearTimeout(timer)
  }, [index])

  useEffect(() => {
    if (!isVisible) return
    const target = typeof value === "number" ? value : parseInt(value) || 0
    if (target === 0) {
      setCount(0)
      return
    }
    let start = 0
    const duration = 1200
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [value, isVisible])

  return (
    <div
      className={`transform transition-all duration-700 ease-out ${
        isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-95"
      }`}
    >
      <Card className="group relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-500 cursor-pointer hover:shadow-lg hover:shadow-primary/[0.08] hover:-translate-y-1">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br ${gradient}`} />
        <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-primary/[0.03] group-hover:bg-primary/[0.06] transition-all duration-700 group-hover:scale-150" />
        <CardContent className="relative px-4 py-4">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/25 group-hover:rotate-3">
              <Icon className="w-4.5 h-4.5" strokeWidth={2.2} />
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span className="text-[9px] font-bold text-emerald-500">Active</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground leading-none tracking-tight group-hover:text-primary transition-colors duration-500 tabular-nums">
                {count}
              </span>
            </div>
            <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
              {title}
            </p>
            {sub && (
              <p className="text-[10px] text-muted-foreground/50 font-medium mt-1.5 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {sub}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getNiceTicks(max, count = 4) {
  if (max === 0) return [0, 1, 2, 3, 4]
  const step = Math.ceil(max / count)
  return Array.from({ length: count + 1 }, (_, i) => i * step)
}

function SkeletonPulse({ className }) {
  return <div className={`bg-muted/60 rounded-lg animate-pulse ${className}`} />
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <SkeletonPulse className="h-6 w-32 mb-2" />
          <SkeletonPulse className="h-3.5 w-52" />
        </div>
        <SkeletonPulse className="h-7 w-36 rounded-full" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-border/30">
            <CardContent className="px-4 py-4">
              <div className="flex items-start justify-between mb-3">
                <SkeletonPulse className="w-10 h-10 rounded-xl" />
              </div>
              <SkeletonPulse className="h-7 w-14 mb-2" />
              <SkeletonPulse className="h-3 w-20 mb-2" />
              <SkeletonPulse className="h-2.5 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="border-border/30">
            <CardContent className="p-4">
              <SkeletonPulse className="h-4 w-28 mb-4" />
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex items-center gap-3 py-2.5">
                  <SkeletonPulse className="w-8 h-8 rounded-full" />
                  <div className="flex-1">
                    <SkeletonPulse className="h-3 w-24 mb-1.5" />
                    <SkeletonPulse className="h-2.5 w-32" />
                  </div>
                  <SkeletonPulse className="h-5 w-14 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { fetchDashboardData } = useAppContext()
  const [dashboardData, setDashboardData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [contentVisible, setContentVisible] = useState(false)
  const isFetched = useRef(false)

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setContentVisible(false)
      const data = await fetchDashboardData()
      setDashboardData(data)
      setTimeout(() => setContentVisible(true), 100)
    } catch (err) {
      console.error(err)
      setError("Could not load dashboard stats")
    } finally {
      setLoading(false)
    }
  }, [fetchDashboardData])

  useEffect(() => {
    if (isFetched.current) return
    isFetched.current = true
    loadDashboard()
  }, [loadDashboard])

  if (loading) return <DashboardSkeleton />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-in fade-in zoom-in-95 duration-500">
        <Card className="max-w-sm w-full text-center border-destructive/20 shadow-lg shadow-destructive/5">
          <CardContent className="p-8">
            <div className="w-14 h-14 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <AlertCircle className="w-7 h-7 text-destructive" />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-1.5">Dashboard Unavailable</h3>
            <p className="text-muted-foreground text-xs mb-5 leading-relaxed">{error}</p>
            <Button
              onClick={() => {
                isFetched.current = false
                loadDashboard()
              }}
              size="sm"
              className="h-9 px-6 text-xs font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const s = dashboardData?.stats || {}

  const gradients = [
    "from-blue-500/[0.03] to-transparent",
    "from-violet-500/[0.03] to-transparent",
    "from-amber-500/[0.03] to-transparent",
    "from-emerald-500/[0.03] to-transparent",
  ]

  return (
    <div className={`space-y-5 transition-all duration-700 ${contentVisible ? "opacity-100" : "opacity-0"}`}>
      <div
        className={`flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between transition-all duration-700 delay-100 ${
          contentVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Dashboard
            </h1>
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground text-xs font-medium">
            Real-time overview of your TribyteSolution business
          </p>
        </div>
        <Badge
          variant="outline"
          className="self-start text-[10px] px-3 py-1.5 border-primary/20 text-primary font-bold bg-primary/[0.03] hover:bg-primary/[0.06] transition-colors duration-300 rounded-full"
        >
          {new Date().toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Messages"
          value={s.totalMessages || 0}
          icon={MessageSquare}
          sub={`${s.unreadMessages || 0} unread · ${s.respondedMessages || 0} replied`}
          index={0}
          gradient={gradients[0]}
        />
        <StatCard
          title="Projects"
          value={s.totalProjects || 0}
          icon={Briefcase}
          sub={`${s.featuredProjects || 0} featured`}
          index={1}
          gradient={gradients[1]}
        />
        <StatCard
          title="Services"
          value={s.totalServices || 0}
          icon={BriefcaseBusiness}
          sub={`${s.popularServices || 0} popular`}
          index={2}
          gradient={gradients[2]}
        />
        <StatCard
          title="Team"
          value={s.totalTeamMembers || s.teamMembers || 0}
          icon={Users}
          sub={`${s.activeTeamMembers || 0} active`}
          index={3}
          gradient={gradients[3]}
        />
      </div>

      <div
        className={`grid grid-cols-1 lg:grid-cols-2 gap-3 transition-all duration-700 delay-500 ${
          contentVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        }`}
      >
        <Card className="border-border/50 hover:border-primary/20 transition-all duration-500 hover:shadow-md hover:shadow-primary/[0.04] group">
          <CardHeader className="pb-1.5 px-4 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[13px] font-bold flex items-center gap-2.5 text-foreground">
                <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                Recent Inbox
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] h-7 px-2.5 text-muted-foreground hover:text-primary font-semibold group/btn"
              >
                View All
                <ArrowUpRight className="w-3 h-3 ml-1 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            {dashboardData?.recentMessages?.length > 0 ? (
              <div>
                {dashboardData.recentMessages.slice(0, 5).map((msg, i) => (
                  <div
                    key={msg._id}
                    className={`transition-all duration-500 ${
                      contentVisible ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
                    }`}
                    style={{ transitionDelay: `${600 + i * 80}ms` }}
                  >
                    <div className="flex items-center justify-between px-2.5 py-2.5 hover:bg-accent/50 rounded-xl transition-all duration-300 group/item cursor-pointer">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all duration-300 ${
                            msg.status === "Responded"
                              ? "bg-muted text-muted-foreground"
                              : "bg-primary/10 text-primary group-hover/item:bg-primary group-hover/item:text-primary-foreground group-hover/item:shadow-md group-hover/item:shadow-primary/20 group-hover/item:scale-110"
                          }`}
                        >
                          {msg.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground text-xs truncate leading-none group-hover/item:text-primary transition-colors duration-300">
                            {msg.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70 truncate mt-1">
                            {msg.email}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-[8px] px-2 py-0.5 h-[18px] border-0 shrink-0 font-bold uppercase tracking-widest rounded-full transition-all duration-300 ${
                          msg.status === "Responded"
                            ? "bg-muted/50 text-muted-foreground/40"
                            : "bg-primary/10 text-primary group-hover/item:bg-primary/20"
                        }`}
                      >
                        {msg.status === "Pending" || msg.status === "New" ? "New" : "Replied"}
                      </Badge>
                    </div>
                    {i < dashboardData.recentMessages.slice(0, 5).length - 1 && (
                      <Separator className="mx-3 opacity-30" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-36 flex flex-col items-center justify-center text-muted-foreground">
                <div className="p-3 rounded-2xl bg-muted/30 mb-3">
                  <MessageSquare className="w-6 h-6 opacity-30" />
                </div>
                <p className="text-[11px] font-medium">No recent messages</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:border-primary/20 transition-all duration-500 hover:shadow-md hover:shadow-primary/[0.04] group">
          <CardHeader className="pb-1.5 px-4 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[13px] font-bold flex items-center gap-2.5 text-foreground">
                <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                Latest Projects
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] h-7 px-2.5 text-muted-foreground hover:text-primary font-semibold group/btn"
              >
                View All
                <ArrowUpRight className="w-3 h-3 ml-1 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            {dashboardData?.recentProjects?.length > 0 ? (
              <div>
                {dashboardData.recentProjects.slice(0, 5).map((project, i) => (
                  <div
                    key={project._id}
                    className={`transition-all duration-500 ${
                      contentVisible ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
                    }`}
                    style={{ transitionDelay: `${600 + i * 80}ms` }}
                  >
                    <div className="flex items-center justify-between px-2.5 py-2.5 hover:bg-accent/50 rounded-xl transition-all duration-300 cursor-pointer group/item">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground text-xs truncate flex items-center gap-1.5 leading-none group-hover/item:text-primary transition-colors duration-300">
                          {project.title}
                          <ArrowUpRight className="w-3 h-3 text-muted-foreground/20 group-hover/item:text-primary transition-all duration-300 group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 shrink-0" />
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1 font-medium">
                          {project.category}
                        </p>
                      </div>
                      {project.tag && (
                        <Badge
                          variant="secondary"
                          className="text-[8px] px-2 py-0.5 h-[18px] bg-primary/10 text-primary border-0 shrink-0 font-bold rounded-full group-hover/item:bg-primary/20 transition-all duration-300"
                        >
                          {project.tag}
                        </Badge>
                      )}
                    </div>
                    {i < dashboardData.recentProjects.slice(0, 5).length - 1 && (
                      <Separator className="mx-3 opacity-30" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-36 flex flex-col items-center justify-center text-muted-foreground">
                <div className="p-3 rounded-2xl bg-muted/30 mb-3">
                  <Briefcase className="w-6 h-6 opacity-30" />
                </div>
                <p className="text-[11px] font-medium">No projects yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {dashboardData?.chartData && dashboardData.chartData.length > 0 && (
        <div
          className={`transition-all duration-700 delay-700 ${
            contentVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <Card className="border-border/50 hover:border-primary/20 transition-all duration-500 hover:shadow-md hover:shadow-primary/[0.04] group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-[13px] font-bold text-foreground flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                      <BarChart3 className="w-3.5 h-3.5" />
                    </div>
                    Traffic Overview
                  </h2>
                  <p className="text-muted-foreground text-[10px] mt-1 ml-[38px] font-medium">
                    Last 7 days activity
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary shadow-sm shadow-primary/30" />
                  <span className="text-[10px] text-muted-foreground font-semibold">Messages</span>
                </div>
              </div>

              <div className="flex w-full">
                <div className="flex flex-col items-end mr-3">
                  <div className="flex flex-col justify-between h-32">
                    {getNiceTicks(
                      Math.max(...dashboardData.chartData.map((d) => d.count), 1),
                      4
                    )
                      .slice()
                      .reverse()
                      .map((tick, i) => (
                        <div key={i} className="flex items-center h-8">
                          <span className="text-[10px] text-muted-foreground/60 w-5 text-right font-semibold tabular-nums">
                            {tick}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
                <div className="relative flex-1 flex items-end h-32">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {getNiceTicks(
                      Math.max(...dashboardData.chartData.map((d) => d.count), 1),
                      4
                    )
                      .slice(1)
                      .reverse()
                      .map((_, i) => (
                        <div key={i} className="border-t border-border/30 w-full" />
                      ))}
                  </div>
                  <div className="flex flex-1 items-end w-full h-full gap-2.5 z-10">
                    {dashboardData.chartData.map((day, i) => {
                      const maxVal = Math.max(
                        ...dashboardData.chartData.map((d) => d.count),
                        1
                      )
                      const heightPct = (day.count / maxVal) * 100
                      return (
                        <div
                          key={day._id}
                          className={`flex-1 flex flex-col items-center group/bar min-w-[28px] transition-all duration-700 ${
                            contentVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                          }`}
                          style={{ transitionDelay: `${900 + i * 100}ms` }}
                        >
                          <span className="mb-1 text-[9px] font-bold text-primary opacity-0 group-hover/bar:opacity-100 transition-all duration-300 -translate-y-1 group-hover/bar:translate-y-0">
                            {day.count}
                          </span>
                          <div className="relative w-full flex justify-center items-end h-[80px]">
                            <div
                              className="w-6 rounded-t-lg transition-all duration-700 ease-out bg-gradient-to-t from-primary/80 to-primary/50 hover:from-primary hover:to-primary/70 cursor-pointer group-hover/bar:shadow-lg group-hover/bar:shadow-primary/25 group-hover/bar:scale-x-110"
                              style={{
                                height: contentVisible
                                  ? `${Math.max(heightPct, 6)}%`
                                  : "0%",
                                minHeight: 4,
                                transitionDelay: `${1000 + i * 100}ms`,
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground/60 mt-2 font-semibold group-hover/bar:text-primary transition-colors duration-300">
                            {new Date(day._id).toLocaleDateString("en", {
                              weekday: "narrow",
                            })}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}