"use client"

import { useEffect, useState } from "react"
import {
  MessageSquare,
  Briefcase,
  Users,
  AlertCircle,
  BarChart3,
  ArrowUpRight,
  BriefcaseBusiness,
} from "lucide-react"
import { useAppContext } from "../app/AppContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

// ─── ULTRA COMPACT STAT CARD ────────────────────────────────────────────────
function StatCard({ title, value, icon: Icon, sub }) {
  return (
    <Card className="group relative overflow-hidden border-border hover:border-primary/40 transition-all duration-400 cursor-pointer hover:shadow-md hover:shadow-primary/[0.05]">
      {/* Accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

      <CardContent className="px-3 py-2.5 flex items-center gap-3">
        {/* Icon */}
        <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:scale-110 group-hover:shadow-sm group-hover:shadow-primary/20 shrink-0">
          <Icon className="w-4 h-4" />
        </div>

        {/* Value + Title */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-extrabold text-foreground leading-none tracking-tight group-hover:text-primary transition-colors duration-300">
              {value}
            </span>
            <span className="text-[11px] font-medium text-muted-foreground leading-none">
              {title}
            </span>
          </div>
          {sub && (
            <p className="text-[9px] text-muted-foreground/60 font-medium mt-0.5 truncate">
              {sub}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── CHART TICKS ────────────────────────────────────────────────────────────
function getNiceTicks(max, count = 4) {
  if (max === 0) return [0, 1, 2, 3, 4]
  const step = Math.ceil(max / count)
  return Array.from({ length: count + 1 }, (_, i) => i * step)
}

// ─── SKELETON ───────────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div>
        <div className="h-5 w-28 bg-muted rounded mb-1.5" />
        <div className="h-3 w-44 bg-muted/60 rounded" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="px-3 py-2.5 flex items-center gap-3">
              <div className="w-7 h-7 bg-muted rounded-lg shrink-0" />
              <div className="flex-1">
                <div className="h-4 w-12 bg-muted rounded mb-1" />
                <div className="h-2.5 w-20 bg-muted/60 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-4 w-24 bg-muted rounded mb-3" />
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex items-center gap-2.5 py-2">
                  <div className="w-6 h-6 bg-muted rounded-full" />
                  <div className="flex-1">
                    <div className="h-3 w-20 bg-muted rounded mb-1" />
                    <div className="h-2.5 w-28 bg-muted/60 rounded" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ─── MAIN DASHBOARD ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const { fetchDashboardData } = useAppContext()
  const [dashboardData, setDashboardData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const data = await fetchDashboardData()
      setDashboardData(data)
    } catch (err) {
      console.error(err)
      setError("Could not load dashboard stats")
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <DashboardSkeleton />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Card className="max-w-sm w-full text-center border-border">
          <CardContent className="p-6">
            <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-1">Dashboard Unavailable</h3>
            <p className="text-muted-foreground text-xs mb-4">{error}</p>
            <Button onClick={loadDashboard} size="sm" className="h-8 text-xs">Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const s = dashboardData?.stats || {}

  return (
    <div className="space-y-4 animate-in fade-in duration-500">

      {/* ── HEADER ────────────────────────────────────── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-xs">Overview of your business performance</p>
        </div>
        <Badge
          variant="outline"
          className="self-start text-[10px] px-2.5 py-1 border-primary/20 text-primary font-semibold"
        >
          {new Date().toLocaleDateString("en-US", {
            weekday: "short", month: "short", day: "numeric", year: "numeric",
          })}
        </Badge>
      </div>

      {/* ── 4 STAT CARDS (compact single row) ─────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <StatCard
          title="Messages"
          value={s.totalMessages || 0}
          icon={MessageSquare}
          sub={`${s.unreadMessages || 0} unread · ${s.respondedMessages || 0} replied`}
        />
        <StatCard
          title="Projects"
          value={s.totalProjects || 0}
          icon={Briefcase}
          sub={`${s.featuredProjects || 0} featured`}
        />
        <StatCard
          title="Services"
          value={s.totalServices || 0}
          icon={BriefcaseBusiness}
          sub={`${s.popularServices || 0} popular`}
        />
        <StatCard
          title="Team"
          value={s.totalTeamMembers || s.teamMembers || 0}
          icon={Users}
          sub={`${s.activeTeamMembers || 0} active`}
        />
      </div>

      {/* ── CONTENT GRID ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

        {/* Recent Messages */}
        <Card className="border-border">
          <CardHeader className="pb-1 px-4 pt-3.5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[13px] font-bold flex items-center gap-2 text-foreground">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                Recent Inbox
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2 text-muted-foreground hover:text-primary">
                View All <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            {dashboardData?.recentMessages?.length > 0 ? (
              <div>
                {dashboardData.recentMessages.slice(0, 5).map((msg, i) => (
                  <div key={msg._id}>
                    <div className="flex items-center justify-between px-2 py-2 hover:bg-accent rounded-lg transition-colors group cursor-pointer">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all ${
                          msg.status === "Responded"
                            ? "bg-muted text-muted-foreground"
                            : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                        }`}>
                          {msg.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground text-xs truncate leading-none">{msg.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{msg.email}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className={`text-[8px] px-1.5 py-0 h-4 border-0 shrink-0 font-bold uppercase tracking-wider ${
                        msg.status === "Responded" ? "bg-primary/5 text-primary/50" : "bg-primary/10 text-primary"
                      }`}>
                        {msg.status === "Pending" || msg.status === "New" ? "New" : "Replied"}
                      </Badge>
                    </div>
                    {i < dashboardData.recentMessages.slice(0, 5).length - 1 && (
                      <Separator className="mx-2 opacity-40" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex flex-col items-center justify-center text-muted-foreground">
                <MessageSquare className="w-6 h-6 mb-2 opacity-30" />
                <p className="text-[11px]">No recent messages</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card className="border-border">
          <CardHeader className="pb-1 px-4 pt-3.5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[13px] font-bold flex items-center gap-2 text-foreground">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                Latest Projects
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2 text-muted-foreground hover:text-primary">
                View All <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            {dashboardData?.recentProjects?.length > 0 ? (
              <div>
                {dashboardData.recentProjects.slice(0, 5).map((project, i) => (
                  <div key={project._id}>
                    <div className="flex items-center justify-between px-2 py-2 hover:bg-accent rounded-lg transition-colors cursor-pointer group">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground text-xs truncate flex items-center gap-1.5 leading-none">
                          {project.title}
                          <ArrowUpRight className="w-3 h-3 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" />
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{project.category}</p>
                      </div>
                      {project.tag && (
                        <Badge variant="secondary" className="text-[8px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-0 shrink-0 font-bold">
                          {project.tag}
                        </Badge>
                      )}
                    </div>
                    {i < dashboardData.recentProjects.slice(0, 5).length - 1 && (
                      <Separator className="mx-2 opacity-40" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex flex-col items-center justify-center text-muted-foreground">
                <Briefcase className="w-6 h-6 mb-2 opacity-30" />
                <p className="text-[11px]">No projects yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── CHART ─────────────────────────────────────── */}
      {dashboardData?.chartData && dashboardData.chartData.length > 0 && (
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <h2 className="text-[13px] font-bold text-foreground flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <BarChart3 className="w-3.5 h-3.5" />
                  </div>
                  Traffic Overview
                </h2>
                <p className="text-muted-foreground text-[10px] mt-0.5 ml-8">Last 7 days</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded bg-primary" />
                <span className="text-[10px] text-muted-foreground font-medium">Messages</span>
              </div>
            </div>

            <div className="flex w-full">
              <div className="flex flex-col items-end mr-2">
                <div className="flex flex-col justify-between h-28">
                  {getNiceTicks(Math.max(...dashboardData.chartData.map((d) => d.count), 1), 4)
                    .slice().reverse().map((tick, i) => (
                      <div key={i} className="flex items-center h-7">
                        <span className="text-[10px] text-muted-foreground w-5 text-right font-medium">{tick}</span>
                      </div>
                    ))}
                </div>
              </div>
              <div className="relative flex-1 flex items-end h-28">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {getNiceTicks(Math.max(...dashboardData.chartData.map((d) => d.count), 1), 4)
                    .slice(1).reverse().map((_, i) => (
                      <div key={i} className="border-t border-border/50 w-full" />
                    ))}
                </div>
                <div className="flex flex-1 items-end w-full h-full gap-2 z-10">
                  {dashboardData.chartData.map((day) => {
                    const maxVal = Math.max(...dashboardData.chartData.map((d) => d.count), 1)
                    const heightPct = (day.count / maxVal) * 100
                    return (
                      <div key={day._id} className="flex-1 flex flex-col items-center group min-w-[26px]">
                        <span className="mb-0.5 text-[9px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          {day.count}
                        </span>
                        <div className="relative w-full flex justify-center items-end h-[72px]">
                          <div
                            className="w-5 rounded-t-md transition-all duration-500 bg-primary/70 hover:bg-primary cursor-pointer group-hover:shadow-md group-hover:shadow-primary/20"
                            style={{ height: `${Math.max(heightPct, 5)}%`, minHeight: 3 }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1.5 font-medium">
                          {new Date(day._id).toLocaleDateString("en", { weekday: "narrow" })}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}