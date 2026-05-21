"use client"

import AdminShell from "../mainComponents/SideBar/AdminSiderbar"
import Dashboard from "../mainComponents/dashboard"

export default function AdminDashboard() {
  return (
    <AdminShell>
      <Dashboard />
    </AdminShell>
  )
}