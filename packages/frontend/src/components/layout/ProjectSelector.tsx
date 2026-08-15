import { useEffect, useState } from 'react'
import { Box, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import api from '../../services/api'
import { useProject } from '../../contexts/ProjectContext'

interface ProjectOption {
  id: number
  nome: string
  codigo: string | null
}

export default function ProjectSelector() {
  const { projectId, setProjectId } = useProject()
  const [projects, setProjects] = useState<ProjectOption[]>([])

  useEffect(() => {
    api.get('/projects', { params: { limit: 1000, sortBy: 'nome', sortOrder: 'ASC' } })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data.data ?? [])
        setProjects(data)
      })
      .catch(() => {})
  }, [])

  const handleChange = (e: SelectChangeEvent<number | ''>) => {
    setProjectId(e.target.value ? Number(e.target.value) : null)
  }

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', minWidth: 0 }}>
      <Select
        value={projectId ?? ''}
        onChange={handleChange}
        displayEmpty
        variant="standard"
        sx={{
          color: 'text.primary',
          minWidth: 200,
          fontSize: '0.9rem',
          '& .MuiSelect-icon': { color: 'text.secondary' },
          '&:before': { borderBottom: '1px solid rgba(0,0,0,0.25)' },
          '&:after': { borderBottom: '1px solid rgb(0, 21, 68)' },
        }}
      >
        <MenuItem value="">
          <em>Selecionar Projeto</em>
        </MenuItem>
        {projects.map((project) => (
          <MenuItem key={project.id} value={project.id}>
            {project.nome}
            {project.codigo ? ` (${project.codigo})` : ''}
          </MenuItem>
        ))}
      </Select>
    </Box>
  )
}
