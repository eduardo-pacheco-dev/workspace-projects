import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Snackbar, Alert, AlertColor } from '@mui/material'

interface ToastContextValue {
  showToast: (message: string, severity?: AlertColor) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; message: string; severity: AlertColor } | null>(null)

  const showToast = useCallback((message: string, severity: AlertColor = 'success') => {
    setToast({ id: Date.now(), message, severity })
  }, [])

  const handleClose = (_?: unknown, reason?: string) => {
    if (reason === 'clickaway') return
    setToast(null)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        key={toast?.id ?? undefined}
        open={!!toast}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={toast?.severity} variant="filled" sx={{ width: '100%' }}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
