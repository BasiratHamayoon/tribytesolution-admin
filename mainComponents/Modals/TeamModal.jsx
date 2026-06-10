"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  X, Loader2, Users, Type, Briefcase, FileText, Mail,
  Phone, Globe, Github, Linkedin, Twitter, Save, Plus,
  Upload, Image as ImageIcon, Trash2, Code, Hash, Star,
  Sparkles, ArrowLeft, ArrowRight, Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { getImageUrl } from "@/utils/getImageUrl"

function SkillField({ skills, inputValue, onInputChange, onAdd, onRemove, onKeyDown, isLoading }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground">
          <Code className="w-3.5 h-3.5 text-primary" /> Skills
        </label>
        {skills.length > 0 && (
          <span className="text-[9px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">
            {skills.length} added
          </span>
        )}
      </div>
      <div className="flex gap-2 mb-2">
        <Input
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="e.g., React, Node.js"
          className="h-8 text-xs rounded-lg bg-muted/20 border-border/50"
          disabled={isLoading}
        />
        <Button
          type="button"
          onClick={onAdd}
          disabled={!inputValue.trim() || isLoading}
          size="sm"
          className="h-8 px-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 p-2.5 bg-muted/20 rounded-lg border border-border/30">
          {skills.map((skill, i) => (
            <Badge key={`${skill}-${i}`} variant="secondary"
              className="gap-1.5 text-[10px] px-2.5 py-1 bg-primary/10 text-primary border-0 rounded-full font-bold hover:bg-primary/15 transition-colors duration-200">
              {skill}
              <button type="button" onClick={() => onRemove(skill)} disabled={isLoading} className="hover:text-primary/60 p-0 ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-3 bg-muted/10 rounded-lg border border-dashed border-border/30">
          <p className="text-[10px] text-muted-foreground/40 font-medium">No skills added yet</p>
        </div>
      )}
    </div>
  )
}

