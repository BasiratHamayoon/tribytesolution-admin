"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { 
  Briefcase, 
  FileText, 
  Link2, 
  DollarSign, 
  Tag, 
  Star,
  Plus,
  Save,
  Loader2,
  X,
  Sparkles,
  List,
  Smile,
  Layers,
  Image as ImageIcon,
  Upload,
  Trash2,
  CheckCircle
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"

const initialFormData = {
  title: "",
  slug: "",
  description: "",
  fullDescription: "",
  icon: "💼",
  price: "",
  features: "",
  keyBenefits: "",
  whatweoffer: "",
  category: "Development",
  popular: false
}

const categoryOptions = [
  "Development",
  "Design",
  "Marketing",
  "Consulting",
  "Support",
  "Other"
]

const iconOptions = ["💼", "🚀", "💻", "🎨", "📱", "🔧", "⚡", "🌐", "📊", "🛠️", "✨", "🎯", "📈", "🔒", "☁️", "🤖"]

export default function ServiceModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  service = null,
  isLoading = false 
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const [showIconPicker, setShowIconPicker] = useState(false)
  
  // Image states
  const fileInputRef = useRef(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const isEditing = !!service

  // Animation handling
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true)
        })
      })
      document.body.style.overflow = 'hidden'
    } else {
      setIsAnimating(false)
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 300)
      document.body.style.overflow = 'unset'
      return () => clearTimeout(timer)
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Populate form when editing
  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title || "",
        slug: service.slug || "",
        description: service.description || "",
        fullDescription: service.fullDescription || "",
        icon: service.icon || "💼",
        price: service.price || "",
        features: service.features?.join(", ") || "",
        keyBenefits: service.keyBenefits?.join(", ") || "",
        whatweoffer: service.whatweoffer?.join(", ") || "",
        category: service.category || "Development",
        popular: service.popular || false
      })
      setImagePreview(service.image || null)
      setImageFile(null)
      setRemoveImage(false)
    } else {
      setFormData(initialFormData)
      setImagePreview(null)
      setImageFile(null)
      setRemoveImage(false)
    }
    setErrors({})
    setShowIconPicker(false)
    setIsDragging(false)
  }, [service, isOpen])

  // Handle escape key
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape' && !isLoading) handleClose()
  }, [isLoading])

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
    }
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, handleEscape])

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }

  const handleTitleChange = (title) => {
    setFormData({
      ...formData,
      title,
      slug: isEditing ? formData.slug : generateSlug(title)
    })
    if (errors.title) setErrors({ ...errors, title: "" })
  }

  // Image handling
  const handleImageSelect = (file) => {
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, image: 'Please select a valid image file (JPEG, PNG, GIF, WebP)' }))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }))
      return
    }

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
    const file = e.dataTransfer.files[0]
    handleImageSelect(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setRemoveImage(true)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = "Title is required"
    if (!formData.slug.trim()) newErrors.slug = "Slug is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    // Create FormData for submission
    const submitData = new FormData()
    
    submitData.append('title', formData.title)
    submitData.append('slug', formData.slug)
    submitData.append('description', formData.description)
    submitData.append('fullDescription', formData.fullDescription)
    submitData.append('icon', formData.icon)
    submitData.append('price', formData.price)
    submitData.append('category', formData.category)
    submitData.append('popular', formData.popular.toString())
    submitData.append('features', formData.features)
    submitData.append('keyBenefits', formData.keyBenefits)
    submitData.append('whatweoffer', formData.whatweoffer)
    
    if (imageFile) {
      submitData.append('image', imageFile)
    }
    
    if (removeImage) {
      submitData.append('removeImage', 'true')
    }

    await onSubmit(submitData)
  }

  const handleClose = () => {
    if (isLoading) return
    setFormData(initialFormData)
    setErrors({})
    setShowIconPicker(false)
    setImageFile(null)
    setImagePreview(null)
    setRemoveImage(false)
    onClose()
  }

  if (!isVisible) return null

  const getDelay = (index) => `${100 + index * 50}ms`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        className={`relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col transition-all duration-300 ease-out ${
          isAnimating 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-8'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 bg-slate-950 rounded-xl shadow-lg shadow-slate-950/20 transition-all duration-500 ${
              isAnimating ? 'rotate-0 scale-100' : '-rotate-12 scale-75'
            }`}>
              {isEditing ? (
                <Sparkles className="w-5 h-5 text-blue-400" />
              ) : (
                <Briefcase className="w-5 h-5 text-blue-400" />
              )}
            </div>
            <div className={`transition-all duration-300 delay-100 ${
              isAnimating ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            }`}>
              <h2 className="text-lg sm:text-xl font-bold text-slate-950">
                {isEditing ? "Edit Service" : "Add New Service"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                {isEditing ? "Update service details" : "Fill in the details below"}
              </p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            disabled={isLoading}
            className={`p-2 hover:bg-slate-100 rounded-xl transition-all duration-300 disabled:opacity-50 ${
              isAnimating ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'
            }`}
          >
            <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">
            
            {/* Image Upload */}
            <div 
              className={`transition-all duration-300 ${
                isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: getDelay(0) }}
            >
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <ImageIcon className="w-4 h-4 text-violet-500" />
                Service Image
              </label>
              
              {imagePreview ? (
                <div className="relative group rounded-xl overflow-hidden border border-slate-200">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      className="p-2.5 bg-white rounded-xl hover:bg-blue-50 transition-all hover:scale-105"
                    >
                      <Upload className="w-5 h-5 text-slate-700" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={isLoading}
                      className="p-2.5 bg-white rounded-xl hover:bg-red-50 transition-all hover:scale-105"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500 text-white text-xs font-medium rounded-lg shadow-lg">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Uploaded
                  </div>
                </div>
              ) : (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => !isLoading && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                    isDragging 
                      ? 'border-blue-400 bg-blue-50 scale-[1.02]' 
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3 transition-all ${
                    isDragging ? 'bg-blue-100 scale-110' : 'bg-slate-100'
                  }`}>
                    <ImageIcon className={`w-7 h-7 transition-colors ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    {isDragging ? 'Drop image here' : 'Click or drag to upload'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG, GIF, WebP (max 5MB)</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={(e) => handleImageSelect(e.target.files[0])}
                className="hidden"
                disabled={isLoading}
              />
              
              {errors.image && (
                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                  <X className="w-3 h-3" />
                  {errors.image}
                </p>
              )}
            </div>

            {/* Icon & Title Row */}
            <div 
              className={`flex flex-col sm:flex-row gap-4 transition-all duration-300 ${
                isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: getDelay(1) }}
            >
              {/* Icon Picker */}
              <div className="shrink-0">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <Smile className="w-4 h-4 text-amber-500" />
                  Icon
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="w-16 h-16 text-3xl bg-slate-100 hover:bg-slate-200 rounded-xl border-2 border-slate-200 hover:border-blue-400 transition-all flex items-center justify-center"
                  >
                    {formData.icon}
                  </button>
                  
                  {/* Icon Dropdown */}
                  {showIconPicker && (
                    <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-xl shadow-xl border border-slate-200 z-20 animate-in fade-in zoom-in-95 duration-200">
                      <div className="grid grid-cols-4 gap-2">
                        {iconOptions.map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, icon })
                              setShowIconPicker(false)
                            }}
                            className={`w-10 h-10 text-xl rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center ${
                              formData.icon === icon ? 'bg-blue-100 ring-2 ring-blue-400' : 'bg-slate-50'
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                      <Input
                        placeholder="Or type custom..."
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        className="mt-2 h-9 text-center"
                        maxLength={2}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <div className="flex-1">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  Service Title *
                </label>
                <Input
                  placeholder="Web Development"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  disabled={isLoading}
                  className={`h-11 rounded-xl border-slate-200 focus-visible:ring-blue-400 ${
                    errors.title ? 'border-red-500 focus-visible:ring-red-500' : ''
                  }`}
                />
                {errors.title && (
                  <p className="text-xs text-red-500 mt-1 animate-in slide-in-from-top duration-200">
                    {errors.title}
                  </p>
                )}
              </div>
            </div>

            {/* Slug & Price */}
            <div 
              className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-300 ${
                isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: getDelay(2) }}
            >
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <Link2 className="w-4 h-4 text-blue-400" />
                  Slug {!isEditing && "(auto-generated)"}
                </label>
                <Input
                  placeholder="web-development"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  disabled={isLoading}
                  className={`h-11 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-blue-400 ${
                    errors.slug ? 'border-red-500 focus-visible:ring-red-500' : ''
                  }`}
                />
                {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug}</p>}
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  Price
                </label>
                <Input
                  placeholder="Starting at $5,000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  disabled={isLoading}
                  className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-400"
                />
              </div>
            </div>

            {/* Category & Popular */}
            <div 
              className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-300 ${
                isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: getDelay(3) }}
            >
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <Layers className="w-4 h-4 text-violet-500" />
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  disabled={isLoading}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  Visibility
                </label>
                <div 
                  onClick={() => !isLoading && setFormData({ ...formData, popular: !formData.popular })}
                  className={`h-11 px-4 rounded-xl border-2 flex items-center gap-3 cursor-pointer transition-all duration-200 ${
                    formData.popular 
                      ? 'border-amber-400 bg-amber-50' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    formData.popular 
                      ? 'border-amber-500 bg-amber-500' 
                      : 'border-slate-300 bg-white'
                  }`}>
                    {formData.popular && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm font-medium ${formData.popular ? 'text-amber-700' : 'text-slate-600'}`}>
                    Mark as Popular
                  </span>
                  {formData.popular && (
                    <span className="ml-auto px-2 py-0.5 bg-amber-400 text-amber-900 text-xs font-bold rounded-full">
                      ⭐
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Short Description */}
            <div 
              className={`transition-all duration-300 ${
                isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: getDelay(4) }}
            >
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <FileText className="w-4 h-4 text-blue-400" />
                Short Description *
              </label>
              <Textarea
                placeholder="A brief overview of your service..."
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value })
                  if (errors.description) setErrors({ ...errors, description: "" })
                }}
                disabled={isLoading}
                className={`min-h-[80px] rounded-xl border-slate-200 focus-visible:ring-blue-400 resize-none ${
                  errors.description ? 'border-red-500 focus-visible:ring-red-500' : ''
                }`}
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
              <p className="text-xs text-slate-400 mt-1">{formData.description.length}/200 characters recommended</p>
            </div>

            {/* Full Description */}
            <div 
              className={`transition-all duration-300 ${
                isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: getDelay(5) }}
            >
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <FileText className="w-4 h-4 text-slate-400" />
                Full Description
                <span className="text-xs text-slate-400 font-normal">(Optional)</span>
              </label>
              <Textarea
                placeholder="Detailed description for the service page..."
                value={formData.fullDescription}
                onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                disabled={isLoading}
                className="min-h-[100px] rounded-xl border-slate-200 focus-visible:ring-blue-400 resize-none"
              />
            </div>

            {/* Features */}
            <div 
              className={`transition-all duration-300 ${
                isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: getDelay(6) }}
            >
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <List className="w-4 h-4 text-emerald-500" />
                Features
              </label>
              <Input
                placeholder="Responsive Design, SEO Optimization, Fast Loading..."
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                disabled={isLoading}
                className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-400"
              />
              <p className="text-xs text-slate-400 mt-1">Separate features with commas</p>
              
              {/* Features Preview */}
              {formData.features && (
                <div className="flex flex-wrap gap-1.5 mt-3 animate-in fade-in duration-200">
                  {formData.features.split(',').filter(f => f.trim()).map((feature, i) => (
                    <span 
                      key={i}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-lg border border-emerald-100 animate-in zoom-in duration-200"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      ✓ {feature.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Key Benefits */}
            <div 
              className={`transition-all duration-300 ${
                isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: getDelay(7) }}
            >
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Star className="w-4 h-4 text-blue-500" />
                Key Benefits
                <span className="text-xs text-slate-400 font-normal">(Optional)</span>
              </label>
              <Input
                placeholder="Increased Revenue, Better User Experience, Faster Time to Market..."
                value={formData.keyBenefits}
                onChange={(e) => setFormData({ ...formData, keyBenefits: e.target.value })}
                disabled={isLoading}
                className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-400"
              />
              <p className="text-xs text-slate-400 mt-1">Separate with commas</p>
            </div>

            {/* What We Offer */}
            <div 
              className={`transition-all duration-300 ${
                isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: getDelay(8) }}
            >
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Briefcase className="w-4 h-4 text-violet-500" />
                What We Offer
                <span className="text-xs text-slate-400 font-normal">(Optional)</span>
              </label>
              <Input
                placeholder="Custom Development, 24/7 Support, Free Consultations..."
                value={formData.whatweoffer}
                onChange={(e) => setFormData({ ...formData, whatweoffer: e.target.value })}
                disabled={isLoading}
                className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-400"
              />
              <p className="text-xs text-slate-400 mt-1">Separate with commas</p>
            </div>
          </div>

          {/* Footer */}
          <div 
            className={`flex flex-col sm:flex-row gap-3 p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50 transition-all duration-300 ${
              isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: getDelay(9) }}
          >
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
              className="rounded-xl border-slate-200 hover:bg-slate-100 h-12 font-medium order-2 sm:order-1 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 bg-slate-950 hover:bg-slate-800 text-white rounded-xl h-12 shadow-lg shadow-slate-950/20 font-medium order-1 sm:order-2 disabled:opacity-70 transition-all hover:shadow-slate-950/30 hover:scale-[1.01] active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditing ? "Updating..." : "Saving..."}
                </>
              ) : (
                <>
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2 text-blue-400" />
                      Update Service
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2 text-blue-400" />
                      Save Service
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}