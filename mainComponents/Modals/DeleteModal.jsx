"use client"

import { AlertTriangle, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function DeleteModal({
  isOpen, onClose, onConfirm,
  title = "Delete Item",
  message = "Are you sure? This action cannot be undone.",
  isLoading = false
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-300"
        onClick={() => !isLoading && onClose()} />
      <Card className="relative w-full max-w-sm border-border/50 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-primary/70 to-primary" />
        <CardContent className="p-6 text-center">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-sm font-black text-foreground mb-1.5">{title}</h3>
          <p className="text-muted-foreground text-xs mb-6 max-w-[260px] mx-auto leading-relaxed">{message}</p>
          <div className="flex gap-2.5">
            <Button variant="outline" onClick={onClose} disabled={isLoading}
              className="flex-1 h-9 text-xs rounded-lg font-bold border-border/50 hover:bg-muted/50">
              Cancel
            </Button>
            <Button onClick={onConfirm} disabled={isLoading}
              className="flex-1 h-9 text-xs rounded-lg font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
              {isLoading ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}