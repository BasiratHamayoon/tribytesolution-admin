"use client"

import { useEffect, useState } from "react"
import {
  User,
  Mail,
  Lock,
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Settings as SettingsIcon,
  Shield,
  Calendar,
  Hash,
  Loader2,
  ChevronRight,
  X,
  KeyRound,
  AtSign,
  UserCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAppContext } from "../app/AppContext"
import SettingsSkeleton from "./Loaders/SettingsSkeleton"


export default function Settings() {
  const {
    fetchProfile,
    updateProfile,
    changeEmail,
    changePassword
  } = useAppContext()

  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  const [profileData, setProfileData] = useState({
    id: "",
    name: "",
    email: "",
    role: "",
    lastPasswordChange: null,
    lastEmailChange: null,
    updatedAt: ""
  })

  const [editName, setEditName] = useState("")

  const [emailData, setEmailData] = useState({
    newEmail: "",
    password: ""
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
    emailPassword: false
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const data = await fetchProfile()
      setProfileData(data)
      setEditName(data.name)
    } catch (err) {
      console.error(err)
      showMessage("error", "Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: "", text: "" }), 5000)
  }

  const handleUpdateProfile = async () => {
    if (!editName.trim()) {
      showMessage("error", "Name cannot be empty")
      return
    }

    setSaving(true)
    try {
      const res = await updateProfile({ name: editName })
      setProfileData(prev => ({ ...prev, name: res.admin.name }))
      showMessage("success", "Profile updated successfully!")
    } catch (err) {
      showMessage("error", err.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleChangeEmail = async (e) => {
    e.preventDefault()

    if (!emailData.newEmail || !emailData.password) {
      showMessage("error", "Please fill all fields")
      return
    }

    setSaving(true)
    try {
      const res = await changeEmail(emailData)
      setProfileData(prev => ({
        ...prev,
        email: res.admin.email,
        lastEmailChange: new Date().toISOString()
      }))
      setEmailData({ newEmail: "", password: "" })
      showMessage("success", "Email changed successfully!")
    } catch (err) {
      showMessage("error", err.message || "Failed to change email")
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage("error", "Passwords do not match")
      return
    }

    if (passwordData.newPassword.length < 6) {
      showMessage("error", "Password must be at least 6 characters")
      return
    }

    setSaving(true)
    try {
      await changePassword(passwordData)
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
      setProfileData(prev => ({ ...prev, lastPasswordChange: new Date().toISOString() }))
      showMessage("success", "Password changed successfully!")
    } catch (err) {
      showMessage("error", err.message || "Failed to change password")
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Password strength calculator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" }
    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++

    if (strength <= 2) return { strength, label: "Weak", color: "bg-red-500" }
    if (strength <= 3) return { strength, label: "Fair", color: "bg-amber-500" }
    if (strength <= 4) return { strength, label: "Good", color: "bg-blue-500" }
    return { strength, label: "Strong", color: "bg-emerald-500" }
  }

  const passwordStrength = getPasswordStrength(passwordData.newPassword)
if (loading) {
  return <SettingsSkeleton />
}

  const tabs = [
    { id: "profile", label: "Profile", icon: User, description: "Manage your account" },
    { id: "email", label: "Email", icon: Mail, description: "Change email address" },
    { id: "password", label: "Password", icon: Lock, description: "Update password" }
  ]

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-0">

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2.5 bg-slate-950 rounded-xl shadow-lg shadow-slate-950/20">
            <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-950">Settings</h1>
        </div>
        <p className="text-slate-500 text-sm sm:text-base ml-0 sm:ml-14">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Message Alert - Fixed at top */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center justify-between gap-3 animate-in slide-in-from-top duration-300 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-3">
            {message.type === "success" ? (
              <div className="p-1.5 bg-emerald-100 rounded-lg">
                <CheckCircle className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-1.5 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5" />
              </div>
            )}
            <span className="font-medium">{message.text}</span>
          </div>
          <button
            onClick={() => setMessage({ type: "", text: "" })}
            className="p-1 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 relative">

        {/* Tabs - Horizontal on Mobile, STICKY Sidebar on Desktop */}
        <div className="lg:w-72 shrink-0">
          {/* Mobile Tabs - Scrollable horizontal */}
          <div className="flex lg:hidden gap-2 overflow-x-auto pb-2 scrollbar-hide sticky top-0 z-10 bg-slate-50 -mx-2 px-2 py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-slate-950 text-white shadow-lg shadow-slate-950/30"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-blue-400" : ""}`} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Desktop Sidebar - STICKY */}
          <div className="hidden lg:block sticky top-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                    index !== tabs.length - 1 ? "mb-2" : ""
                  } ${
                    activeTab === tab.id
                      ? "bg-slate-950 shadow-lg shadow-slate-950/20"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-blue-400/20"
                        : "bg-slate-100"
                    }`}>
                      <tab.icon className={`w-5 h-5 ${
                        activeTab === tab.id ? "text-blue-400" : "text-slate-500"
                      }`} />
                    </div>
                    <div className="text-left">
                      <p className={`font-semibold text-sm ${
                        activeTab === tab.id ? "text-white" : "text-slate-900"
                      }`}>
                        {tab.label}
                      </p>
                      <p className={`text-xs ${
                        activeTab === tab.id ? "text-slate-400" : "text-slate-400"
                      }`}>
                        {tab.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${
                    activeTab === tab.id ? "text-blue-400" : "text-slate-300"
                  }`} />
                </button>
              ))}
            </div>

            {/* Security Info Card - Also Sticky */}
            <div className="mt-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-emerald-100 rounded-lg">
                  <Shield className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-sm font-semibold text-slate-700">Security Status</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Password</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    profileData.lastPasswordChange
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {profileData.lastPasswordChange ? "Updated" : "Default"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Account</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    Secure
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Role</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 uppercase">
                    {profileData.role}
                  </span>
                </div>
              </div>
            </div>

            
          </div>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 min-h-[600px] pb-10">

          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
              {/* Profile Header Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-slate-950 to-slate-800 p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-400/20 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-bold text-blue-400 border-2 border-blue-400/30">
                      {profileData.name?.substring(0, 2).toUpperCase() || "AD"}
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white">{profileData.name}</h2>
                      <p className="text-slate-400 text-sm">{profileData.email}</p>
                      <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-blue-400/20 text-blue-400 text-xs font-semibold rounded-full">
                        <Shield className="w-3 h-3" />
                        {profileData.role?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profile Info Grid */}
                <div className="p-6 sm:p-8">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    Account Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoCard
                      icon={Hash}
                      label="Admin ID"
                      value={profileData.id}
                      mono
                    />
                    <InfoCard
                      icon={AtSign}
                      label="Email Address"
                      value={profileData.email}
                    />
                    <InfoCard
                      icon={Calendar}
                      label="Last Profile Update"
                      value={formatDate(profileData.updatedAt)}
                    />
                    <InfoCard
                      icon={KeyRound}
                      label="Last Password Change"
                      value={formatDate(profileData.lastPasswordChange)}
                      highlight={!profileData.lastPasswordChange}
                    />
                  </div>
                </div>
              </div>

              {/* Edit Name Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-400/10 rounded-xl">
                    <UserCircle className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-950">Edit Profile</h3>
                    <p className="text-xs text-slate-400">Update your display name</p>
                  </div>
                </div>

                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Full Name
                    </label>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Enter your name"
                      className="h-12 rounded-xl border-slate-200 focus-visible:ring-blue-400"
                    />
                  </div>
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={saving || editName === profileData.name || !editName.trim()}
                    className="bg-slate-950 hover:bg-slate-800 text-white rounded-xl h-12 px-6 shadow-lg shadow-slate-950/20 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2 text-blue-400" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>

            </div>
          )}

          {/* CHANGE EMAIL TAB */}
          {activeTab === "email" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-6 sm:p-8 border-b border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-blue-400/10 rounded-xl">
                      <Mail className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-950">Change Email</h2>
                      <p className="text-sm text-slate-400">Update your email address</p>
                    </div>
                  </div>
                </div>

                {/* Current Email Display */}
                <div className="p-6 sm:p-8 bg-slate-50/50 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center">
                      <AtSign className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Current Email</p>
                      <p className="text-lg font-semibold text-slate-950">{profileData.email}</p>
                    </div>
                    {profileData.lastEmailChange && (
                      <div className="ml-auto hidden sm:block">
                        <p className="text-xs text-slate-400">Last changed</p>
                        <p className="text-xs font-medium text-slate-600">{formatDate(profileData.lastEmailChange)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleChangeEmail} className="p-6 sm:p-8">
                  <div className="space-y-5 max-w-md">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        New Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          type="email"
                          value={emailData.newEmail}
                          onChange={(e) =>
                            setEmailData({ ...emailData, newEmail: e.target.value })
                          }
                          placeholder="newemail@example.com"
                          required
                          className="h-12 pl-12 rounded-xl border-slate-200 focus-visible:ring-blue-400"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Confirm with Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          type={showPasswords.emailPassword ? "text" : "password"}
                          value={emailData.password}
                          onChange={(e) =>
                            setEmailData({ ...emailData, password: e.target.value })
                          }
                          placeholder="Enter your password"
                          required
                          className="h-12 pl-12 pr-12 rounded-xl border-slate-200 focus-visible:ring-blue-400"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              emailPassword: !showPasswords.emailPassword
                            })
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPasswords.emailPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Info Note */}
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-700">
                          <p className="font-medium mb-1">Note</p>
                          <p className="text-blue-600">You'll need to verify your new email address after changing it.</p>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={saving || !emailData.newEmail || !emailData.password}
                      className="bg-slate-950 hover:bg-slate-800 text-white rounded-xl h-12 px-6 shadow-lg shadow-slate-950/20 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2 text-blue-400" />
                          Update Email
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* CHANGE PASSWORD TAB */}
          {activeTab === "password" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-6 sm:p-8 border-b border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-amber-400/10 rounded-xl">
                      <KeyRound className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-950">Change Password</h2>
                      <p className="text-sm text-slate-400">Keep your account secure</p>
                    </div>
                  </div>
                </div>

                {/* Security Tips */}
                <div className="p-6 sm:p-8 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                      <Shield className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-800 mb-1">Password Requirements</p>
                      <ul className="text-xs text-amber-700 space-y-1">
                        <li className="flex items-center gap-2">
                          <CheckCircle className={`w-3 h-3 ${passwordData.newPassword.length >= 6 ? 'text-emerald-500' : 'text-amber-400'}`} />
                          At least 6 characters long
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className={`w-3 h-3 ${/[A-Z]/.test(passwordData.newPassword) ? 'text-emerald-500' : 'text-amber-400'}`} />
                          One uppercase letter
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className={`w-3 h-3 ${/[0-9]/.test(passwordData.newPassword) ? 'text-emerald-500' : 'text-amber-400'}`} />
                          One number
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className={`w-3 h-3 ${/[^A-Za-z0-9]/.test(passwordData.newPassword) ? 'text-emerald-500' : 'text-amber-400'}`} />
                          One special character (recommended)
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleChangePassword} className="p-6 sm:p-8">
                  <div className="space-y-5 max-w-md">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              currentPassword: e.target.value
                            })
                          }
                          placeholder="Enter current password"
                          required
                          className="h-12 pl-12 pr-12 rounded-xl border-slate-200 focus-visible:ring-blue-400"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              current: !showPasswords.current
                            })
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPasswords.current ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              newPassword: e.target.value
                            })
                          }
                          placeholder="Enter new password"
                          required
                          className="h-12 pl-12 pr-12 rounded-xl border-slate-200 focus-visible:ring-blue-400"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              new: !showPasswords.new
                            })
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPasswords.new ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      {/* Password Strength Indicator */}
                      {passwordData.newPassword && (
                        <div className="mt-3 animate-in fade-in duration-200">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-slate-500">Password Strength</span>
                            <span className={`text-xs font-semibold ${
                              passwordStrength.label === "Weak" ? "text-red-500" :
                              passwordStrength.label === "Fair" ? "text-amber-500" :
                              passwordStrength.label === "Good" ? "text-blue-500" :
                              "text-emerald-500"
                            }`}>
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                            {[1, 2, 3, 4, 5].map((segment) => (
                              <div
                                key={segment}
                                className={`flex-1 rounded-full transition-all duration-300 ${
                                  segment <= passwordStrength.strength
                                    ? passwordStrength.color
                                    : "bg-slate-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              confirmPassword: e.target.value
                            })
                          }
                          placeholder="Confirm new password"
                          required
                          className={`h-12 pl-12 pr-12 rounded-xl border-slate-200 focus-visible:ring-blue-400 ${
                            passwordData.confirmPassword &&
                            passwordData.newPassword !== passwordData.confirmPassword
                              ? "border-red-300 focus-visible:ring-red-400"
                              : passwordData.confirmPassword &&
                                passwordData.newPassword === passwordData.confirmPassword
                              ? "border-emerald-300 focus-visible:ring-emerald-400"
                              : ""
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              confirm: !showPasswords.confirm
                            })
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {/* Password Match Indicator */}
                      {passwordData.confirmPassword && (
                        <div className="mt-2 flex items-center gap-2 animate-in fade-in duration-200">
                          {passwordData.newPassword === passwordData.confirmPassword ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                              <span className="text-xs text-emerald-600 font-medium">Passwords match</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4 text-red-500" />
                              <span className="text-xs text-red-600 font-medium">Passwords do not match</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={
                        saving ||
                        !passwordData.currentPassword ||
                        !passwordData.newPassword ||
                        !passwordData.confirmPassword ||
                        passwordData.newPassword !== passwordData.confirmPassword ||
                        passwordData.newPassword.length < 6
                      }
                      className="w-full sm:w-auto bg-slate-950 hover:bg-slate-800 text-white rounded-xl h-12 px-8 shadow-lg shadow-slate-950/20 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2 text-blue-400" />
                          Update Password
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Info Card Sub-component
function InfoCard({ icon: Icon, label, value, mono = false, highlight = false }) {
  return (
    <div className={`p-4 rounded-xl border transition-all hover:shadow-sm ${
      highlight
        ? "bg-amber-50 border-amber-200"
        : "bg-slate-50 border-slate-100 hover:border-slate-200"
    }`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${highlight ? "bg-amber-100" : "bg-white shadow-sm"}`}>
          <Icon className={`w-4 h-4 ${highlight ? "text-amber-500" : "text-slate-400"}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
          <p className={`font-semibold text-slate-900 truncate ${mono ? "font-mono text-xs" : "text-sm"}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}