"use client"

import { useState, useEffect, useRef } from "react"
import {
  X, Loader2, Briefcase, Type, Tag, FileText,
  List, Link, DollarSign, Save, Plus, Upload,
  Image as ImageIcon, Trash2, Sparkles,
  ArrowRight, ArrowLeft, Check, Star, CheckCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { getImageUrl } from "@/utils/getImageUrl"

const CATEGORIES = ["Development", "Design", "Marketing", "Consulting", "Support", "Other"]

export default function ServiceModal({
  isOpen, onClose, onSubmit, service = null, isLoading = false
}) {
  const isEditing = !!service
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    title: "", slug: "", category: "", description: "",
    fullDescription: "", price: "", features: "",
    keyBenefits: "", whatweoffer: "", popular: false
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [errors, setErrors] = useState({})
  const [isDragging, setIsDragging] = useState(false)
  const [activeSectionIndex, setActiveSectionIndex] = useState(0)

  const sections = [
    { id: "basic", label: "Basic", icon: Type },
    { id: "media", label: "Media", icon: ImageIcon },
    { id: "details", label: "Details", icon: FileText },
    { id: "links", label: "Extras", icon: Star }
  ]

  const isLastSection = activeSectionIndex === sections.length - 1
  const isFirstSection = activeSectionIndex === 0

  useEffect(() => {
    if (isOpen && service) {
      const parseList = (val) => {
        if (Array.isArray(val)) return val.join(", ")
        if (typeof val === "string") return val
        return ""
      }
      setFormData({
        title: service.title || "",
        slug: service.slug || "",
        category: service.category || "",
        description: service.description || "",
        fullDescription: service.fullDescription || "",
        price: service.price || "",
        features: parseList(service.features),
        keyBenefits: parseList(service.keyBenefits),
        whatweoffer: parseList(service.whatweoffer),
        popular: service.popular || false
      })
      const imgUrl = service.image ? getImageUrl(service.image) : null
      setImagePreview(imgUrl)
      setImageFile(null)
      setRemoveImage(false)
    } else if (isOpen) {
      setFormData({
        title: "", slug: "", category: "", description: "",
        fullDescription: "", price: "", features: "",
        keyBenefits: "", whatweoffer: "", popular: false
      })
      setImagePreview(null)
      setImageFile(null)
      setRemoveImage(false)
    }
    setErrors({})
    setActiveSectionIndex(0)
  }, [isOpen, service])

  useEffect(() => {
    if (!isEditing && formData.title) {
      const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.title, isEditing])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
  }

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

  const validateCurrentSection = () => {
    const errs = {}
    if (activeSectionIndex === 0) {
      if (!formData.title.trim()) errs.title = "Title is required"
      if (!formData.category.trim()) errs.category = "Category is required"
      if (!formData.description.trim()) errs.description = "Description is required"
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validateAll = () => {
    const errs = {}
    if (!formData.title.trim()) errs.title = "Title is required"
    if (!formData.category.trim()) errs.category = "Category is required"
    if (!formData.description.trim()) errs.description = "Description is required"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (activeSectionIndex === 0 && !validateCurrentSection()) return
    if (activeSectionIndex < sections.length - 1) {
      setActiveSectionIndex(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (activeSectionIndex > 0) setActiveSectionIndex(prev => prev - 1)
  }

  const handleSectionClick = (index) => {
    if (index > 0 && activeSectionIndex === 0 && !validateCurrentSection()) return
    setActiveSectionIndex(index)
  }

  const canProceedFromBasic = formData.title.trim() && formData.category.trim() && formData.description.trim()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateAll()) {
      setActiveSectionIndex(0)
      return
    }
    const fd = new FormData()
    fd.append("title", formData.title)
    fd.append("slug", formData.slug)
    fd.append("category", formData.category)
    fd.append("description", formData.description)
    fd.append("fullDescription", formData.fullDescription)
    fd.append("price", formData.price)
    fd.append("features", formData.features)
    fd.append("keyBenefits", formData.keyBenefits)
    fd.append("whatweoffer", formData.whatweoffer)
    fd.append("popular", formData.popular.toString())
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

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              {isEditing ? <Sparkles className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-foreground tracking-tight">
                {isEditing ? "Edit Service" : "New Service"}
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

        {/* Section Tabs */}
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
                {isCompleted ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <section.icon className="w-3 h-3" />
                )}
                {section.label}
              </button>
            )
          })}
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[55vh] overflow-y-auto">

          {/* Basic Section */}
          {activeSection.id === "basic" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                    <Type className="w-3.5 h-3.5 text-primary" /> Title *
                  </label>
                  <Input name="title" value={formData.title} onChange={handleChange}
                    placeholder="Web Development"
                    className={`h-9 text-xs rounded-lg bg-muted/20 border-border/50 ${errors.title ? "border-destructive ring-1 ring-destructive/30" : ""}`}
                    disabled={isLoading} />
                  {errors.title && <p className="text-destructive text-[10px] mt-1 font-semibold">{errors.title}</p>}
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                    <Link className="w-3.5 h-3.5 text-muted-foreground" /> Slug
                  </label>
                  <Input name="slug" value={formData.slug} onChange={handleChange}
                    placeholder="web-development" className="h-9 text-xs rounded-lg bg-muted/20 border-border/50" disabled={isLoading} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-primary" /> Category *
                  </label>
                  <div className="relative">
                    <select name="category" value={formData.category} onChange={handleChange}
                      className={`w-full h-9 px-3 pr-8 border rounded-lg text-xs bg-card text-foreground focus:ring-1 focus:ring-primary/30 outline-none transition-all duration-300 appearance-none cursor-pointer [&>option]:bg-card [&>option]:text-foreground ${
                        errors.category ? "border-destructive ring-1 ring-destructive/30" : "border-border/50"
                      }`} disabled={isLoading}>
                      <option value="">Select category</option>
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {errors.category && <p className="text-destructive text-[10px] mt-1 font-semibold">{errors.category}</p>}
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-muted-foreground" /> Price
                  </label>
                  <Input name="price" value={formData.price} onChange={handleChange}
                    placeholder="Starting at $5,000" className="h-9 text-xs rounded-lg bg-muted/20 border-border/50" disabled={isLoading} />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary" /> Short Description *
                </label>
                <Textarea name="description" value={formData.description} onChange={handleChange}
                  placeholder="Brief overview of the service..." rows={2}
                  className={`resize-none rounded-lg text-xs bg-muted/20 border-border/50 ${errors.description ? "border-destructive ring-1 ring-destructive/30" : ""}`}
                  disabled={isLoading} />
                {errors.description && <p className="text-destructive text-[10px] mt-1 font-semibold">{errors.description}</p>}
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                  <Star className="w-3.5 h-3.5 text-muted-foreground" /> Visibility
                </label>
                <div
                  onClick={() => !isLoading && setFormData(prev => ({ ...prev, popular: !prev.popular }))}
                  className={`h-9 px-3 rounded-lg border-2 flex items-center gap-2 cursor-pointer transition-all text-xs font-medium ${
                    formData.popular
                      ? "border-primary/30 bg-primary/5 text-primary"
                      : "border-border/50 bg-muted/20 text-muted-foreground hover:border-primary/20"
                  } ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                    formData.popular ? "border-primary bg-primary" : "border-muted-foreground/30"
                  }`}>
                    {formData.popular && (
                      <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  Mark as Popular
                  {formData.popular && <Star className="w-3 h-3 fill-primary text-primary ml-auto" />}
                </div>
              </div>
            </div>
          )}

          {/* Media Section */}
          {activeSection.id === "media" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-2">
                  <ImageIcon className="w-3.5 h-3.5 text-primary" /> Service Image
                </label>

                {imagePreview ? (
                  <div className="relative group rounded-xl overflow-hidden border border-border/50">
                    <img src={imagePreview} alt="Preview" className="w-full h-44 object-cover" />
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
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                      isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-border/50 hover:border-primary/40 hover:bg-primary/[0.02]"
                    } ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 transition-all duration-300 ${
                      isDragging ? "bg-primary/10 scale-110" : "bg-muted/50"
                    }`}>
                      <ImageIcon className={`w-6 h-6 transition-colors duration-300 ${isDragging ? "text-primary" : "text-muted-foreground/40"}`} />
                    </div>
                    <p className="text-xs font-bold text-foreground">{isDragging ? "Drop image here" : "Click or drag to upload"}</p>
                    <p className="text-[10px] text-muted-foreground/50 mt-1 font-medium">PNG, JPG, GIF, WebP (max 5MB)</p>
                  </div>
                )}

                <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={(e) => handleImageSelect(e.target.files[0])} className="hidden" disabled={isLoading} />
                {errors.image && <p className="text-destructive text-[10px] mt-1 font-semibold">{errors.image}</p>}
              </div>
            </div>
          )}

          {/* Details Section */}
          {activeSection.id === "details" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary" /> Full Description
                  <span className="text-[9px] text-muted-foreground font-normal">(Optional)</span>
                </label>
                <Textarea name="fullDescription" value={formData.fullDescription} onChange={handleChange}
                  placeholder="Detailed description of your service..." rows={4}
                  className="resize-none rounded-lg text-xs bg-muted/20 border-border/50" disabled={isLoading} />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                  <List className="w-3.5 h-3.5 text-primary" /> Features
                  <span className="text-[9px] text-muted-foreground font-normal">(Optional)</span>
                </label>
                <Input name="features" value={formData.features} onChange={handleChange}
                  placeholder="Responsive Design, SEO Optimization..."
                  className="h-9 text-xs rounded-lg bg-muted/20 border-border/50" disabled={isLoading} />
                <p className="text-[10px] text-muted-foreground/50 mt-1 font-medium">Separate with commas</p>
                {formData.features && (
                  <div className="flex flex-wrap gap-1.5 mt-2 p-2.5 bg-muted/20 rounded-lg border border-border/30">
                    {formData.features.split(",").filter(f => f.trim()).map((feature, i) => (
                      <Badge key={i} variant="secondary"
                        className="text-[10px] px-2.5 py-1 bg-primary/10 text-primary border-0 rounded-full font-bold">
                        <CheckCircle className="w-2.5 h-2.5 mr-1" />{feature.trim()}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Extras Section */}
          {activeSection.id === "links" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                  <Star className="w-3.5 h-3.5 text-primary" /> Key Benefits
                  <span className="text-[9px] text-muted-foreground font-normal">(Optional)</span>
                </label>
                <Input name="keyBenefits" value={formData.keyBenefits} onChange={handleChange}
                  placeholder="Increased Revenue, Better UX..."
                  className="h-9 text-xs rounded-lg bg-muted/20 border-border/50" disabled={isLoading} />
                <p className="text-[10px] text-muted-foreground/50 mt-1 font-medium">Separate with commas</p>
                {formData.keyBenefits && (
                  <div className="flex flex-wrap gap-1.5 mt-2 p-2.5 bg-muted/20 rounded-lg border border-border/30">
                    {formData.keyBenefits.split(",").filter(b => b.trim()).map((benefit, i) => (
                      <Badge key={i} variant="secondary"
                        className="text-[10px] px-2.5 py-1 bg-primary/10 text-primary border-0 rounded-full font-bold">
                        {benefit.trim()}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-primary" /> What We Offer
                  <span className="text-[9px] text-muted-foreground font-normal">(Optional)</span>
                </label>
                <Input name="whatweoffer" value={formData.whatweoffer} onChange={handleChange}
                  placeholder="Custom Development, 24/7 Support..."
                  className="h-9 text-xs rounded-lg bg-muted/20 border-border/50" disabled={isLoading} />
                <p className="text-[10px] text-muted-foreground/50 mt-1 font-medium">Separate with commas</p>
                {formData.whatweoffer && (
                  <div className="flex flex-wrap gap-1.5 mt-2 p-2.5 bg-muted/20 rounded-lg border border-border/30">
                    {formData.whatweoffer.split(",").filter(w => w.trim()).map((item, i) => (
                      <Badge key={i} variant="secondary"
                        className="text-[10px] px-2.5 py-1 bg-primary/10 text-primary border-0 rounded-full font-bold">
                        {item.trim()}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
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