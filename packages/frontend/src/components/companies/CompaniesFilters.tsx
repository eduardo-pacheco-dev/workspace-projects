import { Stack, TextField } from '@mui/material'

interface CompaniesFiltersProps {
  search: string
  onSearchChange: (value: string) => void
}

export default function CompaniesFilters({ search, onSearchChange }: CompaniesFiltersProps) {
  return (
    <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap">
      <TextField size="small" label="Buscar" value={search} onChange={(e) => onSearchChange(e.target.value)} />
    </Stack>
  )
}
