"use client"
import { useCallback } from "react"

export type ToastVariant = "default" | "destructive" | "success"

export interface ToastOpts {
  message: string
  variant?: ToastVariant
  duration?: number // ms
}

export function useToast() {
  const toast = useCallback((opts: ToastOpts) => {
    if (typeof window === "undefined") return
    window.dispatchEvent(new CustomEvent("_ps_toast", { detail: opts }))
  }, [])

  return { toast }
}
