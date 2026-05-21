"use client"

import { useState, useEffect, useRef } from "react"
import { 
  X, Loader2, Folder, Type, Tag, FileText,
  Code, Link, Github, Save, Plus, Upload,
  Image as ImageIcon, Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

const CATEGORIES = [
  "Web Development", "Mobile App", "UI/UX Design", "E-commerce",
  "SaaS", "Dashboard", "Portfolio", "Landing Page", "Other"
]
const TAGS = ["Featured", "New", "Popular", "Coming Soon"]

export default function ProjectModal({ 
  isOpen, onClose, onSubmit, project = null, isLoading = false 
}) {
  const isEditing = !!project
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    title: "", slug: "", category: "", tag: "",
    description: "", fullDescription: "",
    techStack: [], liveLink: "", githubLink: ""
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [techInput, setTechInput] = useState("")
  const [errors, setErrors] = useState({})
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (isOpen && project) {
      setFormData({
        title: project.title || "", slug: project.slug || "",
        category: project.category || "", tag: project.tag || "",
        description: project.description || "", fullDescription: project.fullDescription || "",
        techStack: project.techStack || [],
        liveLink: project.liveLink || "", githubLink: project.githubLink || ""
      })
      setImagePreview(project.image || null)
      setImageFile(null); setRemoveImage(false)
    } else if (isOpen) {
      setFormData({
        title: "", slug: "", category: "", tag: "",
        description: "", fullDescription: "",
        techStack: [], liveLink: "", githubLink: ""
      })
      setImagePreview(null); setImageFile(null); setRemoveImage(false)
    }
    setErrors({}); setTechInput("")
  }, [isOpen, project])

  useEffect(() => {
    if (!isEditing && formData.title) {
      const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
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
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowed.includes(file.type)) { setErrors(prev => ({ ...prev, image: 'Invalid file type' })); return }
    if (file.size > 5 * 1024 * 1024) { setErrors(prev => ({ ...prev, image: 'Max 5MB' })); return }
    setErrors(prev => ({ ...prev, image: null }))
    setImageFile(file); setRemoveImage(false)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); handleImageSelect(e.dataTransfer.files[0]) }

  const handleRemoveImage = () => {
    setImageFile(null); setImagePreview(null); setRemoveImage(true)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleAddTech = () => {
    const tech = techInput.trim()
    if (tech && !formData.techStack.includes(tech)) {
      setFormData(prev => ({ ...prev, techStack: [...prev.techStack, tech] }))
      setTechInput("")
    }
  }

  const handleRemoveTech = (t) => {
    setFormData(prev => ({ ...prev, techStack: prev.techStack.filter(x => x !== t) }))
  }

  const handleTechKeyDown = (e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTech() } }

  const validate = () => {
    const errs = {}
    if (!formData.title.trim()) errs.title = "Title is required"
    if (!formData.category.trim()) errs.category = "Category is required"
    if (!formData.description.trim()) errs.description = "Description is required"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    const fd = new FormData()
    fd.append('title', formData.title)
    fd.append('slug', formData.slug)
    fd.append('category', formData.category)
    fd.append('tag', formData.tag)
    fd.append('description', formData.description)
    fd.append('fullDescription', formData.fullDescription)
    fd.append('techStack', JSON.stringify(formData.techStack))
    fd.append('liveLink', formData.liveLink)
    fd.append('githubLink', formData.githubLink)
    if (imageFile) fd.append('image', imageFile)
    if (removeImage) fd.append('removeImage', 'true')
    onSubmit(fd)
  }

  const handleClose = () => { if (!isLoading) onClose() }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-4 px-4">
      <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={handleClose} />
      
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Folder className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">
                {isEditing ? "Edit Project" : "Add New Project"}
              </h2>
              <p className="text-[10px] text-muted-foreground hidden sm:block">
                {isEditing ? "Update project details" : "Fill in the project information"}
              </p>
            </div>
          </div>
          <button onClick={handleClose} disabled={isLoading}
            className="p-1.5 hover:bg-accent rounded-lg transition-colors disabled:opacity-50">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[65vh] overflow-y-auto">
          
          {/* Image Upload */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" /> Project Image
            </label>
            
            {imagePreview ? (
              <div className="relative group rounded-lg overflow-hidden border border-border">
                <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" />
                <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isLoading}
                    className="p-2 bg-card rounded-lg hover:bg-accent transition-all">
                    <Upload className="w-4 h-4 text-foreground" />
                  </button>
                  <button type="button" onClick={handleRemoveImage} disabled={isLoading}
                    className="p-2 bg-card rounded-lg hover:bg-destructive/10 transition-all">
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
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300 ${
                  isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-accent/50'
                } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${
                  isDragging ? 'bg-primary/10' : 'bg-muted'
                }`}>
                  <ImageIcon className={`w-5 h-5 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <p className="text-xs font-medium text-foreground">{isDragging ? 'Drop image here' : 'Click or drag to upload'}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG, GIF, WebP (max 5MB)</p>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={(e) => handleImageSelect(e.target.files[0])} className="hidden" disabled={isLoading} />
            {errors.image && <p className="text-destructive text-[10px] mt-1">{errors.image}</p>}
          </div>

          {/* Title & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5">
                <Type className="w-3.5 h-3.5 text-muted-foreground" /> Title *
              </label>
              <Input name="title" value={formData.title} onChange={handleChange}
                placeholder="My Awesome Project"
                className={`h-9 text-xs rounded-lg ${errors.title ? 'border-destructive' : ''}`}
                disabled={isLoading} />
              {errors.title && <p className="text-destructive text-[10px] mt-0.5">{errors.title}</p>}
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5">
                <Link className="w-3.5 h-3.5 text-muted-foreground" /> Slug
              </label>
              <Input name="slug" value={formData.slug} onChange={handleChange}
                placeholder="my-awesome-project" className="h-9 text-xs rounded-lg" disabled={isLoading} />
            </div>
          </div>

          {/* Category & Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5">
                <Folder className="w-3.5 h-3.5 text-muted-foreground" /> Category *
              </label>
              <select name="category" value={formData.category} onChange={handleChange}
                className={`w-full h-9 px-2.5 border rounded-lg text-xs bg-card text-foreground focus:ring-1 focus:ring-primary outline-none ${
                  errors.category ? 'border-destructive' : 'border-border'
                }`} disabled={isLoading}>
                <option value="">Select category</option>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              {errors.category && <p className="text-destructive text-[10px] mt-0.5">{errors.category}</p>}
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5">
                <Tag className="w-3.5 h-3.5 text-muted-foreground" /> Tag
              </label>
              <select name="tag" value={formData.tag} onChange={handleChange}
                className="w-full h-9 px-2.5 border border-border rounded-lg text-xs bg-card text-foreground focus:ring-1 focus:ring-primary outline-none"
                disabled={isLoading}>
                <option value="">No tag</option>
                {TAGS.map(tag => <option key={tag} value={tag}>{tag}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" /> Short Description *
            </label>
            <Textarea name="description" value={formData.description} onChange={handleChange}
              placeholder="Brief overview of the project..." rows={2}
              className={`resize-none rounded-lg text-xs ${errors.description ? 'border-destructive' : ''}`}
              disabled={isLoading} />
            {errors.description && <p className="text-destructive text-[10px] mt-0.5">{errors.description}</p>}
          </div>

          {/* Full Description */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" /> Full Description
            </label>
            <Textarea name="fullDescription" value={formData.fullDescription} onChange={handleChange}
              placeholder="Detailed description..." rows={4}
              className="resize-none rounded-lg text-xs" disabled={isLoading} />
          </div>

          {/* Tech Stack */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5">
              <Code className="w-3.5 h-3.5 text-muted-foreground" /> Tech Stack
            </label>
            <div className="flex gap-2 mb-2">
              <Input value={techInput} onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={handleTechKeyDown} placeholder="e.g., React, Node.js"
                className="h-8 text-xs rounded-lg" disabled={isLoading} />
              <Button type="button" onClick={handleAddTech}
                disabled={!techInput.trim() || isLoading}
                variant="secondary" size="sm" className="h-8 px-3">
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
            {formData.techStack.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {formData.techStack.map((tech, i) => (
                  <Badge key={i} variant="secondary"
                    className="gap-1 text-[10px] px-2 py-0.5 bg-primary/10 text-primary border-0">
                    {tech}
                    <button type="button" onClick={() => handleRemoveTech(tech)}
                      disabled={isLoading} className="hover:text-primary/70 p-0">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5">
                <Link className="w-3.5 h-3.5 text-muted-foreground" /> Live Demo URL
              </label>
              <Input name="liveLink" type="url" value={formData.liveLink} onChange={handleChange}
                placeholder="https://myproject.com" className="h-9 text-xs rounded-lg" disabled={isLoading} />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1.5">
                <Github className="w-3.5 h-3.5 text-muted-foreground" /> GitHub URL
              </label>
              <Input name="githubLink" type="url" value={formData.githubLink} onChange={handleChange}
                placeholder="https://github.com/user/repo" className="h-9 text-xs rounded-lg" disabled={isLoading} />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 sm:p-5 border-t border-border bg-muted/30 rounded-b-xl">
          <Button type="button" onClick={handleClose} disabled={isLoading}
            variant="outline" size="sm" className="h-8 px-4 text-xs rounded-lg">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}
            size="sm" className="h-8 px-4 text-xs rounded-lg">
            {isLoading ? (
              <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />{isEditing ? "Updating..." : "Creating..."}</>
            ) : (
              <><Save className="w-3.5 h-3.5 mr-1.5" />{isEditing ? "Update Project" : "Create Project"}</>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}