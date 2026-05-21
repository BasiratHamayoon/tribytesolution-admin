"use client"

import { useState } from "react"
import Image from "next/image"
import {
  X, ExternalLink, Github, Code, Folder,
  Calendar, Image as ImageIcon, FileText, Loader2, Tag
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { getImageUrl } from "@/utils/getImageUrl"

export default function ProjectViewModal({ isOpen, onClose, project }) {
  const [imgError, setImgError] = useState(false)
  const [imgLoading, setImgLoading] = useState(true)

  if (!isOpen || !project) return null

  const imageUrl = project.image ? getImageUrl(project.image) : null

  const formatDate = (d) => new Date(d).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric"
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-300" onClick={onClose} />

      <div className="relative w-full max-w-3xl max-h-[80vh] bg-card border border-border/50 rounded-2xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-400 overflow-hidden flex flex-col">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-primary/70 to-primary z-10" />

        <div className="flex items-center justify-between p-4 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
              <Folder className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-black text-foreground tracking-tight truncate">{project.title}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-primary font-bold">{project.category}</span>
                {project.tag && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <Badge className="text-[8px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-0 rounded-full font-bold">
                      {project.tag}
                    </Badge>
                  </>
                )}
                {project.createdAt && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className="text-[9px] text-muted-foreground/40 font-medium flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      {formatDate(project.createdAt)}
                    </span>
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
            <div className="lg:w-[45%] shrink-0">
              {imageUrl && !imgError ? (
                <div className="relative w-full h-48 lg:h-full min-h-[200px] bg-muted">
                  {imgLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground/40" />
                    </div>
                  )}
                  <Image
                    src={imageUrl}
                    alt={project.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className={`object-cover transition-all duration-700 ${imgLoading ? "opacity-0 scale-105" : "opacity-100 scale-100"}`}
                    onLoad={() => setImgLoading(false)}
                    onError={() => { setImgError(true); setImgLoading(false) }}
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-full h-48 lg:h-full min-h-[200px] bg-muted/30 flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-[10px] text-muted-foreground/30 font-medium">No image</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 p-4 space-y-4">
              {project.description && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <FileText className="w-3 h-3 text-primary" />
                    <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">Description</span>
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed">{project.description}</p>
                </div>
              )}

              {project.fullDescription && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <FileText className="w-3 h-3 text-primary" />
                    <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">Full Description</span>
                  </div>
                  <p className="text-[11px] text-foreground/70 leading-relaxed whitespace-pre-wrap">{project.fullDescription}</p>
                </div>
              )}

              {project.techStack && project.techStack.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Code className="w-3 h-3 text-primary" />
                    <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">Tech Stack</span>
                    <span className="text-[8px] text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded-full ml-1">
                      {project.techStack.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {project.techStack.map((tech, i) => (
                      <span key={i} className="px-2.5 py-1 bg-primary/8 text-primary text-[10px] font-bold rounded-full border border-primary/15">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(project.liveLink || project.githubLink) && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <ExternalLink className="w-3 h-3 text-primary" />
                    <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">Links</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.liveLink && (
                      <a href={project.liveLink} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-[11px] font-bold hover:bg-primary/90 transition-all duration-300 shadow-sm shadow-primary/20 hover:shadow-md hover:-translate-y-0.5">
                        <ExternalLink className="w-3 h-3" />
                        Live Demo
                      </a>
                    )}
                    {project.githubLink && (
                      <a href={project.githubLink} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background rounded-lg text-[11px] font-bold hover:bg-foreground/90 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5">
                        <Github className="w-3 h-3" />
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
              )}

              {project.slug && (
                <div className="pt-2 border-t border-border/30">
                  <span className="text-[9px] text-muted-foreground/30 font-semibold">SLUG: </span>
                  <span className="text-[9px] text-muted-foreground/40 font-mono">{project.slug}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-border/50 bg-muted/10 flex justify-end shrink-0">
          <Button onClick={onClose} size="sm"
            className="h-8 px-5 text-xs rounded-lg font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}