import { useShallow } from 'zustand/react/shallow'
import { useToastStore } from '../stores/toastStore'

export function useToast() {
  return useToastStore(useShallow((s) => ({ showToast: s.showToast })))
}
