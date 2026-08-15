import { MenuItem, Stack, TextField } from '@mui/material'
import { statusOptions } from '../../pages/service-orders/serviceOrdersTypes'

interface ServiceOrdersFiltersProps {
  search: string
  status: string
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
}

export default function ServiceOrdersFilters({ search, status, onSearchChange, onStatusChange }: ServiceOrdersFiltersProps) {
  return (
    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
      <TextField size="small" label="Buscar" value={search} onChange={(e) => onSearchChange(e.target.value)} />
      <TextField
        size="small"
        select
        label="Status"
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        sx={{ minWidth: 160 }}
      >
        <MenuItem value="">Todos</MenuItem>
        {statusOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
        ))}
      </TextField>
    </Stack>
  )
}
