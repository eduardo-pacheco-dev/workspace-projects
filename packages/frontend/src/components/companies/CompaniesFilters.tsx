import { Paper, Stack, TextField } from '@mui/material'

interface CompaniesFiltersProps {
  search: string
  onSearchChange: (value: string) => void
}

export default function CompaniesFilters({ search, onSearchChange }: CompaniesFiltersProps) {
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
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          size="small"
          label="Buscar"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ minWidth: 250 }}
        />
      </Stack>
    </Paper>
  )
}
