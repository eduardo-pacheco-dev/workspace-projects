import { Box, Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { TableView, GridView } from '@mui/icons-material'
import { ViewMode } from '../../pages/users/usersTypes'

interface UsersFiltersProps {
  search: string
  viewMode: ViewMode
  onSearchChange: (value: string) => void
  onViewModeChange: (mode: ViewMode) => void
}

export default function UsersFilters({ search, viewMode, onSearchChange, onViewModeChange }: UsersFiltersProps) {
  return (
    <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
      <TextField
        size="small"
        label="Buscar"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <Box sx={{ flexGrow: 1 }} />
      <ToggleButtonGroup size="small" exclusive value={viewMode} onChange={(_, v) => v && onViewModeChange(v)}>
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
