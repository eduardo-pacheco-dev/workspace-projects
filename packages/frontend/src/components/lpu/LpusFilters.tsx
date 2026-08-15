import { Box, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { TableView, GridView } from '@mui/icons-material'

export type LpuViewMode = 'table' | 'cards'

interface LpusFiltersProps {
  search: string
  status: string
  viewMode: LpuViewMode
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
  onViewModeChange: (mode: LpuViewMode) => void
}

export default function LpusFilters({
  search,
  status,
  viewMode,
  onSearchChange,
  onStatusChange,
  onViewModeChange,
}: LpusFiltersProps) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
      <TextField
        size="small"
        label="Buscar"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ minWidth: 250 }}
      />
      <TextField
        size="small"
        select
        label="Status"
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        sx={{ minWidth: 140 }}
      >
        <MenuItem value="">Todos</MenuItem>
        <MenuItem value="ativo">Ativo</MenuItem>
        <MenuItem value="inativo">Inativo</MenuItem>
      </TextField>
      <Box sx={{ flexGrow: 1 }} />
      <ToggleButtonGroup
        size="small"
        exclusive
        value={viewMode}
        onChange={(_, v) => v && onViewModeChange(v)}
      >
        <ToggleButton value="table" aria-label="Visualizar em tabela">
          <TableView fontSize="small" />
        </ToggleButton>
        <ToggleButton value="cards" aria-label="Visualizar em cartões">
          <GridView fontSize="small" />
        </ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  )
}
