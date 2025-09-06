"use client"
import { useEffect, useState } from "react"
import { ToastVariant } from "./use-toast"
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
  isVisible: boolean
  isExiting: boolean
}

export function ToastView() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    const handler = (e: Event) => {
      // @ts-ignore custom event
      const { message, variant = "default", duration = 5000 } = e.detail
      const newItem: ToastItem = {
        id: Date.now(),
        message,
        variant,
        isVisible: false,
        isExiting: false
      }
      
      setItems((prev) => [...prev, newItem])
      
      // Trigger entrance animation
      setTimeout(() => {
        setItems((prev) => 
          prev.map(item => 
            item.id === newItem.id ? { ...item, isVisible: true } : item
          )
        )
      }, 10)
      
      // Start exit animation before removal
      setTimeout(() => {
        setItems((prev) => 
          prev.map(item => 
            item.id === newItem.id ? { ...item, isExiting: true } : item
          )
        )
      }, duration - 300)
      
      // Remove item
      setTimeout(() => {
        setItems((prev) => prev.filter(item => item.id !== newItem.id))
      }, duration)
    }
    window.addEventListener("_ps_toast", handler)
    return () => window.removeEventListener("_ps_toast", handler)
  }, [])

  const removeToast = (id: number) => {
    setItems((prev) => 
      prev.map(item => 
        item.id === id ? { ...item, isExiting: true } : item
      )
    )
    setTimeout(() => {
      setItems((prev) => prev.filter(item => item.id !== id))
    }, 300)
  }

  const getIcon = (variant: ToastVariant) => {
    switch (variant) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      case "destructive":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getStyles = (variant: ToastVariant) => {
    switch (variant) {
      case "success":
        return "bg-white border-emerald-200 shadow-emerald-100"
      case "destructive":
        return "bg-white border-red-200 shadow-red-100"
      default:
        return "bg-white border-blue-200 shadow-blue-100"
    }
  }

  return (
    <div className="fixed bottom-4 right-4 space-y-3 z-[100] max-w-sm w-full pointer-events-none">
      {items.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "transform transition-all duration-300 ease-out pointer-events-auto",
            "bg-white rounded-xl border shadow-lg backdrop-blur-sm",
            "p-4 pr-12 min-h-[60px] flex items-center",
            getStyles(toast.variant),
            toast.isVisible && !toast.isExiting
              ? "translate-x-0 opacity-100 scale-100"
              : "translate-x-full opacity-0 scale-95"
          )}
          style={{
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}
        >
          <div className="flex items-start space-x-3 w-full">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(toast.variant)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 leading-relaxed">
                {toast.message}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => removeToast(toast.id)}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-full p-1 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
          
          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 rounded-b-xl overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all ease-linear duration-[5000ms]",
                toast.variant === "success" ? "bg-emerald-500" :
                toast.variant === "destructive" ? "bg-red-500" : "bg-blue-500",
                toast.isVisible ? "w-0" : "w-full"
              )}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
