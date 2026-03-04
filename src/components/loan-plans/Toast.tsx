import { TrendingUp, AlertTriangle, X } from "lucide-react"
import type { ToastState } from "@/lib/loan-plans"

interface ToastProps {
  toast: NonNullable<ToastState>
  onDismiss: () => void
}

export function Toast({ toast, onDismiss }: ToastProps) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-medium shadow-lg transition-all animate-in slide-in-from-bottom-4 duration-300 ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
      {toast.type === "success" ? <TrendingUp size={16} /> : <AlertTriangle size={16} />}
      {toast.message}
      <button type="button" onClick={onDismiss} className="ml-2 rounded-full p-0.5 hover:bg-white/20">
        <X size={14} />
      </button>
    </div>
  )
}
