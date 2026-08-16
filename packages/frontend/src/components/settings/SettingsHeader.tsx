import { Box, Typography } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'

export default function SettingsHeader() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 1.5,
          bgcolor: 'rgba(0, 21, 68, 0.08)',
          color: 'rgb(0, 21, 68)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <SettingsIcon />
      </Box>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Configurações</Typography>
        <Typography variant="body2" color="text.secondary">
          Preferências do sistema, dados da empresa e perfis de acesso.
        </Typography>
      </Box>
    </Box>
  )
}
