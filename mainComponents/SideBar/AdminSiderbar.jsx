"use client"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  LayoutDashboard,
  MessageSquare,
  Briefcase,
  LogOut,
  Settings as SettingsIcon,
  Menu,
  X,
  Loader2,
  Sun,
  Moon,
  Users,
  BriefcaseBusiness,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react"
import { useAppContext } from "../../app/AppContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function AdminShell({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const {
    token,
    admin,
    isCheckingAuth,
    logout,
    theme,
    toggleTheme,
    sidebarCollapsed,
    toggleSidebar,
  } = useAppContext()

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const isLoginPage = pathname === "/pages/Login"

  useEffect(() => {
    if (isCheckingAuth) return
    if (!token && !isLoginPage) router.replace("/pages/Login")
  }, [token, isCheckingAuth, isLoginPage, router])

  useEffect(() => {
    setIsMobileSidebarOpen(false)
  }, [pathname])

  if (isCheckingAuth) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    )
  }

  if (isLoginPage) return <>{children}</>

  if (!token) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    )
  }

  const adminInitials = admin?.name
    ? admin.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD"

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/pages/Contact", icon: MessageSquare, label: "Messages" },
    { href: "/pages/Projects", icon: Briefcase, label: "Projects" },
    { href: "/pages/Services", icon: BriefcaseBusiness, label: "Services" },
    { href: "/pages/Jobs", icon: Briefcase, label: "Jobs" },
    { href: "/pages/Team", icon: Users, label: "Team" },
    { href: "/pages/Settings", icon: SettingsIcon, label: "Settings" },
  ]

  return (
    <TooltipProvider delayDuration={0}>
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <header className="h-14 bg-card border-b border-border shrink-0 z-30 relative">
          <div className="h-full flex items-center justify-between px-3">
            <div className="flex items-center gap-2 z-10">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8 text-muted-foreground hover:text-primary hover:bg-accent"
                onClick={() => setIsMobileSidebarOpen(true)}
              >
                <Menu className="w-4 h-4" />
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden md:flex h-8 w-8 text-muted-foreground hover:text-primary hover:bg-accent"
                    onClick={toggleSidebar}
                  >
                    {sidebarCollapsed ? (
                      <PanelLeft className="w-4 h-4" />
                    ) : (
                      <PanelLeftClose className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[11px]">
                  {sidebarCollapsed ? "Expand" : "Collapse"}
                </TooltipContent>
              </Tooltip>
              <Separator orientation="vertical" className="h-5 hidden md:block" />
              <span className="hidden md:block text-xs text-muted-foreground font-medium">
                {navItems.find((item) => item.href === pathname)?.label || "Dashboard"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 z-10">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-accent"
                    onClick={toggleTheme}
                  >
                    {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[11px]">
                  {theme === "dark" ? "Light mode" : "Dark mode"}
                </TooltipContent>
              </Tooltip>
              <Separator orientation="vertical" className="h-5" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-accent transition-colors outline-none">
                    <Avatar className="h-7 w-7 border border-border">
                      <AvatarImage src={admin?.avatar} alt={admin?.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
                        {adminInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="text-xs font-semibold text-foreground leading-none">
                        {admin?.name || "Admin"}
                      </span>
                      <span className="text-[10px] text-muted-foreground leading-none mt-0.5 max-w-[120px] truncate">
                        {admin?.email || "admin@tribyte.com"}
                      </span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="pb-0">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
                          {adminInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{admin?.name || "Admin"}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{admin?.email}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-xs cursor-pointer"
                    onClick={() => router.push("/pages/Settings")}
                  >
                    <SettingsIcon className="w-3.5 h-3.5 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs cursor-pointer" onClick={toggleTheme}>
                    {theme === "dark" ? <Sun className="w-3.5 h-3.5 mr-2" /> : <Moon className="w-3.5 h-3.5 mr-2" />}
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-xs cursor-pointer text-destructive focus:text-destructive"
                    onClick={logout}
                  >
                    <LogOut className="w-3.5 h-3.5 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
          {isMobileSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}
          <aside
            className={`
              fixed inset-y-0 left-0 z-50
              bg-sidebar text-sidebar-foreground border-r border-sidebar-border
              transform transition-all duration-300 ease-in-out
              ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
              md:translate-x-0 md:static md:z-auto
              ${sidebarCollapsed ? "md:w-16" : "md:w-52"}
              w-64 shrink-0 flex flex-col
            `}
          >
            <div className="h-16 flex items-center justify-center shrink-0 relative px-3">
              <Link href="/" className="flex items-center justify-center group">
                <div
                  className={`relative transition-all duration-300 ${
                    sidebarCollapsed ? "w-10 h-10" : "w-11 h-11"
                  }`}
                >
                  <Image
                    src="/logo.png"
                    alt="Logo"
                    fill
                    className="object-contain drop-shadow-sm"
                    priority
                  />
                </div>
                {!sidebarCollapsed && (
                  <div className="ml-2.5 flex flex-col">
                    <span className="text-sm font-bold text-sidebar-foreground tracking-tight leading-none">
                      TribyteSolution
                    </span>
                    <span className="text-[10px] text-sidebar-foreground/40 font-medium leading-none mt-1">
                      Admin Panel
                    </span>
                  </div>
                )}
              </Link>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="md:hidden absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto scrollbar-hide">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return sidebarCollapsed ? (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={`
                          flex items-center justify-center h-10 w-full rounded-lg transition-all duration-200
                          ${isActive
                            ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                            : "text-sidebar-foreground/60 hover:text-sidebar-primary hover:bg-sidebar-accent"
                          }
                        `}
                      >
                        <item.icon className="w-[18px] h-[18px]" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-[11px] font-medium">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200
                      ${isActive
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                        : "text-sidebar-foreground/60 hover:text-sidebar-primary hover:bg-sidebar-accent"
                      }
                    `}
                  >
                    <item.icon className="w-[18px] h-[18px] shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
            <div className="p-2 border-t border-sidebar-border">
              {sidebarCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={logout}
                      className="flex items-center justify-center h-10 w-full rounded-lg text-sidebar-foreground/50 hover:text-destructive hover:bg-sidebar-accent transition-colors"
                    >
                      <LogOut className="w-[18px] h-[18px]" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-[11px]">Sign Out</TooltipContent>
                </Tooltip>
              ) : (
                <button
                  onClick={logout}
                  className="flex items-center gap-3 px-3 py-2.5 w-full text-[13px] font-medium text-sidebar-foreground/50 hover:text-destructive hover:bg-sidebar-accent rounded-lg transition-colors"
                >
                  <LogOut className="w-[18px] h-[18px]" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </aside>
          <main className="flex-1 overflow-y-auto bg-background">
            <div className="p-3 md:p-5 max-w-[1400px] mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}