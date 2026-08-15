import { Box, MenuItem, Paper, Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { TableView, GridView } from '@mui/icons-material'
import { MOBILE_CARRIERS } from '../../pages/stations/stationsTypes'

export type StationViewMode = 'table' | 'cards'

interface StationsFiltersProps {
  search: string
  status: string
  mobileCarrier: string
  viewMode: StationViewMode
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
  onMobileCarrierChange: (value: string) => void
  onViewModeChange: (mode: StationViewMode) => void
  showViewToggle?: boolean
}

export default function StationsFilters({
  search,
  status,
  mobileCarrier,
  viewMode,
  onSearchChange,
  onStatusChange,
  onMobileCarrierChange,
  onViewModeChange,
  showViewToggle,
}: StationsFiltersProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        border: '1px solid rgba(0,0,0,0.08)',
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center' }}>
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
          value={mobileCarrier}
          onChange={(e) => onMobileCarrierChange(e.target.value)}
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
    </Paper>
  )
}
