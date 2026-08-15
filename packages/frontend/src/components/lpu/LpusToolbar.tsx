import { Box, Button, Typography } from '@mui/material'
import { Add, FileDownload } from '@mui/icons-material'

interface LpusToolbarProps {
  onExport: () => void
  onNew: () => void
}

export default function LpusToolbar({ onExport, onNew }: LpusToolbarProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h4">LPUs</Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="outlined" startIcon={<FileDownload />} onClick={onExport}>
          Exportar Excel
        </Button>
        <Button variant="contained" startIcon={<Add />} onClick={onNew}>
          Nova LPU
        </Button>
      </Box>
    </Box>
  )
}