export default function TeamModal({
  isOpen, onClose, onSubmit, member = null, isLoading = false
}) {
  const isEditing = !!member
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    name: "", slug: "", role: "", department: "", bio: "",
    email: "", phone: "", skills: [], isActive: true, isFeatured: false,
    order: 0, joinedAt: "",
    socialLinks: { linkedin: "", github: "", twitter: "", website: "" }
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [skillInput, setSkillInput] = useState("")
  const [errors, setErrors] = useState({})
  const [isDragging, setIsDragging] = useState(false)
  const [activeSectionIndex, setActiveSectionIndex] = useState(0)

  const sections = [
    { id: "basic", label: "Basic", icon: Type },
    { id: "media", label: "Photo", icon: ImageIcon },
    { id: "details", label: "Details", icon: FileText },
    { id: "social", label: "Social", icon: Globe }
  ]

  const isLastSection = activeSectionIndex === sections.length - 1
  const isFirstSection = activeSectionIndex === 0

  useEffect(() => {
    if (isOpen && member) {
      setFormData({
        name: member.name || "", slug: member.slug || "",
        role: member.role || "", department: member.department || "",
        bio: member.bio || "", email: member.email || "", phone: member.phone || "",
        skills: member.skills || [], isActive: member.isActive !== undefined ? member.isActive : true,
        isFeatured: member.isFeatured || false, order: member.order || 0,
        joinedAt: member.joinedAt ? member.joinedAt.split("T")[0] : "",
        socialLinks: {
          linkedin: member.socialLinks?.linkedin || "",
          github: member.socialLinks?.github || "",
          twitter: member.socialLinks?.twitter || "",
          website: member.socialLinks?.website || ""
        }
      })
      const imgUrl = member.image ? getImageUrl(member.image) : null
      setImagePreview(imgUrl)
      setImageFile(null)
      setRemoveImage(false)
    } else if (isOpen) {
      setFormData({
        name: "", slug: "", role: "", department: "", bio: "",
        email: "", phone: "", skills: [], isActive: true, isFeatured: false,
        order: 0, joinedAt: "",
        socialLinks: { linkedin: "", github: "", twitter: "", website: "" }
      })
      setImagePreview(null)
      setImageFile(null)
      setRemoveImage(false)
    }
    setErrors({})
    setSkillInput("")
    setActiveSectionIndex(0)
  }, [isOpen, member])

  useEffect(() => {
    if (!isEditing && formData.name) {
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.name, isEditing])

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    if (name.startsWith("social_")) {
      const key = name.replace("social_", "")
      setFormData(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [key]: value } }))
    } else {
      setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
  }, [errors])

  const handleImageSelect = (file) => {
    if (!file) return
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if (!allowed.includes(file.type)) { setErrors(prev => ({ ...prev, image: "Invalid file type" })); return }
    if (file.size > 5 * 1024 * 1024) { setErrors(prev => ({ ...prev, image: "Max 5MB" })); return }
    setErrors(prev => ({ ...prev, image: null }))
    setImageFile(file)
    setRemoveImage(false)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleImageSelect(e.dataTransfer.files[0])
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setRemoveImage(true)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSkillInputChange = useCallback((value) => {
    setSkillInput(value)
  }, [])

  const handleAddSkill = useCallback(() => {
    const s = skillInput.trim()
    if (s && !formData.skills.includes(s)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, s] }))
      setSkillInput("")
    }
  }, [skillInput, formData.skills])

  const handleRemoveSkill = useCallback((s) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(x => x !== s) }))
  }, [])

  const handleSkillKeyDown = useCallback((e) => {
    if (e.key === "Enter") { e.preventDefault(); handleAddSkill() }
  }, [handleAddSkill])

  const canProceedFromBasic = !!(formData.name.trim() && formData.role.trim() && formData.department.trim())

  const validateCurrentSection = () => {
    const errs = {}
    if (activeSectionIndex === 0) {
      if (!formData.name.trim()) errs.name = "Required"
      if (!formData.role.trim()) errs.role = "Required"
      if (!formData.department.trim()) errs.department = "Required"
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validateAll = () => {
    const errs = {}
    if (!formData.name.trim()) errs.name = "Required"
    if (!formData.role.trim()) errs.role = "Required"
    if (!formData.department.trim()) errs.department = "Required"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (activeSectionIndex === 0 && !validateCurrentSection()) return
    if (!isLastSection) setActiveSectionIndex(prev => prev + 1)
  }

  const handleBack = () => {
    if (!isFirstSection) setActiveSectionIndex(prev => prev - 1)
  }

  const handleSectionClick = (index) => {
    if (index > 0 && activeSectionIndex === 0 && !validateCurrentSection()) return
    setActiveSectionIndex(index)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateAll()) {
      setActiveSectionIndex(0)
      return
    }
    const fd = new FormData()
    fd.append("name", formData.name)
    fd.append("slug", formData.slug)
    fd.append("role", formData.role)
    fd.append("department", formData.department)
    fd.append("bio", formData.bio)
    fd.append("email", formData.email)
    fd.append("phone", formData.phone)
    fd.append("skills", JSON.stringify(formData.skills))
    fd.append("isActive", formData.isActive)
    fd.append("isFeatured", formData.isFeatured)
    fd.append("order", formData.order)
    fd.append("joinedAt", formData.joinedAt)
    fd.append("socialLinks", JSON.stringify(formData.socialLinks))
    if (imageFile) fd.append("image", imageFile)
    if (removeImage) fd.append("removeImage", "true")
    onSubmit(fd)
  }

  const handleClose = () => { if (!isLoading) onClose() }

  if (!isOpen) return null

  const activeSection = sections[activeSectionIndex]

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-4 px-4">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-300" onClick={handleClose} />

      <div className="relative w-full max-w-2xl bg-card border border-border/50 rounded-2xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-400 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-primary/70 to-primary" />

        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              {isEditing ? <Sparkles className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-foreground tracking-tight">
                {isEditing ? "Edit Member" : "New Member"}
              </h2>
              <p className="text-[10px] text-muted-foreground/60 font-medium hidden sm:block">
                Step {activeSectionIndex + 1} of {sections.length} — {activeSection.label}
              </p>
            </div>
          </div>
          <button onClick={handleClose} disabled={isLoading}
            className="p-2 hover:bg-primary/5 rounded-xl transition-all duration-300 hover:rotate-90 disabled:opacity-50">
            <X className="w-4 h-4 text-muted-foreground hover:text-primary" />
          </button>
        </div>

        <div className="flex gap-1 px-4 sm:px-5 pt-3 overflow-x-auto scrollbar-hide">
          {sections.map((section, index) => {
            const isCompleted = index < activeSectionIndex
            const isCurrent = index === activeSectionIndex
            const isLocked = index > 0 && !canProceedFromBasic && activeSectionIndex === 0

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => !isLocked && handleSectionClick(index)}
                disabled={isLocked}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-300 whitespace-nowrap ${
                  isCurrent
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : isCompleted
                      ? "bg-primary/10 text-primary"
                      : isLocked
                        ? "text-muted-foreground/30 cursor-not-allowed"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                {isCompleted ? <Check className="w-3 h-3" /> : <section.icon className="w-3 h-3" />}
                {section.label}
              </button>
            )
          })}
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[55vh] overflow-y-auto">

          {activeSection.id === "basic" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                    <Type className="w-3.5 h-3.5 text-primary" /> Name *
                  </label>
                  <Input name="name" value={formData.name} onChange={handleChange}
                    placeholder="John Doe"
                    className={`h-9 text-xs rounded-lg bg-muted/20 border-border/50 ${errors.name ? "border-destructive ring-1 ring-destructive/30" : ""}`}
                    disabled={isLoading} />
                  {errors.name && <p className="text-destructive text-[10px] mt-1 font-semibold">{errors.name}</p>}
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                    <Hash className="w-3.5 h-3.5 text-muted-foreground" /> Slug
                  </label>
                  <Input name="slug" value={formData.slug} onChange={handleChange}
                    placeholder="john-doe" className="h-9 text-xs rounded-lg bg-muted/20 border-border/50" disabled={isLoading} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-primary" /> Role *
                  </label>
                  <Input name="role" value={formData.role} onChange={handleChange}
                    placeholder="Frontend Developer"
                    className={`h-9 text-xs rounded-lg bg-muted/20 border-border/50 ${errors.role ? "border-destructive ring-1 ring-destructive/30" : ""}`}
                    disabled={isLoading} />
                  {errors.role && <p className="text-destructive text-[10px] mt-1 font-semibold">{errors.role}</p>}
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                    <Users className="w-3.5 h-3.5 text-primary" /> Department *
                  </label>
                  <Input name="department" value={formData.department} onChange={handleChange}
                    placeholder="Engineering"
                    className={`h-9 text-xs rounded-lg bg-muted/20 border-border/50 ${errors.department ? "border-destructive ring-1 ring-destructive/30" : ""}`}
                    disabled={isLoading} />
                  {errors.department && <p className="text-destructive text-[10px] mt-1 font-semibold">{errors.department}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => !isLoading && setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                  className={`h-9 px-3 rounded-lg border-2 flex items-center gap-2 cursor-pointer transition-all text-xs font-medium ${
                    formData.isActive
                      ? "border-primary/30 bg-primary/5 text-primary"
                      : "border-border/50 bg-muted/20 text-muted-foreground hover:border-primary/20"
                  } ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                    formData.isActive ? "border-primary bg-primary" : "border-muted-foreground/30"
                  }`}>
                    {formData.isActive && (
                      <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  Active
                </div>
                <div
                  onClick={() => !isLoading && setFormData(prev => ({ ...prev, isFeatured: !prev.isFeatured }))}
                  className={`h-9 px-3 rounded-lg border-2 flex items-center gap-2 cursor-pointer transition-all text-xs font-medium ${
                    formData.isFeatured
                      ? "border-primary/30 bg-primary/5 text-primary"
                      : "border-border/50 bg-muted/20 text-muted-foreground hover:border-primary/20"
                  } ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                    formData.isFeatured ? "border-primary bg-primary" : "border-muted-foreground/30"
                  }`}>
                    {formData.isFeatured && (
                      <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <Star className="w-3 h-3" /> Featured
                </div>
              </div>
            </div>
          )}

          {activeSection.id === "media" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-2">
                  <ImageIcon className="w-3.5 h-3.5 text-primary" /> Member Photo
                </label>

                {imagePreview ? (
                  <div className="relative group w-32 h-32 rounded-2xl overflow-hidden border border-border/50 mx-auto">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2.5">
                      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isLoading}
                        className="p-2.5 bg-card rounded-xl hover:bg-accent transition-all hover:scale-110 shadow-lg">
                        <Upload className="w-4 h-4 text-foreground" />
                      </button>
                      <button type="button" onClick={handleRemoveImage} disabled={isLoading}
                        className="p-2.5 bg-card rounded-xl hover:bg-destructive/10 transition-all hover:scale-110 shadow-lg">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
                    onClick={() => !isLoading && fileInputRef.current?.click()}
                    className={`w-32 h-32 mx-auto border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                      isDragging ? "border-primary bg-primary/5 scale-[1.05]" : "border-border/50 hover:border-primary/40 hover:bg-primary/[0.02]"
                    } ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <ImageIcon className={`w-8 h-8 transition-colors duration-300 ${isDragging ? "text-primary" : "text-muted-foreground/30"}`} />
                    <p className="text-[9px] text-muted-foreground/50 mt-1 font-medium">Upload</p>
                  </div>
                )}

                <p className="text-[10px] text-muted-foreground/50 text-center mt-2 font-medium">PNG, JPG, GIF, WebP (max 5MB)</p>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={(e) => handleImageSelect(e.target.files[0])} className="hidden" disabled={isLoading} />
                {errors.image && <p className="text-destructive text-[10px] mt-1 font-semibold text-center">{errors.image}</p>}
              </div>
            </div>
          )}

          {activeSection.id === "details" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                    <Mail className="w-3.5 h-3.5 text-primary" /> Email
                  </label>
                  <Input name="email" type="email" value={formData.email} onChange={handleChange}
                    placeholder="john@company.com" className="h-9 text-xs rounded-lg bg-muted/20 border-border/50" disabled={isLoading} />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                    <Phone className="w-3.5 h-3.5 text-primary" /> Phone
                  </label>
                  <Input name="phone" value={formData.phone} onChange={handleChange}
                    placeholder="+1 234 567 890" className="h-9 text-xs rounded-lg bg-muted/20 border-border/50" disabled={isLoading} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                    <Hash className="w-3.5 h-3.5 text-muted-foreground" /> Display Order
                  </label>
                  <Input name="order" type="number" value={formData.order} onChange={handleChange}
                    className="h-9 text-xs rounded-lg bg-muted/20 border-border/50" disabled={isLoading} />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-muted-foreground" /> Joined Date
                  </label>
                  <Input name="joinedAt" type="date" value={formData.joinedAt} onChange={handleChange}
                    className="h-9 text-xs rounded-lg bg-muted/20 border-border/50" disabled={isLoading} />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary" /> Bio
                  <span className="text-[9px] text-muted-foreground font-normal">(Optional)</span>
                </label>
                <Textarea name="bio" value={formData.bio} onChange={handleChange}
                  placeholder="Short bio about the member..." rows={3}
                  className="resize-none rounded-lg text-xs bg-muted/20 border-border/50" disabled={isLoading} />
              </div>

              <SkillField
                skills={formData.skills}
                inputValue={skillInput}
                onInputChange={handleSkillInputChange}
                onAdd={handleAddSkill}
                onRemove={handleRemoveSkill}
                onKeyDown={handleSkillKeyDown}
                isLoading={isLoading}
              />
            </div>
          )}

          {activeSection.id === "social" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                  <Linkedin className="w-3.5 h-3.5 text-primary" /> LinkedIn
                </label>
                <Input name="social_linkedin" value={formData.socialLinks.linkedin} onChange={handleChange}
                  placeholder="https://linkedin.com/in/..." className="h-9 text-xs rounded-lg bg-muted/20 border-border/50" disabled={isLoading} />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                  <Github className="w-3.5 h-3.5 text-primary" /> GitHub
                </label>
                <Input name="social_github" value={formData.socialLinks.github} onChange={handleChange}
                  placeholder="https://github.com/..." className="h-9 text-xs rounded-lg bg-muted/20 border-border/50" disabled={isLoading} />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                  <Twitter className="w-3.5 h-3.5 text-primary" /> Twitter
                </label>
                <Input name="social_twitter" value={formData.socialLinks.twitter} onChange={handleChange}
                  placeholder="https://twitter.com/..." className="h-9 text-xs rounded-lg bg-muted/20 border-border/50" disabled={isLoading} />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                  <Globe className="w-3.5 h-3.5 text-primary" /> Website
                </label>
                <Input name="social_website" value={formData.socialLinks.website} onChange={handleChange}
                  placeholder="https://..." className="h-9 text-xs rounded-lg bg-muted/20 border-border/50" disabled={isLoading} />
              </div>
            </div>
          )}
        </form>

        <div className="flex items-center justify-between p-4 sm:p-5 border-t border-border/50 bg-muted/10">
          <div className="flex gap-1.5 items-center">
            {sections.map((section, index) => (
              <button
                key={section.id}
                type="button"
                onClick={() => handleSectionClick(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === activeSectionIndex
                    ? "bg-primary scale-125 w-4"
                    : index < activeSectionIndex
                      ? "bg-primary/50 w-1.5"
                      : "bg-muted-foreground/20 w-1.5"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {isFirstSection ? (
              <Button type="button" onClick={handleClose} disabled={isLoading}
                variant="outline" size="sm" className="h-8 px-4 text-xs rounded-lg font-bold border-border/50">
                Cancel
              </Button>
            ) : (
              <Button type="button" onClick={handleBack} disabled={isLoading}
                variant="outline" size="sm" className="h-8 px-3 text-xs rounded-lg font-bold border-border/50">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back
              </Button>
            )}

            {isLastSection || isEditing ? (
              <Button type="button" onClick={handleSubmit} disabled={isLoading || (!isEditing && !canProceedFromBasic)}
                size="sm" className="h-8 px-5 text-xs rounded-lg font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
                {isLoading ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Save className="w-3.5 h-3.5" />
                    {isEditing ? "Update" : "Create"}
                  </span>
                )}
              </Button>
            ) : (
              <Button type="button" onClick={handleNext}
                disabled={isLoading || (isFirstSection && !canProceedFromBasic)}
                size="sm" className="h-8 px-4 text-xs rounded-lg font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
                <span className="flex items-center gap-1.5">
                  Next
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}