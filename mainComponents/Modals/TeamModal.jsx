"use client"

import { useState, useEffect, useRef } from "react"
import {
  X, Loader2, Users, Type, Briefcase, FileText, Mail,
  Phone, Globe, Github, Linkedin, Twitter, Save, Plus,
  Upload, Image as ImageIcon, Trash2, Code, Hash
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

export default function TeamModal({ isOpen, onClose, onSubmit, member = null, isLoading = false }) {
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

  useEffect(() => {
    if (isOpen && member) {
      setFormData({
        name: member.name || "", slug: member.slug || "",
        role: member.role || "", department: member.department || "",
        bio: member.bio || "", email: member.email || "", phone: member.phone || "",
        skills: member.skills || [], isActive: member.isActive !== undefined ? member.isActive : true,
        isFeatured: member.isFeatured || false, order: member.order || 0,
        joinedAt: member.joinedAt ? member.joinedAt.split("T")[0] : "",
        socialLinks: { linkedin: member.socialLinks?.linkedin || "", github: member.socialLinks?.github || "",
          twitter: member.socialLinks?.twitter || "", website: member.socialLinks?.website || "" }
      })
      setImagePreview(member.image || null); setImageFile(null); setRemoveImage(false)
    } else if (isOpen) {
      setFormData({
        name: "", slug: "", role: "", department: "", bio: "",
        email: "", phone: "", skills: [], isActive: true, isFeatured: false,
        order: 0, joinedAt: "",
        socialLinks: { linkedin: "", github: "", twitter: "", website: "" }
      })
      setImagePreview(null); setImageFile(null); setRemoveImage(false)
    }
    setErrors({}); setSkillInput("")
  }, [isOpen, member])

  useEffect(() => {
    if (!isEditing && formData.name) {
      setFormData(prev => ({
        ...prev, slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      }))
    }
  }, [formData.name, isEditing])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name.startsWith("social_")) {
      const key = name.replace("social_", "")
      setFormData(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [key]: value } }))
    } else {
      setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
  }

  const handleImageSelect = (file) => {
    if (!file) return
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if (!allowed.includes(file.type)) { setErrors(prev => ({ ...prev, image: "Invalid type" })); return }
    if (file.size > 5 * 1024 * 1024) { setErrors(prev => ({ ...prev, image: "Max 5MB" })); return }
    setErrors(prev => ({ ...prev, image: null })); setImageFile(file); setRemoveImage(false)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); handleImageSelect(e.dataTransfer.files[0]) }
  const handleRemoveImage = () => { setImageFile(null); setImagePreview(null); setRemoveImage(true) }

  const handleAddSkill = () => {
    const s = skillInput.trim()
    if (s && !formData.skills.includes(s)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, s] })); setSkillInput("")
    }
  }
  const handleRemoveSkill = (s) => setFormData(prev => ({ ...prev, skills: prev.skills.filter(x => x !== s) }))
  const handleSkillKeyDown = (e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSkill() } }

  const validate = () => {
    const errs = {}
    if (!formData.name.trim()) errs.name = "Required"
    if (!formData.role.trim()) errs.role = "Required"
    if (!formData.department.trim()) errs.department = "Required"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    const fd = new FormData()
    fd.append("name", formData.name); fd.append("slug", formData.slug)
    fd.append("role", formData.role); fd.append("department", formData.department)
    fd.append("bio", formData.bio); fd.append("email", formData.email)
    fd.append("phone", formData.phone); fd.append("skills", JSON.stringify(formData.skills))
    fd.append("isActive", formData.isActive); fd.append("isFeatured", formData.isFeatured)
    fd.append("order", formData.order); fd.append("joinedAt", formData.joinedAt)
    fd.append("socialLinks", JSON.stringify(formData.socialLinks))
    if (imageFile) fd.append("image", imageFile)
    if (removeImage) fd.append("removeImage", "true")
    onSubmit(fd)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-4 px-4">
      <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => !isLoading && onClose()} />

      <div className="relative w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary"><Users className="w-4 h-4" /></div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">{isEditing ? "Edit Member" : "Add Member"}</h2>
              <p className="text-[10px] text-muted-foreground hidden sm:block">{isEditing ? "Update member details" : "Add a new team member"}</p>
            </div>
          </div>
          <button onClick={() => !isLoading && onClose()} className="p-1.5 hover:bg-accent rounded-lg"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[65vh] overflow-y-auto">

          {/* Image */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" /> Photo
            </label>
            {imagePreview ? (
              <div className="relative group w-24 h-24 rounded-full overflow-hidden border border-border mx-auto">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-1">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1.5 bg-card rounded-full hover:bg-accent"><Upload className="w-3 h-3" /></button>
                  <button type="button" onClick={handleRemoveImage} className="p-1.5 bg-card rounded-full hover:bg-destructive/10"><Trash2 className="w-3 h-3 text-destructive" /></button>
                </div>
              </div>
            ) : (
              <div onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
                onClick={() => !isLoading && fileInputRef.current?.click()}
                className={`w-24 h-24 rounded-full border-2 border-dashed mx-auto flex items-center justify-center cursor-pointer transition-all ${
                  isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                }`}>
                <ImageIcon className={`w-6 h-6 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleImageSelect(e.target.files[0])} className="hidden" />
          </div>

          {/* Name, Role, Department */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5"><Type className="w-3.5 h-3.5 text-muted-foreground" /> Name *</label>
              <Input name="name" value={formData.name} onChange={handleChange} placeholder="John Doe"
                className={`h-9 text-xs rounded-lg ${errors.name ? "border-destructive" : ""}`} disabled={isLoading} />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5"><Briefcase className="w-3.5 h-3.5 text-muted-foreground" /> Role *</label>
              <Input name="role" value={formData.role} onChange={handleChange} placeholder="Developer"
                className={`h-9 text-xs rounded-lg ${errors.role ? "border-destructive" : ""}`} disabled={isLoading} />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5"><Briefcase className="w-3.5 h-3.5 text-muted-foreground" /> Department *</label>
              <Input name="department" value={formData.department} onChange={handleChange} placeholder="Engineering"
                className={`h-9 text-xs rounded-lg ${errors.department ? "border-destructive" : ""}`} disabled={isLoading} />
            </div>
          </div>

          {/* Email, Phone, Order */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5"><Mail className="w-3.5 h-3.5 text-muted-foreground" /> Email</label>
              <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@company.com" className="h-9 text-xs rounded-lg" disabled={isLoading} /></div>
            <div><label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5"><Phone className="w-3.5 h-3.5 text-muted-foreground" /> Phone</label>
              <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567" className="h-9 text-xs rounded-lg" disabled={isLoading} /></div>
            <div><label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5"><Hash className="w-3.5 h-3.5 text-muted-foreground" /> Order</label>
              <Input name="order" type="number" value={formData.order} onChange={handleChange} className="h-9 text-xs rounded-lg" disabled={isLoading} /></div>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-[11px] font-medium text-foreground cursor-pointer">
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary" /> Active
            </label>
            <label className="flex items-center gap-2 text-[11px] font-medium text-foreground cursor-pointer">
              <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary" /> Featured
            </label>
          </div>

          {/* Bio */}
          <div><label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5"><FileText className="w-3.5 h-3.5 text-muted-foreground" /> Bio</label>
            <Textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Short bio..." rows={2} className="resize-none rounded-lg text-xs" disabled={isLoading} /></div>

          {/* Skills */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5"><Code className="w-3.5 h-3.5 text-muted-foreground" /> Skills</label>
            <div className="flex gap-2 mb-2">
              <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={handleSkillKeyDown}
                placeholder="e.g., React" className="h-8 text-xs rounded-lg" disabled={isLoading} />
              <Button type="button" onClick={handleAddSkill} disabled={!skillInput.trim() || isLoading} variant="secondary" size="sm" className="h-8 px-3"><Plus className="w-3.5 h-3.5" /></Button>
            </div>
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {formData.skills.map((s, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 text-[10px] px-2 py-0.5 bg-primary/10 text-primary border-0">
                    {s}<button type="button" onClick={() => handleRemoveSkill(s)} className="hover:text-primary/70"><X className="w-3 h-3" /></button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5"><Linkedin className="w-3.5 h-3.5 text-muted-foreground" /> LinkedIn</label>
              <Input name="social_linkedin" value={formData.socialLinks.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..." className="h-9 text-xs rounded-lg" disabled={isLoading} /></div>
            <div><label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5"><Github className="w-3.5 h-3.5 text-muted-foreground" /> GitHub</label>
              <Input name="social_github" value={formData.socialLinks.github} onChange={handleChange} placeholder="https://github.com/..." className="h-9 text-xs rounded-lg" disabled={isLoading} /></div>
            <div><label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5"><Twitter className="w-3.5 h-3.5 text-muted-foreground" /> Twitter</label>
              <Input name="social_twitter" value={formData.socialLinks.twitter} onChange={handleChange} placeholder="https://twitter.com/..." className="h-9 text-xs rounded-lg" disabled={isLoading} /></div>
            <div><label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5"><Globe className="w-3.5 h-3.5 text-muted-foreground" /> Website</label>
              <Input name="social_website" value={formData.socialLinks.website} onChange={handleChange} placeholder="https://..." className="h-9 text-xs rounded-lg" disabled={isLoading} /></div>
          </div>
        </form>

        <div className="flex items-center justify-end gap-2 p-4 sm:p-5 border-t border-border bg-muted/30 rounded-b-xl">
          <Button type="button" onClick={() => !isLoading && onClose()} disabled={isLoading} variant="outline" size="sm" className="h-8 px-4 text-xs rounded-lg">Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading} size="sm" className="h-8 px-4 text-xs rounded-lg">
            {isLoading ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />{isEditing ? "Updating..." : "Creating..."}</>
              : <><Save className="w-3.5 h-3.5 mr-1.5" />{isEditing ? "Update" : "Create"}</>}
          </Button>
        </div>
      </div>
    </div>
  )
}