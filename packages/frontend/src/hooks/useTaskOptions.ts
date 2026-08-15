import { useState, useEffect } from 'react'
import api from '../services/api'
import { normalizeList } from '../utils/list'
import { CollaboratorOption, ProjectOption } from '../pages/tasks/tasksTypes'

interface TaskOptions {
  projects: ProjectOption[]
  clients: string[]
  collaborators: CollaboratorOption[]
}

export default function useTaskOptions(open: boolean): TaskOptions {
  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [clients, setClients] = useState<string[]>([])
  const [collaborators, setCollaborators] = useState<CollaboratorOption[]>([])

  useEffect(() => {
    if (!open) return

    api
      .get('/projects', { params: { limit: 1000, sortBy: 'nome', sortOrder: 'ASC' } })
      .then((res) => {
        const data = normalizeList<ProjectOption>(res.data).data
        setProjects(data)
        setClients(Array.from(new Set(data.map((p) => p.cliente).filter(Boolean) as string[])))
      })
      .catch(() => {})

    api
      .get('/collaborators', { params: { limit: 1000, sortBy: 'nome', sortOrder: 'ASC' } })
      .then((res) => setCollaborators(normalizeList<CollaboratorOption>(res.data).data))
      .catch(() => {})
  }, [open])

  return { projects, clients, collaborators }
}
