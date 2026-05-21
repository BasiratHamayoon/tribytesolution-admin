"use client"

import { useEffect, useState, useCallback } from "react"
import { X } from "lucide-react"

export default function BaseModal({ 
  isOpen, 
  onClose, 
  title, 
  subtitle,
  icon: Icon,
  children, 
  size = "md",
  showCloseButton = true 
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Handle open animation
  useEffect(() => {
    if (isOpen) {
      // Mount the modal
      setIsVisible(true)
      // Trigger animation after a small delay (for CSS transition to work)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true)
        })
      })
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
    } else {
      // Start closing animation
      setIsAnimating(false)
      // Wait for animation to complete before unmounting
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 300) // Match this with CSS transition duration
      document.body.style.overflow = 'unset'
      return () => clearTimeout(timer)
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Handle escape key
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
    }
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, handleEscape])

  // Don't render if not visible
  if (!isVisible) return null

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-6xl"
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-slate-950/50 backdrop-blur-sm transition-all duration-300 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className={`relative w-full ${sizeClasses[size]} bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col transition-all duration-300 ease-out ${
          isAnimating 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={`p-2.5 bg-slate-950 rounded-xl shadow-lg shadow-slate-950/20 transition-transform duration-500 ${
                isAnimating ? 'rotate-0 scale-100' : '-rotate-12 scale-75'
              }`}>
                <Icon className="w-5 h-5 text-blue-400" />
              </div>
            )}
            <div className={`transition-all duration-300 delay-100 ${
              isAnimating ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            }`}>
              <h2 className="text-lg sm:text-xl font-bold text-slate-950">{title}</h2>
              {subtitle && <p className="text-xs sm:text-sm text-slate-400">{subtitle}</p>}
            </div>
          </div>
          {showCloseButton && (
            <button 
              onClick={onClose}
              className={`p-2 hover:bg-slate-100 rounded-xl transition-all duration-300 ${
                isAnimating ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'
              }`}
            >
              <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>

        {/* Body - Scrollable */}
        <div className={`flex-1 overflow-y-auto transition-all duration-300 delay-75 ${
          isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          {children}
        </div>
      </div>
    </div>
  )
}