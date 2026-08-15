import { Box, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { TableView, GridView } from '@mui/icons-material'
import { MOBILE_CARRIERS } from '../../pages/stations/stationsTypes'

export type RadioLinkViewMode = 'table' | 'cards'

interface RadioLinksFiltersProps {
  search: string
  status: string
  operadora: string
  viewMode: RadioLinkViewMode
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
  onOperadoraChange: (value: string) => void
  onViewModeChange: (mode: RadioLinkViewMode) => void
  showViewToggle?: boolean
}

export default function RadioLinksFilters({
  search,
  status,
  operadora,
  viewMode,
  onSearchChange,
  onStatusChange,
  onOperadoraChange,
  onViewModeChange,
  showViewToggle,
}: RadioLinksFiltersProps) {
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
      <TextField
        size="small"
        select
        label="Operadora"
        value={operadora}
        onChange={(e) => onOperadoraChange(e.target.value)}
        sx={{ minWidth: 140 }}
      >
        <MenuItem value="">Todas</MenuItem>
        {MOBILE_CARRIERS.map((carrier) => (
          <MenuItem key={carrier} value={carrier}>{carrier}</MenuItem>
        ))}
      </TextField>
      {showViewToggle && (
        <>
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
        </>
      )}
    </Stack>
  )
}
