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
      <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => !isLoading && onClose()} />
      <Card className="relative w-full max-w-sm border-border shadow-2xl animate-in zoom-in-95 duration-200">
        <CardContent className="p-5 text-center">
          <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <h3 className="text-sm font-bold text-foreground mb-1">{title}</h3>
          <p className="text-muted-foreground text-xs mb-5">{message}</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}
              className="flex-1 h-8 text-xs rounded-lg">Cancel</Button>
            <Button onClick={onConfirm} disabled={isLoading}
              className="flex-1 h-8 text-xs rounded-lg bg-destructive hover:bg-destructive/90 text-white">
              {isLoading ? (
                <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Deleting...</>
              ) : (
                <><Trash2 className="w-3.5 h-3.5 mr-1.5" />Delete</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}