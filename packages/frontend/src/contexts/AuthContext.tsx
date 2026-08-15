import { useShallow } from 'zustand/react/shallow'
import { useAuthStore } from '../stores/authStore'

export function useAuth() {
  return useAuthStore(
    useShallow((s) => ({
      user: s.user,
      isAuthenticated: Boolean(s.user),
      login: s.login,
      logout: s.logout,
    })),
  )
}
