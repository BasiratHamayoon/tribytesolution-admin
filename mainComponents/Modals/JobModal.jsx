"use client"

import { useState, useEffect } from "react"
import {
  X, Loader2, Briefcase, Type, MapPin, Clock, FileText,
  Code, Save, Plus, DollarSign, Mail, Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

const JOB_TYPES = ["Full-Time", "Part-Time", "Contract", "Internship", "Remote"]

export default function JobModal({ isOpen, onClose, onSubmit, job = null, isLoading = false }) {
  const isEditing = !!job

  const [formData, setFormData] = useState({
    title: "", slug: "", department: "", location: "",
    type: "", experience: "", salary: "", description: "",
    fullDescription: "", requirements: [], responsibilities: [],
    benefits: [], skills: [], isActive: true, isFeatured: false,
    applicationEmail: "", applicationDeadline: ""
  })

  const [arrayInputs, setArrayInputs] = useState({
    requirements: "", responsibilities: "", benefits: "", skills: ""
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen && job) {
      setFormData({
        title: job.title || "", slug: job.slug || "",
        department: job.department || "", location: job.location || "",
        type: job.type || "", experience: job.experience || "",
        salary: job.salary || "", description: job.description || "",
        fullDescription: job.fullDescription || "",
        requirements: job.requirements || [], responsibilities: job.responsibilities || [],
        benefits: job.benefits || [], skills: job.skills || [],
        isActive: job.isActive !== undefined ? job.isActive : true,
        isFeatured: job.isFeatured || false,
        applicationEmail: job.applicationEmail || "",
        applicationDeadline: job.applicationDeadline ? job.applicationDeadline.split("T")[0] : ""
      })
    } else if (isOpen) {
      setFormData({
        title: "", slug: "", department: "", location: "",
        type: "", experience: "", salary: "", description: "",
        fullDescription: "", requirements: [], responsibilities: [],
        benefits: [], skills: [], isActive: true, isFeatured: false,
        applicationEmail: "", applicationDeadline: ""
      })
    }
    setErrors({})
    setArrayInputs({ requirements: "", responsibilities: "", benefits: "", skills: "" })
  }, [isOpen, job])

  useEffect(() => {
    if (!isEditing && formData.title) {
      setFormData(prev => ({
        ...prev,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      }))
    }
  }, [formData.title, isEditing])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
  }

  const handleAddArrayItem = (field) => {
    const val = arrayInputs[field].trim()
    if (val && !formData[field].includes(val)) {
      setFormData(prev => ({ ...prev, [field]: [...prev[field], val] }))
      setArrayInputs(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleRemoveArrayItem = (field, item) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter(i => i !== item) }))
  }

  const handleArrayKeyDown = (e, field) => {
    if (e.key === "Enter") { e.preventDefault(); handleAddArrayItem(field) }
  }

  const validate = () => {
    const errs = {}
    if (!formData.title.trim()) errs.title = "Required"
    if (!formData.department.trim()) errs.department = "Required"
    if (!formData.location.trim()) errs.location = "Required"
    if (!formData.type) errs.type = "Required"
    if (!formData.experience.trim()) errs.experience = "Required"
    if (!formData.description.trim()) errs.description = "Required"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit(formData)
  }

  if (!isOpen) return null

  const ArrayField = ({ label, field, icon: Icon, placeholder }) => (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" /> {label}
      </label>
      <div className="flex gap-2 mb-2">
        <Input value={arrayInputs[field]}
          onChange={(e) => setArrayInputs(prev => ({ ...prev, [field]: e.target.value }))}
          onKeyDown={(e) => handleArrayKeyDown(e, field)}
          placeholder={placeholder} className="h-8 text-xs rounded-lg" disabled={isLoading} />
        <Button type="button" onClick={() => handleAddArrayItem(field)}
          disabled={!arrayInputs[field].trim() || isLoading}
          variant="secondary" size="sm" className="h-8 px-3">
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
      {formData[field].length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {formData[field].map((item, i) => (
            <Badge key={i} variant="secondary" className="gap-1 text-[10px] px-2 py-0.5 bg-primary/10 text-primary border-0">
              {item}
              <button type="button" onClick={() => handleRemoveArrayItem(field, item)} className="hover:text-primary/70">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-4 px-4">
      <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => !isLoading && onClose()} />

      <div className="relative w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">
                {isEditing ? "Edit Job" : "Add New Job"}
              </h2>
              <p className="text-[10px] text-muted-foreground hidden sm:block">
                {isEditing ? "Update job listing" : "Create a new job listing"}
              </p>
            </div>
          </div>
          <button onClick={() => !isLoading && onClose()} className="p-1.5 hover:bg-accent rounded-lg transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[65vh] overflow-y-auto">

          {/* Title & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5">
                <Type className="w-3.5 h-3.5 text-muted-foreground" /> Title *
              </label>
              <Input name="title" value={formData.title} onChange={handleChange}
                placeholder="Frontend Developer" className={`h-9 text-xs rounded-lg ${errors.title ? "border-destructive" : ""}`} disabled={isLoading} />
              {errors.title && <p className="text-destructive text-[10px] mt-0.5">{errors.title}</p>}
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5">
                <Briefcase className="w-3.5 h-3.5 text-muted-foreground" /> Department *
              </label>
              <Input name="department" value={formData.department} onChange={handleChange}
                placeholder="Engineering" className={`h-9 text-xs rounded-lg ${errors.department ? "border-destructive" : ""}`} disabled={isLoading} />
              {errors.department && <p className="text-destructive text-[10px] mt-0.5">{errors.department}</p>}
            </div>
          </div>

          {/* Location, Type, Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> Location *
              </label>
              <Input name="location" value={formData.location} onChange={handleChange}
                placeholder="Remote / NYC" className={`h-9 text-xs rounded-lg ${errors.location ? "border-destructive" : ""}`} disabled={isLoading} />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" /> Type *
              </label>
              <select name="type" value={formData.type} onChange={handleChange}
                className={`w-full h-9 px-2.5 border rounded-lg text-xs bg-card text-foreground focus:ring-1 focus:ring-primary outline-none ${errors.type ? "border-destructive" : "border-border"}`} disabled={isLoading}>
                <option value="">Select type</option>
                {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" /> Experience *
              </label>
              <Input name="experience" value={formData.experience} onChange={handleChange}
                placeholder="2-4 years" className={`h-9 text-xs rounded-lg ${errors.experience ? "border-destructive" : ""}`} disabled={isLoading} />
            </div>
          </div>

          {/* Salary & Email & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5">
                <DollarSign className="w-3.5 h-3.5 text-muted-foreground" /> Salary
              </label>
              <Input name="salary" value={formData.salary} onChange={handleChange}
                placeholder="$60k - $80k" className="h-9 text-xs rounded-lg" disabled={isLoading} />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Application Email
              </label>
              <Input name="applicationEmail" type="email" value={formData.applicationEmail} onChange={handleChange}
                placeholder="hr@company.com" className="h-9 text-xs rounded-lg" disabled={isLoading} />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Deadline
              </label>
              <Input name="applicationDeadline" type="date" value={formData.applicationDeadline} onChange={handleChange}
                className="h-9 text-xs rounded-lg" disabled={isLoading} />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-[11px] font-medium text-foreground cursor-pointer">
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange}
                className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary" />
              Active
            </label>
            <label className="flex items-center gap-2 text-[11px] font-medium text-foreground cursor-pointer">
              <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange}
                className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary" />
              Featured
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" /> Description *
            </label>
            <Textarea name="description" value={formData.description} onChange={handleChange}
              placeholder="Job overview..." rows={2} className={`resize-none rounded-lg text-xs ${errors.description ? "border-destructive" : ""}`} disabled={isLoading} />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" /> Full Description
            </label>
            <Textarea name="fullDescription" value={formData.fullDescription} onChange={handleChange}
              placeholder="Detailed description..." rows={3} className="resize-none rounded-lg text-xs" disabled={isLoading} />
          </div>

          {/* Array Fields */}
          <ArrayField label="Requirements" field="requirements" icon={Code} placeholder="e.g., 3+ years React" />
          <ArrayField label="Responsibilities" field="responsibilities" icon={FileText} placeholder="e.g., Build UI components" />
          <ArrayField label="Benefits" field="benefits" icon={DollarSign} placeholder="e.g., Health insurance" />
          <ArrayField label="Skills" field="skills" icon={Code} placeholder="e.g., React, TypeScript" />
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 sm:p-5 border-t border-border bg-muted/30 rounded-b-xl">
          <Button type="button" onClick={() => !isLoading && onClose()} disabled={isLoading}
            variant="outline" size="sm" className="h-8 px-4 text-xs rounded-lg">Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading} size="sm" className="h-8 px-4 text-xs rounded-lg">
            {isLoading ? (
              <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />{isEditing ? "Updating..." : "Creating..."}</>
            ) : (
              <><Save className="w-3.5 h-3.5 mr-1.5" />{isEditing ? "Update Job" : "Create Job"}</>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}