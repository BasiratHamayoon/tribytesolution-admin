"use client"

import { useEffect, useState } from "react"
import {
  X, Loader2, Users, Mail, Phone, FileText,
  Download, CheckCircle, XCircle, Clock, Star, Eye
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAppContext } from "../../app/AppContext"

const STATUS_CONFIG = {
  Pending: {
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    icon: Clock
  },
  Reviewed: {
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    icon: Eye
  },
  Shortlisted: {
    color: "bg-primary/10 text-primary",
    icon: Star
  },
  Rejected: {
    color: "bg-destructive/10 text-destructive",
    icon: XCircle
  },
  Hired: {
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    icon: CheckCircle
  },
}

const STATUS_ACTIONS = ["Reviewed", "Shortlisted", "Hired", "Rejected"]

export default function ApplicantsDrawer({ isOpen, onClose, job }) {
  const { fetchApplicants, updateApplicantStatus } = useAppContext()
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    if (isOpen && job) loadApplicants()
  }, [isOpen, job])

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = "unset"
    return () => { document.body.style.overflow = "unset" }
  }, [isOpen])

  const loadApplicants = async () => {
    setLoading(true)
    try {
      const response = await fetchApplicants(job._id)
      setApplicants(response.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (applicantId, status) => {
    setUpdating(applicantId)
    try {
      await updateApplicantStatus(job._id, applicantId, status)
      await loadApplicants()
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative w-full sm:max-w-lg bg-card h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-border/50">
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-primary/70 to-primary z-10" />

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 shrink-0 pt-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-foreground tracking-tight">Applicants</h2>
              <p className="text-[10px] text-muted-foreground/60 font-medium truncate max-w-[220px]">
                {job?.title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {applicants.length > 0 && (
              <Badge className="text-[9px] px-2 py-0.5 bg-primary/10 text-primary border-0 rounded-full font-bold">
                {applicants.length} total
              </Badge>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-primary/5 rounded-xl transition-all duration-300 hover:rotate-90"
            >
              <X className="w-4 h-4 text-muted-foreground hover:text-primary" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-[11px] text-muted-foreground font-medium">Loading applicants...</p>
            </div>
          ) : applicants.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-primary/30" />
              </div>
              <p className="text-xs font-bold text-foreground">No applicants yet</p>
              <p className="text-[10px] text-muted-foreground/50">Applications will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applicants.map((applicant) => {
                const config = STATUS_CONFIG[applicant.status] || STATUS_CONFIG.Pending
                const StatusIcon = config.icon

                return (
                  <Card key={applicant._id} className="border-border/50 hover:border-primary/20 transition-colors duration-200 overflow-hidden">
                    <div className={`h-[2px] ${
                      applicant.status === "Hired"
                        ? "bg-emerald-500/40"
                        : applicant.status === "Rejected"
                          ? "bg-destructive/30"
                          : applicant.status === "Shortlisted"
                            ? "bg-primary/40"
                            : "bg-muted/50"
                    }`} />
                    <CardContent className="p-3">
                      {/* Name + Status */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-black text-foreground truncate">{applicant.name}</h4>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 mt-0.5">
                            <Mail className="w-2.5 h-2.5" />
                            <span className="truncate">{applicant.email}</span>
                          </div>
                          {applicant.phone && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 mt-0.5">
                              <Phone className="w-2.5 h-2.5" />
                              {applicant.phone}
                            </div>
                          )}
                        </div>
                        <Badge className={`text-[8px] px-1.5 py-0 h-4 border-0 gap-0.5 shrink-0 ml-2 ${config.color}`}>
                          <StatusIcon className="w-2.5 h-2.5" />
                          {applicant.status}
                        </Badge>
                      </div>

                      {/* Cover Letter */}
                      {applicant.coverLetter && (
                        <div className="mb-2">
                          <div className="flex items-center gap-1 mb-1">
                            <FileText className="w-2.5 h-2.5 text-primary" />
                            <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">Cover Letter</span>
                          </div>
                          <p className="text-[10px] text-foreground/70 line-clamp-2 bg-muted/30 p-2 rounded-lg leading-relaxed">
                            {applicant.coverLetter}
                          </p>
                        </div>
                      )}

                      {/* Resume */}
                      {applicant.resumeUrl && (
                        <a
                          href={applicant.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-[10px] font-bold text-primary hover:text-primary/80 mb-2 w-fit hover:bg-primary/5 px-2 py-0.5 rounded-full transition-all duration-200"
                        >
                          <Download className="w-3 h-3" />
                          Download Resume
                        </a>
                      )}

                      <Separator className="my-2 opacity-50" />

                      {/* Status Actions */}
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[9px] text-muted-foreground font-bold mr-0.5">Update:</span>
                        {STATUS_ACTIONS.map(status => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(applicant._id, status)}
                            disabled={updating === applicant._id || applicant.status === status}
                            className={`px-2 py-0.5 text-[8px] font-bold rounded-full transition-all duration-200 disabled:opacity-50 ${
                              applicant.status === status
                                ? "bg-primary/10 text-primary"
                                : "bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                            }`}
                          >
                            {updating === applicant._id ? (
                              <Loader2 className="w-2.5 h-2.5 animate-spin inline" />
                            ) : status}
                          </button>
                        ))}
                      </div>

                      <p className="text-[9px] text-muted-foreground/40 mt-2 font-medium">
                        Applied {new Date(applicant.appliedAt).toLocaleDateString("en-US", {
                          year: "numeric", month: "short", day: "numeric"
                        })}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border/50 bg-muted/10 shrink-0">
          <p className="text-[9px] text-muted-foreground/40 text-center font-medium">
            {applicants.length} applicant{applicants.length !== 1 ? "s" : ""} for {job?.title}
          </p>
        </div>
      </div>
    </div>
  )
}