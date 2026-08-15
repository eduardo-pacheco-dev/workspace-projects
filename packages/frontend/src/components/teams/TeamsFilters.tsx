import { Stack, TextField } from '@mui/material'

interface TeamsFiltersProps {
  search: string
  onSearchChange: (value: string) => void
}

export default function TeamsFilters({ search, onSearchChange }: TeamsFiltersProps) {
  return (
    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
      <TextField size="small" label="Buscar" value={search} onChange={(e) => onSearchChange(e.target.value)} />
    </Stack>
  )
}
