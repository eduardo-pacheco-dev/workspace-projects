import { Box, Typography } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'

export default function SettingsHeader() {
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <SettingsIcon color="primary" />
        <Typography variant="h4">Configurações</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Preferências do sistema, dados da empresa e perfis de acesso.
      </Typography>
    </>
  )
}
