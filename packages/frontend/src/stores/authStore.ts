import { create } from 'zustand'
import api from '../services/api'

export interface User {
  id: string
  name: string
  email: string
  role?: string
  companyId?: number | null
  companyName?: string | null
}

const USER_KEY = 'user'
const TOKEN_KEY = 'token'

function readStoredUser(): User | null {
  try {
    const stored = localStorage.getItem(USER_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function persistSession(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

interface AuthState {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: readStoredUser(),
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    const { access_token, user } = response.data
    persistSession(access_token, user)
    set({ user })
  },
  logout: () => {
    clearSession()
    set({ user: null })
  },
  refreshUser: async () => {
    const stored = readStoredUser()
    if (!stored?.id) return
    api
      .get(`/users/${stored.id}`)
      .then((res) => {
        set({ user: res.data })
        localStorage.setItem(USER_KEY, JSON.stringify(res.data))
      })
      .catch(() => {})
  },
}))
