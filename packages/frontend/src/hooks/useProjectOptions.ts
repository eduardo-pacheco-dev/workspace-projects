import { useState, useEffect } from 'react'
import api from '../services/api'
import { normalizeList } from '../utils/list'

interface ProjectOptions {
  clients: string[]
  users: string[]
}

export default function useProjectOptions(open: boolean, currentUserName?: string): ProjectOptions {
  const [clients, setClients] = useState<string[]>([])
  const [users, setUsers] = useState<string[]>([])

  useEffect(() => {
    if (!open) return

    api
      .get('/clients', { params: { limit: 1000, sortBy: 'nome', sortOrder: 'ASC' } })
      .then((res) => {
        const data = normalizeList<{ nome: string }>(res.data).data
        setClients(data.map((c) => c.nome).filter(Boolean))
      })
      .catch(() => {})

    api
      .get('/users', { params: { limit: 1000, sortBy: 'name', sortOrder: 'ASC' } })
      .then((res) => {
        const data = normalizeList<{ name: string; lastName: string | null }>(res.data).data
        const options = data.map((u) => [u.name, u.lastName].filter(Boolean).join(' ')).filter(Boolean)
        const currentName = currentUserName?.trim()
        if (currentName && !options.includes(currentName)) {
          options.push(currentName)
        }
        setUsers(options)
      })
      .catch(() => {})
  }, [open, currentUserName])

  return { clients, users }
}
