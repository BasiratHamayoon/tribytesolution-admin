"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"

const AppContext = createContext()

export function AppProvider({ children }) {
  const router = useRouter()
  const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

  const [token, setToken] = useState(null)
  const [admin, setAdmin] = useState(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [theme, setTheme] = useState("light")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Keep a ref so authHeaders always has the latest token
  // even before re-render completes
  const tokenRef = useRef(null)

  // ─── Load auth from localStorage (runs once on mount) ───
  useEffect(() => {
    const savedToken = localStorage.getItem("token")
    const savedAdmin = localStorage.getItem("admin")

    if (savedToken) {
      setToken(savedToken)
      tokenRef.current = savedToken
    }
    if (savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin))
      } catch {
        setAdmin(null)
      }
    }

    setIsCheckingAuth(false)
  }, [])

  // ─── Load theme ───
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light"
    setTheme(savedTheme)
    document.documentElement.classList.toggle("dark", savedTheme === "dark")
  }, [])

  // ─── Load sidebar state ───
  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed")
    if (saved !== null) setSidebarCollapsed(JSON.parse(saved))
  }, [])

  // ─── Keep tokenRef in sync when token state changes ───
  useEffect(() => {
    tokenRef.current = token
  }, [token])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    localStorage.setItem("sidebarCollapsed", JSON.stringify(newState))
  }

  // ─── Always reads from ref so it's never stale ───
  const getToken = useCallback(() => {
    // ref is always up to date, even before state re-render
    return tokenRef.current || localStorage.getItem("token")
  }, [])

  const authHeaders = useCallback(() => ({
    Authorization: `Bearer ${getToken()}`,
  }), [getToken])

  // ─── Auth ───
  const login = async (email, password) => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || "Login failed")

    tokenRef.current = data.token
    setToken(data.token)
    setAdmin(data.admin)
    localStorage.setItem("token", data.token)
    localStorage.setItem("admin", JSON.stringify(data.admin))
    router.push("/")
  }

  const logout = () => {
    tokenRef.current = null
    setToken(null)
    setAdmin(null)
    localStorage.removeItem("token")
    localStorage.removeItem("admin")
    router.push("/pages/Login")
  }

  // ─── Dashboard ───
  const fetchDashboardData = async () => {
    const res = await fetch(`${API}/api/dashboard/stats`, {
      headers: authHeaders(),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  }

  // ─── Messages ───
  const fetchMessages = async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    const res = await fetch(`${API}/api/contact?${query}`, {
      headers: authHeaders(),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  }

  const replyToMessage = async (id, replyMessage) => {
    const res = await fetch(`${API}/api/contact/${id}/reply`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ replyMessage }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  }

  // ─── Projects ───
  const fetchProjects = async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    const res = await fetch(`${API}/api/projects?${query}`, {
      headers: authHeaders(),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  }

  const addProject = async (formData) => {
    const res = await fetch(`${API}/api/projects`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  }

  const updateProject = async (id, formData) => {
    const res = await fetch(`${API}/api/projects/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  }

  const deleteProject = async (id) => {
    const res = await fetch(`${API}/api/projects/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  }

  // ─── Services ───
  const fetchServices = async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    const res = await fetch(`${API}/api/services?${query}`, {
      headers: authHeaders(),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  }

  const addService = async (formData) => {
    const res = await fetch(`${API}/api/services`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  }

  const updateService = async (id, formData) => {
    const res = await fetch(`${API}/api/services/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  }

  const deleteService = async (id) => {
    const res = await fetch(`${API}/api/services/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  }

  // ─── Jobs ───
  const fetchJobs = async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    const res = await fetch(`${API}/api/jobs/admin/all?${query}`, {
      headers: authHeaders(),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  }

  const addJob = async (jobData) => {
    const res = await fetch(`${API}/api/jobs`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(jobData),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  }

  const updateJob = async (id, jobData) => {
    const res = await fetch(`${API}/api/jobs/${id}`, {
      method: "PUT",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(jobData),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  }

  const deleteJob = async (id) => {
    const res = await fetch(`${API}/api/jobs/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  }

  const fetchApplicants = async (jobId, params = {}) => {
    const query = new URLSearchParams(params).toString()
    const res = await fetch(`${API}/api/jobs/${jobId}/applicants?${query}`, {
      headers: authHeaders(),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  }

  const updateApplicantStatus = async (jobId, applicantId, status) => {
    const res = await fetch(`${API}/api/jobs/${jobId}/applicants/${applicantId}/status`, {
      method: "PUT",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  }

  // ─── Team ───
  const fetchTeam = async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    const res = await fetch(`${API}/api/team?${query}`, {
      headers: authHeaders(),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  }

  const addTeamMember = async (formData) => {
    const res = await fetch(`${API}/api/team`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  }

  const updateTeamMember = async (id, formData) => {
    const res = await fetch(`${API}/api/team/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  }

  const deleteTeamMember = async (id) => {
    const res = await fetch(`${API}/api/team/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  }

  // ─── Settings ───
  const fetchProfile = async () => {
    const res = await fetch(`${API}/api/settings/profile`, {
      headers: authHeaders(),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  }

  const updateProfile = async (profileData) => {
    const res = await fetch(`${API}/api/settings/profile`, {
      method: "PUT",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(profileData),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    if (data.admin) {
      setAdmin(data.admin)
      localStorage.setItem("admin", JSON.stringify(data.admin))
    }
    return data
  }

  const changeEmail = async (emailData) => {
    const res = await fetch(`${API}/api/settings/change-email`, {
      method: "PUT",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(emailData),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    if (data.admin) {
      setAdmin(data.admin)
      localStorage.setItem("admin", JSON.stringify(data.admin))
    }
    return data
  }

  const changePassword = async (passwordData) => {
    const res = await fetch(`${API}/api/settings/change-password`, {
      method: "PUT",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(passwordData),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  }

  return (
    <AppContext.Provider
      value={{
        token,
        admin,
        isCheckingAuth,
        login,
        logout,
        theme,
        toggleTheme,
        sidebarCollapsed,
        toggleSidebar,
        fetchDashboardData,
        fetchMessages,
        replyToMessage,
        fetchProjects,
        addProject,
        updateProject,
        deleteProject,
        fetchServices,
        addService,
        updateService,
        deleteService,
        fetchJobs,
        addJob,
        updateJob,
        deleteJob,
        fetchApplicants,
        updateApplicantStatus,
        fetchTeam,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
        fetchProfile,
        updateProfile,
        changeEmail,
        changePassword,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) throw new Error("useAppContext must be used within AppProvider")
  return context
}