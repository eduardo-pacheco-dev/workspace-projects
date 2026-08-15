import { Stack, TextField } from '@mui/material'

interface CollaboratorsFiltersProps {
  search: string
  onSearchChange: (value: string) => void
}

export default function CollaboratorsFilters({ search, onSearchChange }: CollaboratorsFiltersProps) {
  return (
    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
      <TextField size="small" label="Buscar" value={search} onChange={(e) => onSearchChange(e.target.value)} />
    </Stack>
  )
}
