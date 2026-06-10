"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  X, Users, Mail, Phone, Calendar,
  FileText, Loader2, Code,
  Linkedin, Github, Twitter, Globe, Star
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getImageUrl } from "@/utils/getImageUrl"

export default function TeamViewModal({ isOpen, onClose, member }) {
  const [imgError, setImgError] = useState(false)
  const [imgLoading, setImgLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setMounted(true)
      setImgError(false)
      setImgLoading(true)
      const t = setTimeout(() => setVisible(true), 20)
      return () => clearTimeout(t)
    } else {
      setVisible(false)
      const t = setTimeout(() => setMounted(false), 350)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  if (!mounted || !member) return null

  const imageUrl = member.image ? getImageUrl(member.image) : null

  const formatDate = (d) => new Date(d).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric"
  })

  const hasSocial = !!(
    member.socialLinks?.linkedin ||
    member.socialLinks?.github ||
    member.socialLinks?.twitter ||
    member.socialLinks?.website
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-3xl max-h-[80vh] bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-350"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.97)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-primary/70 to-primary z-10" />

        <div
          className="flex items-center justify-between p-4 border-b border-border/50 shrink-0 transition-all duration-500"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(-8px)",
            transitionDelay: "60ms"
          }}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-black text-foreground tracking-tight truncate">{member.name}</h2>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-[10px] text-primary font-bold">{member.role}</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="text-[10px] text-muted-foreground/60 font-medium">{member.department}</span>
                {member.isFeatured && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <Badge className="text-[8px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-0 rounded-full font-bold gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-primary" /> Featured
                    </Badge>
                  </>
                )}
                {!member.isActive && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <Badge className="text-[8px] px-1.5 py-0 h-4 bg-muted text-muted-foreground border-0 rounded-full font-bold">
                      Inactive
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose}
            className="p-2 hover:bg-primary/5 rounded-xl transition-all duration-300 hover:rotate-90 shrink-0 ml-2">
            <X className="w-4 h-4 text-muted-foreground hover:text-primary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col lg:flex-row">
            <div
              className="lg:w-[40%] shrink-0 transition-all duration-500"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateX(0)" : "translateX(-12px)",
                transitionDelay: "100ms"
              }}
            >
              {imageUrl && !imgError ? (
                <div className="relative w-full h-56 lg:h-full min-h-[200px] bg-muted">
                  {imgLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground/40" />
                    </div>
                  )}
                  <Image
                    src={imageUrl}
                    alt={member.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className={`object-cover transition-all duration-700 ${imgLoading ? "opacity-0 scale-105" : "opacity-100 scale-100"}`}
                    onLoad={() => setImgLoading(false)}
                    onError={() => { setImgError(true); setImgLoading(false) }}
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-full h-56 lg:h-full min-h-[200px] bg-primary/5 flex items-center justify-center">
                  <span className="text-5xl font-black text-primary/20">
                    {member.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 p-4 space-y-4">
              {member.bio && (
                <div
                  className="transition-all duration-500"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(8px)",
                    transitionDelay: "140ms"
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <FileText className="w-3 h-3 text-primary" />
                    <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">Bio</span>
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed">{member.bio}</p>
                </div>
              )}

              {(member.email || member.phone) && (
                <div
                  className="transition-all duration-500"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(8px)",
                    transitionDelay: "190ms"
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Mail className="w-3 h-3 text-primary" />
                    <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">Contact</span>
                  </div>
                  <div className="space-y-1">
                    {member.email && (
                      <p className="text-[11px] text-foreground/70 flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-muted-foreground/40 shrink-0" /> {member.email}
                      </p>
                    )}
                    {member.phone && (
                      <p className="text-[11px] text-foreground/70 flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-muted-foreground/40 shrink-0" /> {member.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {Array.isArray(member.skills) && member.skills.length > 0 && (
                <div
                  className="transition-all duration-500"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(8px)",
                    transitionDelay: "240ms"
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <Code className="w-3 h-3 text-primary" />
                    <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">Skills</span>
                    <span className="text-[8px] text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded-full ml-1">
                      {member.skills.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {member.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-md border border-primary/15 bg-primary/8 px-2.5 py-1 text-[10px] font-bold leading-none text-primary"
                        style={{
                          opacity: visible ? 1 : 0,
                          transform: visible ? "translateY(0)" : "translateY(4px)",
                          transition: `all 0.3s ease ${260 + i * 30}ms`,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {hasSocial && (
                <div
                  className="transition-all duration-500"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(8px)",
                    transitionDelay: "300ms"
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <Globe className="w-3 h-3 text-primary" />
                    <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">Social Links</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {member.socialLinks?.linkedin && (
                      <a href={member.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/8 text-primary rounded-lg text-[11px] font-bold hover:bg-primary/15 transition-all duration-300 border border-primary/15 hover:-translate-y-0.5">
                        <Linkedin className="w-3 h-3" /> LinkedIn
                      </a>
                    )}
                    {member.socialLinks?.github && (
                      <a href={member.socialLinks.github} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground/5 text-foreground/70 rounded-lg text-[11px] font-bold hover:bg-foreground/10 transition-all duration-300 border border-foreground/10 hover:-translate-y-0.5">
                        <Github className="w-3 h-3" /> GitHub
                      </a>
                    )}
                    {member.socialLinks?.twitter && (
                      <a href={member.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/8 text-primary rounded-lg text-[11px] font-bold hover:bg-primary/15 transition-all duration-300 border border-primary/15 hover:-translate-y-0.5">
                        <Twitter className="w-3 h-3" /> Twitter
                      </a>
                    )}
                    {member.socialLinks?.website && (
                      <a href={member.socialLinks.website} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/8 text-primary rounded-lg text-[11px] font-bold hover:bg-primary/15 transition-all duration-300 border border-primary/15 hover:-translate-y-0.5">
                        <Globe className="w-3 h-3" /> Website
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div
                className="pt-2 border-t border-border/30 space-y-1 transition-all duration-500"
                style={{
                  opacity: visible ? 1 : 0,
                  transitionDelay: "360ms"
                }}
              >
                {member.order !== undefined && (
                  <div>
                    <span className="text-[9px] text-muted-foreground/30 font-semibold">ORDER: </span>
                    <span className="text-[9px] text-muted-foreground/40 font-mono">{member.order}</span>
                  </div>
                )}
                {member.joinedAt && (
                  <div>
                    <span className="text-[9px] text-muted-foreground/30 font-semibold">JOINED: </span>
                    <span className="text-[9px] text-muted-foreground/40 font-mono">{formatDate(member.joinedAt)}</span>
                  </div>
                )}
                {member.slug && (
                  <div>
                    <span className="text-[9px] text-muted-foreground/30 font-semibold">SLUG: </span>
                    <span className="text-[9px] text-muted-foreground/40 font-mono">{member.slug}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className="p-3 border-t border-border/50 bg-muted/10 flex justify-end shrink-0 transition-all duration-500"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(8px)",
            transitionDelay: "200ms"
          }}
        >
          <Button onClick={onClose} size="sm"
            className="h-8 px-5 text-xs rounded-lg font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}