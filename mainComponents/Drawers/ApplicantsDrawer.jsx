"use client"

import { useEffect, useState } from "react"
import {
  X, Loader2, Users, Mail, Phone, FileText,
  Download, CheckCircle, XCircle, Clock, Star, Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAppContext } from "../../app/AppContext"

const STATUS_CONFIG = {
  Pending: { color: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400", icon: Clock },
  Reviewed: { color: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400", icon: Eye },
  Shortlisted: { color: "bg-primary/10 text-primary", icon: Star },
  Rejected: { color: "bg-destructive/10 text-destructive", icon: XCircle },
  Hired: { color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400", icon: CheckCircle },
}

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
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleStatusChange = async (applicantId, status) => {
    setUpdating(applicantId)
    try {
      await updateApplicantStatus(job._id, applicantId, status)
      loadApplicants()
    } catch (err) { console.error(err) }
    finally { setUpdating(null) }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg bg-card h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-border">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Applicants</h2>
              <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">{job?.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-accent rounded-lg transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : applicants.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No applicants yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applicants.map((applicant) => {
                const config = STATUS_CONFIG[applicant.status] || STATUS_CONFIG.Pending
                const StatusIcon = config.icon
                return (
                  <Card key={applicant._id} className="border-border">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-foreground truncate">{applicant.name}</h4>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                            <Mail className="w-3 h-3" /> {applicant.email}
                          </div>
                          {applicant.phone && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                              <Phone className="w-3 h-3" /> {applicant.phone}
                            </div>
                          )}
                        </div>
                        <Badge className={`text-[8px] px-1.5 py-0 h-4 border-0 gap-0.5 ${config.color}`}>
                          <StatusIcon className="w-2.5 h-2.5" /> {applicant.status}
                        </Badge>
                      </div>

                      {applicant.coverLetter && (
                        <div className="mb-2">
                          <p className="text-[10px] font-semibold text-muted-foreground mb-0.5">Cover Letter</p>
                          <p className="text-[10px] text-muted-foreground line-clamp-2 bg-muted p-2 rounded-md">{applicant.coverLetter}</p>
                        </div>
                      )}

                      {applicant.resumeUrl && (
                        <a href={applicant.resumeUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] font-medium text-primary hover:text-primary/80 mb-2">
                          <Download className="w-3 h-3" /> Download Resume
                        </a>
                      )}

                      <Separator className="my-2" />

                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-muted-foreground mr-1">Update:</span>
                        {["Reviewed", "Shortlisted", "Hired", "Rejected"].map(status => (
                          <button key={status} onClick={() => handleStatusChange(applicant._id, status)}
                            disabled={updating === applicant._id || applicant.status === status}
                            className={`px-1.5 py-0.5 text-[8px] font-semibold rounded transition-colors disabled:opacity-50 ${
                              applicant.status === status
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                            }`}>
                            {updating === applicant._id ? "..." : status}
                          </button>
                        ))}
                      </div>

                      <p className="text-[9px] text-muted-foreground/60 mt-1.5">
                        Applied: {new Date(applicant.appliedAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}