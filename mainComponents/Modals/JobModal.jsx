"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  X, Loader2, Briefcase, Type, MapPin, Clock,
  FileText, Code, Save, Plus, DollarSign, Mail,
  Calendar, Star, Check, ArrowLeft, ArrowRight, Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

const JOB_TYPES = ["Full-Time", "Part-Time", "Contract", "Internship", "Remote"]

// ─── ArrayField must be defined OUTSIDE to prevent remount on every render ───
function ArrayField({
  label, field, icon: Icon, placeholder,
  items, inputValue, onInputChange, onAdd, onRemove, onKeyDown, isLoading
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground">
          <Icon className="w-3.5 h-3.5 text-primary" />
          {label}
        </label>
        {items.length > 0 && (
          <span className="text-[9px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">
            {items.length} added
          </span>
        )}
      </div>
      <div className="flex gap-2 mb-2">
        <Input
          value={inputValue}
          onChange={(e) => onInputChange(field, e.target.value)}
          onKeyDown={(e) => onKeyDown(e, field)}
          placeholder={placeholder}
          className="h-8 text-xs rounded-lg bg-muted/20 border-border/50"
          disabled={isLoading}
        />
        <Button
          type="button"
          onClick={() => onAdd(field)}
          disabled={!inputValue.trim() || isLoading}
          size="sm"
          className="h-8 px-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 p-2.5 bg-muted/20 rounded-lg border border-border/30">
          {items.map((item, i) => (
            <Badge
              key={`${item}-${i}`}
              variant="secondary"
              className="gap-1.5 text-[10px] px-2.5 py-1 bg-primary/10 text-primary border-0 rounded-full font-bold hover:bg-primary/15 transition-colors duration-200"
            >
              {item}
              <button
                type="button"
                onClick={() => onRemove(field, item)}
                disabled={isLoading}
                className="hover:text-primary/60 p-0 ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-3 bg-muted/10 rounded-lg border border-dashed border-border/30">
          <p className="text-[10px] text-muted-foreground/40 font-medium">No {label.toLowerCase()} added yet</p>
        </div>
      )}
    </div>
  )
}

const EMPTY_FORM = {
  title: "", slug: "", department: "", location: "",
  type: "", experience: "", salary: "", description: "",
  fullDescription: "", requirements: [], responsibilities: [],
  benefits: [], skills: [], isActive: true, isFeatured: false,
  applicationEmail: "", applicationDeadline: ""
}

const EMPTY_INPUTS = {
  requirements: "", responsibilities: "", benefits: "", skills: ""
}

export default function JobModal({
  isOpen, onClose, onSubmit, job = null, isLoading = false
}) {
  const isEditing = !!job

  const [formData, setFormData] = useState(EMPTY_FORM)
  const [arrayInputs, setArrayInputs] = useState(EMPTY_INPUTS)
  const [errors, setErrors] = useState({})
  const [activeSectionIndex, setActiveSectionIndex] = useState(0)

  const sections = [
    { id: "basics", label: "Basics", icon: Type },
    { id: "details", label: "Details", icon: FileText },
    { id: "requirements", label: "Requirements", icon: Code },
    { id: "extras", label: "Extras", icon: Star },
  ]

  const isLastSection = activeSectionIndex === sections.length - 1
  const isFirstSection = activeSectionIndex === 0
  const activeSection = sections[activeSectionIndex]

  useEffect(() => {
    if (isOpen && job) {
      setFormData({
        title: job.title || "",
        slug: job.slug || "",
        department: job.department || "",
        location: job.location || "",
        type: job.type || "",
        experience: job.experience || "",
        salary: job.salary || "",
        description: job.description || "",
        fullDescription: job.fullDescription || "",
        requirements: job.requirements || [],
        responsibilities: job.responsibilities || [],
        benefits: job.benefits || [],
        skills: job.skills || [],
        isActive: job.isActive !== undefined ? job.isActive : true,
        isFeatured: job.isFeatured || false,
        applicationEmail: job.applicationEmail || "",
        applicationDeadline: job.applicationDeadline
          ? job.applicationDeadline.split("T")[0]
          : ""
      })
    } else if (isOpen) {
      setFormData(EMPTY_FORM)
    }
    setErrors({})
    setArrayInputs(EMPTY_INPUTS)
    setActiveSectionIndex(0)
  }, [isOpen, job])

  // Auto-generate slug from title (only when adding)
  useEffect(() => {
    if (!isEditing && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.title, isEditing])

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
  }, [errors])

  // ── Array field handlers (stable references via useCallback) ──
  const handleArrayInputChange = useCallback((field, value) => {
    setArrayInputs(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleAddArrayItem = useCallback((field) => {
    setArrayInputs(prev => {
      const val = prev[field].trim()
      if (!val) return prev
      setFormData(fd => {
        if (fd[field].includes(val)) return fd
        return { ...fd, [field]: [...fd[field], val] }
      })
      return { ...prev, [field]: "" }
    })
  }, [])

  const handleRemoveArrayItem = useCallback((field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(i => i !== item)
    }))
  }, [])

  const handleArrayKeyDown = useCallback((e, field) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddArrayItem(field)
    }
  }, [handleAddArrayItem])

  const canProceedFromBasics = !!(
    formData.title.trim() &&
    formData.department.trim() &&
    formData.location.trim() &&
    formData.type &&
    formData.experience.trim() &&
    formData.description.trim()
  )

  const validateSection = () => {
    if (activeSectionIndex === 0) {
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
    return true
  }

  const validateAll = () => {
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

  const handleNext = () => {
    if (activeSectionIndex === 0 && !validateSection()) return
    if (!isLastSection) setActiveSectionIndex(prev => prev + 1)
  }

  const handleBack = () => {
    if (!isFirstSection) setActiveSectionIndex(prev => prev - 1)
  }

  const handleSectionClick = (index) => {
    if (index > 0 && activeSectionIndex === 0 && !validateSection()) return
    setActiveSectionIndex(index)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateAll()) {
      setActiveSectionIndex(0)
      return
    }
    onSubmit(formData)
  }

  const handleClose = () => { if (!isLoading) onClose() }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-4 px-4">
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-300"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-2xl bg-card border border-border/50 rounded-2xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-400 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-primary/70 to-primary" />

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              {isEditing ? <Sparkles className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-foreground tracking-tight">
                {isEditing ? "Edit Job" : "New Job"}
              </h2>
              <p className="text-[10px] text-muted-foreground/60 font-medium hidden sm:block">
                Step {activeSectionIndex + 1} of {sections.length} — {activeSection.label}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-primary/5 rounded-xl transition-all duration-300 hover:rotate-90 disabled:opacity-50"
          >
            <X className="w-4 h-4 text-muted-foreground hover:text-primary" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-1 px-4 sm:px-5 pt-3 overflow-x-auto scrollbar-hide">
          {sections.map((section, index) => {
            const isCompleted = index < activeSectionIndex
            const isCurrent = index === activeSectionIndex
            const isLocked = index > 0 && !canProceedFromBasics && activeSectionIndex === 0

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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[55vh] overflow-y-auto">

          {/* ── SECTION 1: Basics ── */}
          {activeSection.id === "basics" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Title + Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                    <Type className="w-3.5 h-3.5 text-primary" /> Job Title *
                  </label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Frontend Developer"
                    className={`h-9 text-xs rounded-lg bg-muted/20 border-border/50 ${errors.title ? "border-destructive ring-1 ring-destructive/30" : ""}`}
                    disabled={isLoading}
                  />
                  {errors.title && <p className="text-destructive text-[10px] mt-1 font-semibold">{errors.title}</p>}
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-primary" /> Department *
                  </label>
                  <Input
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Engineering"
                    className={`h-9 text-xs rounded-lg bg-muted/20 border-border/50 ${errors.department ? "border-destructive ring-1 ring-destructive/30" : ""}`}
                    disabled={isLoading}
                  />
                  {errors.department && <p className="text-destructive text-[10px] mt-1 font-semibold">{errors.department}</p>}
                </div>
              </div>

              {/* Location + Type + Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> Location *
                  </label>
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Remote / NYC"
                    className={`h-9 text-xs rounded-lg bg-muted/20 border-border/50 ${errors.location ? "border-destructive ring-1 ring-destructive/30" : ""}`}
                    disabled={isLoading}
                  />
                  {errors.location && <p className="text-destructive text-[10px] mt-1 font-semibold">{errors.location}</p>}
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" /> Type *
                  </label>
                  <div className="relative">
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className={`w-full h-9 px-3 pr-8 border rounded-lg text-xs bg-card text-foreground focus:ring-1 focus:ring-primary/30 outline-none transition-all duration-300 appearance-none cursor-pointer [&>option]:bg-card [&>option]:text-foreground ${
                        errors.type ? "border-destructive ring-1 ring-destructive/30" : "border-border/50"
                      }`}
                      disabled={isLoading}
                    >
                      <option value="">Select type</option>
                      {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {errors.type && <p className="text-destructive text-[10px] mt-1 font-semibold">{errors.type}</p>}
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" /> Experience *
                  </label>
                  <Input
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="2-4 years"
                    className={`h-9 text-xs rounded-lg bg-muted/20 border-border/50 ${errors.experience ? "border-destructive ring-1 ring-destructive/30" : ""}`}
                    disabled={isLoading}
                  />
                  {errors.experience && <p className="text-destructive text-[10px] mt-1 font-semibold">{errors.experience}</p>}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary" /> Short Description *
                </label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief job overview..."
                  rows={3}
                  className={`resize-none rounded-lg text-xs bg-muted/20 border-border/50 ${errors.description ? "border-destructive ring-1 ring-destructive/30" : ""}`}
                  disabled={isLoading}
                />
                {errors.description && <p className="text-destructive text-[10px] mt-1 font-semibold">{errors.description}</p>}
              </div>

              {/* Toggles */}
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
                  Active Listing
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

          {/* ── SECTION 2: Details ── */}
          {activeSection.id === "details" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary" /> Full Description
                  <span className="text-[9px] text-muted-foreground font-normal">(Optional)</span>
                </label>
                <Textarea
                  name="fullDescription"
                  value={formData.fullDescription}
                  onChange={handleChange}
                  placeholder="Detailed job description..."
                  rows={5}
                  className="resize-none rounded-lg text-xs bg-muted/20 border-border/50"
                  disabled={isLoading}
                />
              </div>

              <ArrayField
                label="Skills"
                field="skills"
                icon={Code}
                placeholder="e.g., React, TypeScript"
                items={formData.skills}
                inputValue={arrayInputs.skills}
                onInputChange={handleArrayInputChange}
                onAdd={handleAddArrayItem}
                onRemove={handleRemoveArrayItem}
                onKeyDown={handleArrayKeyDown}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* ── SECTION 3: Requirements ── */}
          {activeSection.id === "requirements" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <ArrayField
                label="Requirements"
                field="requirements"
                icon={Code}
                placeholder="e.g., 3+ years React"
                items={formData.requirements}
                inputValue={arrayInputs.requirements}
                onInputChange={handleArrayInputChange}
                onAdd={handleAddArrayItem}
                onRemove={handleRemoveArrayItem}
                onKeyDown={handleArrayKeyDown}
                isLoading={isLoading}
              />
              <ArrayField
                label="Responsibilities"
                field="responsibilities"
                icon={FileText}
                placeholder="e.g., Build UI components"
                items={formData.responsibilities}
                inputValue={arrayInputs.responsibilities}
                onInputChange={handleArrayInputChange}
                onAdd={handleAddArrayItem}
                onRemove={handleRemoveArrayItem}
                onKeyDown={handleArrayKeyDown}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* ── SECTION 4: Extras ── */}
          {activeSection.id === "extras" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Salary + Email + Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-primary" /> Salary
                  </label>
                  <Input
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="$60k–$80k"
                    className="h-9 text-xs rounded-lg bg-muted/20 border-border/50"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                    <Mail className="w-3.5 h-3.5 text-primary" /> Application Email
                  </label>
                  <Input
                    name="applicationEmail"
                    type="email"
                    value={formData.applicationEmail}
                    onChange={handleChange}
                    placeholder="hr@company.com"
                    className="h-9 text-xs rounded-lg bg-muted/20 border-border/50"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> Deadline
                  </label>
                  <Input
                    name="applicationDeadline"
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={handleChange}
                    className="h-9 text-xs rounded-lg bg-muted/20 border-border/50"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <ArrayField
                label="Benefits"
                field="benefits"
                icon={Star}
                placeholder="e.g., Health insurance"
                items={formData.benefits}
                inputValue={arrayInputs.benefits}
                onInputChange={handleArrayInputChange}
                onAdd={handleAddArrayItem}
                onRemove={handleRemoveArrayItem}
                onKeyDown={handleArrayKeyDown}
                isLoading={isLoading}
              />
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-t border-border/50 bg-muted/10">
          {/* Progress dots */}
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
              <Button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="h-8 px-4 text-xs rounded-lg font-bold border-border/50"
              >
                Cancel
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleBack}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs rounded-lg font-bold border-border/50"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back
              </Button>
            )}

            {isLastSection || isEditing ? (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || (!isEditing && !canProceedFromBasics)}
                size="sm"
                className="h-8 px-5 text-xs rounded-lg font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
              >
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
              <Button
                type="button"
                onClick={handleNext}
                disabled={isLoading || (isFirstSection && !canProceedFromBasics)}
                size="sm"
                className="h-8 px-4 text-xs rounded-lg font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
              >
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