import { MenuItem, Stack, TextField } from '@mui/material'
import { faseOptions, statusCicloOptions, ProjectOption } from '../../pages/pdca/pdcaTypes'

interface PdcaFiltersProps {
  search: string
  projectFilter: string
  faseFilter: string
  statusFilter: string
  projects: ProjectOption[]
  onSearchChange: (value: string) => void
  onProjectChange: (value: string) => void
  onFaseChange: (value: string) => void
  onStatusChange: (value: string) => void
}

export default function PdcaFilters({
  search,
  projectFilter,
  faseFilter,
  statusFilter,
  projects,
  onSearchChange,
  onProjectChange,
  onFaseChange,
  onStatusChange,
}: PdcaFiltersProps) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
      <TextField size="small" label="Buscar" value={search} onChange={(e) => onSearchChange(e.target.value)} sx={{ minWidth: 200 }} />
      <TextField
        size="small"
        select
        label="Projeto"
        value={projectFilter}
        onChange={(e) => onProjectChange(e.target.value)}
        sx={{ minWidth: 180 }}
      >
        <MenuItem value="">Todos</MenuItem>
        {projects.map((p) => (
          <MenuItem key={p.id} value={p.id}>{p.nome}</MenuItem>
        ))}
      </TextField>
      <TextField
        size="small"
        select
        label="Fase"
        value={faseFilter}
        onChange={(e) => onFaseChange(e.target.value)}
        sx={{ minWidth: 140 }}
      >
        <MenuItem value="">Todas</MenuItem>
        {faseOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
        ))}
      </TextField>
      <TextField
        size="small"
        select
        label="Status"
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        sx={{ minWidth: 150 }}
      >
        <MenuItem value="">Todos</MenuItem>
        {statusCicloOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
        ))}
      </TextField>
    </Stack>
  )
}
