"use client"

import { useState, useRef } from "react"
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  Link as LinkIcon
} from "lucide-react"

export default function ImageUpload({
  value,
  onChange,
  onUploadComplete,
  disabled = false,
  className = ""
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState(null)
  const [useUrl, setUseUrl] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const fileInputRef = useRef(null)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

  const handleFileSelect = async (file) => {
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    setError(null)
    setIsUploading(true)

    const formData = new FormData()
    formData.append('image', file)

    try {
      const token = localStorage.getItem('adminToken')
      
      const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed')
      }
      
      onChange(data.data.url)
      if (onUploadComplete) {
        onUploadComplete(data.data)
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    handleFileSelect(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files[0]
    handleFileSelect(file)
  }

  const handleRemove = () => {
    onChange("")
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim())
      setUrlInput("")
      setUseUrl(false)
      setError(null)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleUrlSubmit()
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Toggle between upload and URL */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setUseUrl(false)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            !useUrl 
              ? 'bg-slate-900 text-white' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Upload className="w-3 h-3 inline mr-1.5" />
          Upload
        </button>
        <button
          type="button"
          onClick={() => setUseUrl(true)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            useUrl 
              ? 'bg-slate-900 text-white' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <LinkIcon className="w-3 h-3 inline mr-1.5" />
          URL
        </button>
      </div>

      {/* URL Input Mode */}
      {useUrl ? (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            disabled={!urlInput.trim()}
            className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Add
          </button>
        </div>
      ) : (
        <>
          {/* Preview */}
          {value ? (
            <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              <img 
                src={value} 
                alt="Preview" 
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder-image.png'
                  e.target.onerror = null
                }}
              />
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled || isUploading}
                  className="p-2.5 bg-white rounded-xl hover:bg-blue-50 transition-all hover:scale-105"
                  title="Change Image"
                >
                  <Upload className="w-5 h-5 text-slate-700" />
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={disabled || isUploading}
                  className="p-2.5 bg-white rounded-xl hover:bg-red-50 transition-all hover:scale-105"
                  title="Remove Image"
                >
                  <X className="w-5 h-5 text-red-500" />
                </button>
              </div>
              <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500 text-white text-xs font-medium rounded-lg shadow-lg">
                <CheckCircle className="w-3.5 h-3.5" />
                Uploaded
              </div>
            </div>
          ) : (
            /* Drop Zone */
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragging 
                  ? 'border-blue-400 bg-blue-50 scale-[1.02]' 
                  : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
              } ${disabled || isUploading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {isUploading ? (
                <div className="space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
                    <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Uploading...</p>
                    <p className="text-xs text-slate-500 mt-1">Please wait</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
                    isDragging ? 'bg-blue-100 scale-110' : 'bg-slate-100'
                  }`}>
                    <ImageIcon className={`w-7 h-7 transition-colors ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {isDragging ? 'Drop image here' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      PNG, JPG, GIF, WebP (max 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 text-red-500 text-sm bg-red-50 px-3 py-2.5 rounded-xl border border-red-100">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  )
}