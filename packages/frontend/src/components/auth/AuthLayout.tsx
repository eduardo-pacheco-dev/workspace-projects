import { Avatar, Box, Paper, Typography } from '@mui/material'

interface AuthLayoutProps {
  headline?: string
  headlineSubtitle?: string
  icon?: React.ReactNode
  title: string
  subtitle: string
  children: React.ReactNode
}

export default function AuthLayout({ headline, headlineSubtitle, icon, title, subtitle, children }: AuthLayoutProps) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'stretch', bgcolor: 'background.default' }}>
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 6,
          background: 'linear-gradient(135deg, #1976d2 0%, #115293 50%, #0d47a1 100%)',
          color: 'white',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
          AFL Engenharia
        </Typography>

        {headline && (
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
              {headline}
            </Typography>
            {headlineSubtitle && (
              <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.9, maxWidth: 480 }}>
                {headlineSubtitle}
              </Typography>
            )}
          </Box>
        )}

        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          © {new Date().getFullYear()} AFL Engenharia. Todos os direitos reservados.
        </Typography>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 3, sm: 6 } }}>
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          <Paper elevation={3} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              {icon && (
                <Avatar sx={{ bgcolor: 'primary.main', width: 52, height: 52, mb: 2 }}>{icon}</Avatar>
              )}
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                {subtitle}
              </Typography>
            </Box>
            {children}
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}
