"use client"

import { useEffect, useState } from "react"
import {
  User, Mail, Lock, Save, AlertCircle, CheckCircle,
  Eye, EyeOff, Settings as SettingsIcon, Shield, Calendar,
  Hash, Loader2, X, KeyRound, AtSign, UserCircle, ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAppContext } from "../app/AppContext"

export default function Settings() {
  const { fetchProfile, updateProfile, changeEmail, changePassword } = useAppContext()

  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  const [profileData, setProfileData] = useState({
    id: "", name: "", email: "", role: "",
    lastPasswordChange: null, lastEmailChange: null, updatedAt: ""
  })

  const [editName, setEditName] = useState("")
  const [emailData, setEmailData] = useState({ newEmail: "", password: "" })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "", newPassword: "", confirmPassword: ""
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false, new: false, confirm: false, emailPassword: false
  })

  useEffect(() => { loadProfile() }, [])

  const loadProfile = async () => {
    try {
      const data = await fetchProfile()
      setProfileData(data)
      setEditName(data.name)
    } catch (err) {
      console.error(err)
      showMsg("error", "Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const showMsg = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: "", text: "" }), 5000)
  }

  const handleUpdateProfile = async () => {
    if (!editName.trim()) { showMsg("error", "Name cannot be empty"); return }
    setSaving(true)
    try {
      const res = await updateProfile({ name: editName })
      setProfileData(prev => ({ ...prev, name: res.admin.name }))
      showMsg("success", "Profile updated successfully!")
    } catch (err) {
      showMsg("error", err.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleChangeEmail = async (e) => {
    e.preventDefault()
    if (!emailData.newEmail || !emailData.password) { showMsg("error", "Please fill all fields"); return }
    setSaving(true)
    try {
      const res = await changeEmail(emailData)
      setProfileData(prev => ({
        ...prev,
        email: res.admin.email,
        lastEmailChange: new Date().toISOString()
      }))
      setEmailData({ newEmail: "", password: "" })
      showMsg("success", "Email changed successfully!")
    } catch (err) {
      showMsg("error", err.message || "Failed to change email")
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMsg("error", "Passwords do not match"); return
    }
    if (passwordData.newPassword.length < 6) {
      showMsg("error", "Password must be at least 6 characters"); return
    }
    setSaving(true)
    try {
      await changePassword(passwordData)
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setProfileData(prev => ({ ...prev, lastPasswordChange: new Date().toISOString() }))
      showMsg("success", "Password changed successfully!")
    } catch (err) {
      showMsg("error", err.message || "Failed to change password")
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (d) => {
    if (!d) return "Never"
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    })
  }

  const getPasswordStrength = (p) => {
    if (!p) return { strength: 0, label: "", color: "" }
    let s = 0
    if (p.length >= 6) s++
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    if (s <= 2) return { strength: s, label: "Weak", color: "bg-destructive" }
    if (s <= 3) return { strength: s, label: "Fair", color: "bg-amber-500" }
    if (s <= 4) return { strength: s, label: "Good", color: "bg-blue-500 dark:bg-blue-400" }
    return { strength: s, label: "Strong", color: "bg-emerald-500" }
  }

  const passwordStrength = getPasswordStrength(passwordData.newPassword)
  const togglePw = (key) => setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }))

  if (loading) return <SettingsSkeleton />

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "email", label: "Email", icon: Mail },
    { id: "password", label: "Password", icon: Lock }
  ]

  return (
    <div className="max-w-5xl mx-auto">

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-0.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground">Settings</h1>
          </div>
          <p className="text-muted-foreground text-xs ml-0 sm:ml-11">Manage your account settings</p>
        </div>
      </div>

      {message.text && (
        <div className={`mb-4 p-3 rounded-lg flex items-center justify-between gap-2 text-xs font-medium animate-in slide-in-from-top duration-300 ${
          message.type === "success"
            ? "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/20"
            : "bg-destructive/10 text-destructive border border-destructive/20"
        }`}>
          <div className="flex items-center gap-2">
            {message.type === "success"
              ? <CheckCircle className="w-3.5 h-3.5 shrink-0" />
              : <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            }
            {message.text}
          </div>
          <button
            onClick={() => setMessage({ type: "", text: "" })}
            className="p-0.5 hover:bg-foreground/5 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4">

        <div className="lg:w-56 shrink-0">
          <div className="flex lg:hidden gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "bg-card text-muted-foreground hover:bg-accent border border-border"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="hidden lg:block sticky top-6 space-y-3">
            <Card className="border-border">
              <CardContent className="p-2">
                {tabs.map((tab, i) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-xs font-medium ${
                      i !== tabs.length - 1 ? "mb-0.5" : ""
                    } ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                    <ChevronRight className={`w-3.5 h-3.5 ml-auto ${
                      activeTab === tab.id ? "text-primary-foreground/60" : "text-muted-foreground/40"
                    }`} />
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="p-1 rounded bg-emerald-100 dark:bg-emerald-500/15">
                    <Shield className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-[11px] font-bold text-foreground">Security</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">Password</span>
                    <Badge variant="secondary" className={`text-[8px] px-1.5 py-0 h-4 border-0 ${
                      profileData.lastPasswordChange
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
                    }`}>
                      {profileData.lastPasswordChange ? "Updated" : "Default"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">Account</span>
                    <Badge variant="secondary" className="text-[8px] px-1.5 py-0 h-4 border-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                      Secure
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">Role</span>
                    <Badge variant="secondary" className="text-[8px] px-1.5 py-0 h-4 border-0 bg-primary/10 text-primary uppercase">
                      {profileData.role}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex-1 min-h-[500px]">

          {activeTab === "profile" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">

              <div className="rounded-xl border border-border overflow-hidden bg-card">
                <div className="bg-gradient-to-r from-primary to-primary/80 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-foreground/20 rounded-lg flex items-center justify-center text-sm font-bold text-primary-foreground border border-primary-foreground/20">
                      {profileData.name?.substring(0, 2).toUpperCase() || "AD"}
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-primary-foreground leading-none">
                        {profileData.name}
                      </h2>
                      <p className="text-primary-foreground/70 text-[10px] mt-0.5">{profileData.email}</p>
                      <Badge className="mt-1 text-[7px] px-1 py-0 h-3.5 bg-primary-foreground/20 text-primary-foreground border-0 gap-0.5">
                        <Shield className="w-2 h-2" /> {profileData.role?.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="p-3">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Account Info
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <InfoCard icon={Hash} label="Admin ID" value={profileData.id} mono />
                    <InfoCard icon={AtSign} label="Email" value={profileData.email} />
                    <InfoCard icon={Calendar} label="Last Update" value={formatDate(profileData.updatedAt)} />
                    <InfoCard
                      icon={KeyRound}
                      label="Password Changed"
                      value={formatDate(profileData.lastPasswordChange)}
                      highlight={!profileData.lastPasswordChange}
                    />
                  </div>
                </div>
              </div>

              <Card className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                      <UserCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-foreground">Edit Profile</h3>
                      <p className="text-[10px] text-muted-foreground">Update your display name</p>
                    </div>
                  </div>
                  <div className="space-y-3 max-w-sm">
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-1.5">Full Name</label>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Enter your name"
                        className="h-9 text-xs rounded-lg"
                      />
                    </div>
                    <Button
                      onClick={handleUpdateProfile}
                      disabled={saving || editName === profileData.name || !editName.trim()}
                      size="sm"
                      className="h-8 px-4 text-xs rounded-lg"
                    >
                      {saving
                        ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving...</>
                        : <><Save className="w-3.5 h-3.5 mr-1.5" /> Save Changes</>
                      }
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "email" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <Card className="border-border overflow-hidden">
                <CardHeader className="pb-0 px-4 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-foreground">Change Email</CardTitle>
                      <p className="text-[10px] text-muted-foreground">Update your email address</p>
                    </div>
                  </div>
                </CardHeader>

                <div className="px-4 py-3 bg-muted/30 border-y border-border mt-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-card rounded-lg border border-border flex items-center justify-center">
                      <AtSign className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                        Current Email
                      </p>
                      <p className="text-xs font-semibold text-foreground">{profileData.email}</p>
                    </div>
                    {profileData.lastEmailChange && (
                      <div className="ml-auto hidden sm:block text-right">
                        <p className="text-[9px] text-muted-foreground">Last changed</p>
                        <p className="text-[10px] font-medium text-foreground">
                          {formatDate(profileData.lastEmailChange)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <form onSubmit={handleChangeEmail}>
                  <CardContent className="p-4">
                    <div className="space-y-3 max-w-sm">
                      <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-1.5">
                          New Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="email"
                            value={emailData.newEmail}
                            onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
                            placeholder="newemail@example.com"
                            required
                            className="h-9 pl-9 text-xs rounded-lg"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-1.5">
                          Confirm with Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type={showPasswords.emailPassword ? "text" : "password"}
                            value={emailData.password}
                            onChange={(e) => setEmailData({ ...emailData, password: e.target.value })}
                            placeholder="Enter your password"
                            required
                            className="h-9 pl-9 pr-9 text-xs rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => togglePw("emailPassword")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPasswords.emailPassword
                              ? <EyeOff className="w-3.5 h-3.5" />
                              : <Eye className="w-3.5 h-3.5" />
                            }
                          </button>
                        </div>
                      </div>

                      <div className="p-2.5 bg-primary/5 rounded-lg border border-primary/10">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <p className="text-[10px] text-primary/80">
                            You may need to verify your new email address after changing it.
                          </p>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={saving || !emailData.newEmail || !emailData.password}
                        size="sm"
                        className="h-8 px-4 text-xs rounded-lg"
                      >
                        {saving
                          ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Updating...</>
                          : <><Mail className="w-3.5 h-3.5 mr-1.5" /> Update Email</>
                        }
                      </Button>
                    </div>
                  </CardContent>
                </form>
              </Card>
            </div>
          )}

          {activeTab === "password" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <Card className="border-border overflow-hidden">
                <CardHeader className="pb-0 px-4 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-foreground">Change Password</CardTitle>
                      <p className="text-[10px] text-muted-foreground">Keep your account secure</p>
                    </div>
                  </div>
                </CardHeader>

                <div className="px-4 py-3 bg-amber-50/50 dark:bg-amber-500/5 border-y border-amber-200/50 dark:border-amber-500/10 mt-3">
                  <div className="flex items-start gap-2">
                    <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-amber-800 dark:text-amber-400 mb-1">Requirements</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                        {[
                          { test: passwordData.newPassword.length >= 6, label: "6+ characters" },
                          { test: /[A-Z]/.test(passwordData.newPassword), label: "Uppercase letter" },
                          { test: /[0-9]/.test(passwordData.newPassword), label: "One number" },
                          { test: /[^A-Za-z0-9]/.test(passwordData.newPassword), label: "Special char" }
                        ].map((req, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <CheckCircle className={`w-2.5 h-2.5 ${
                              req.test ? "text-emerald-500" : "text-amber-400 dark:text-amber-500/50"
                            }`} />
                            <span className="text-[9px] text-amber-700 dark:text-amber-400/80">{req.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleChangePassword}>
                  <CardContent className="p-4">
                    <div className="space-y-3 max-w-sm">
                      <PasswordField
                        label="Current Password"
                        value={passwordData.currentPassword}
                        onChange={(v) => setPasswordData({ ...passwordData, currentPassword: v })}
                        show={showPasswords.current}
                        toggle={() => togglePw("current")}
                        placeholder="Enter current password"
                        icon={Lock}
                      />

                      <div>
                        <PasswordField
                          label="New Password"
                          value={passwordData.newPassword}
                          onChange={(v) => setPasswordData({ ...passwordData, newPassword: v })}
                          show={showPasswords.new}
                          toggle={() => togglePw("new")}
                          placeholder="Enter new password"
                          icon={KeyRound}
                        />
                        {passwordData.newPassword && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[9px] text-muted-foreground">Strength</span>
                              <span className={`text-[9px] font-bold ${
                                passwordStrength.label === "Weak" ? "text-destructive"
                                : passwordStrength.label === "Fair" ? "text-amber-500"
                                : passwordStrength.label === "Good" ? "text-blue-500 dark:text-blue-400"
                                : "text-emerald-500"
                              }`}>
                                {passwordStrength.label}
                              </span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <div key={s} className={`flex-1 rounded-full transition-all duration-300 ${
                                  s <= passwordStrength.strength ? passwordStrength.color : "bg-muted"
                                }`} />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <PasswordField
                          label="Confirm Password"
                          value={passwordData.confirmPassword}
                          onChange={(v) => setPasswordData({ ...passwordData, confirmPassword: v })}
                          show={showPasswords.confirm}
                          toggle={() => togglePw("confirm")}
                          placeholder="Confirm new password"
                          icon={KeyRound}
                          error={
                            passwordData.confirmPassword &&
                            passwordData.newPassword !== passwordData.confirmPassword
                          }
                          success={
                            passwordData.confirmPassword &&
                            passwordData.newPassword === passwordData.confirmPassword
                          }
                        />
                        {passwordData.confirmPassword && (
                          <div className="mt-1.5 flex items-center gap-1">
                            {passwordData.newPassword === passwordData.confirmPassword ? (
                              <>
                                <CheckCircle className="w-3 h-3 text-emerald-500" />
                                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">Match</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3 h-3 text-destructive" />
                                <span className="text-[9px] text-destructive font-medium">No match</span>
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
                        size="sm"
                        className="h-8 px-4 text-xs rounded-lg"
                      >
                        {saving
                          ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Updating...</>
                          : <><Lock className="w-3.5 h-3.5 mr-1.5" /> Update Password</>
                        }
                      </Button>
                    </div>
                  </CardContent>
                </form>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoCard({ icon: Icon, label, value, mono = false, highlight = false }) {
  return (
    <div className={`p-3 rounded-lg border transition-all ${
      highlight
        ? "bg-amber-50 border-amber-200 dark:bg-amber-500/5 dark:border-amber-500/15"
        : "bg-muted/30 border-border hover:border-primary/20"
    }`}>
      <div className="flex items-center gap-2.5">
        <div className={`p-1.5 rounded-md shrink-0 ${
          highlight ? "bg-amber-100 dark:bg-amber-500/15" : "bg-card border border-border"
        }`}>
          <Icon className={`w-3 h-3 ${highlight ? "text-amber-500" : "text-muted-foreground"}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">{label}</p>
          <p className={`font-semibold text-foreground truncate ${
            mono ? "font-mono text-[10px]" : "text-[11px]"
          }`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

function PasswordField({ label, value, onChange, show, toggle, placeholder, icon: Icon, error, success }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-foreground mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          className={`h-9 pl-9 pr-9 text-xs rounded-lg ${
            error ? "border-destructive focus-visible:ring-destructive"
            : success ? "border-emerald-400 dark:border-emerald-500 focus-visible:ring-emerald-400"
            : ""
          }`}
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  )
}

function SettingsSkeleton() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-5">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-9 h-9 bg-muted rounded-lg animate-pulse" />
          <div className="h-5 w-20 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-3 w-40 bg-muted/60 rounded animate-pulse ml-11" />
      </div>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-56 shrink-0">
          <Card className="border-border">
            <CardContent className="p-2 space-y-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-muted rounded-lg animate-pulse" />
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="flex-1 space-y-4">
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <div className="h-16 bg-muted animate-pulse" />
            <div className="p-3 space-y-2 animate-pulse">
              <div className="h-3 w-20 bg-muted rounded mb-2" />
              <div className="grid grid-cols-2 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted/60 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
          <Card className="border-border">
            <CardContent className="p-4 space-y-3 animate-pulse">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-9 w-full max-w-sm bg-muted rounded-lg" />
              <div className="h-8 w-28 bg-muted rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}