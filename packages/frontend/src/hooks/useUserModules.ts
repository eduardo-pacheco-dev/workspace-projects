import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { DEFAULT_ROLE_MODULES } from '../pages/settings/roleModules'

export function useUserModules(): string[] {
  const { user } = useAuth()
  const [modules, setModules] = useState<string[]>(
    DEFAULT_ROLE_MODULES[user?.role ?? 'user'] ?? [],
  )

  useEffect(() => {
    if (!user || user.role === 'master') return
    let active = true
    api
      .get('/settings/my-modules')
      .then((res) => {
        if (active && Array.isArray(res.data)) setModules(res.data)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [user])

  return modules
}
