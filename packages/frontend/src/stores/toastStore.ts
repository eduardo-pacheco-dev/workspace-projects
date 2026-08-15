import { create } from 'zustand'
import { AlertColor } from '@mui/material'

export interface Toast {
  id: number
  message: string
  severity: AlertColor
}

interface ToastState {
  toast: Toast | null
  showToast: (message: string, severity?: AlertColor) => void
  hideToast: () => void
}

export const useToastStore = create<ToastState>((set) => ({
  toast: null,
  showToast: (message, severity = 'success') =>
    set({ toast: { id: Date.now(), message, severity } }),
  hideToast: () => set({ toast: null }),
}))
