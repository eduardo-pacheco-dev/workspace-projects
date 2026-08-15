import { useState, useEffect } from 'react'
import api from '../services/api'
import { normalizeList } from '../utils/list'
import { ProjectOption } from '../pages/pdca/pdcaTypes'

export default function usePdcaOptions(open: boolean): ProjectOption[] {
  const [projects, setProjects] = useState<ProjectOption[]>([])

  useEffect(() => {
    if (!open) return
    api.get('/projects', { params: { limit: 1000, sortBy: 'nome', sortOrder: 'ASC' } })
      .then((res) => {
        const data = normalizeList<{ id: number; nome: string }>(res.data).data
        setProjects(data.map((p) => ({ id: p.id, nome: p.nome })))
      })
      .catch(() => {})
  }, [open])

  return projects
}
