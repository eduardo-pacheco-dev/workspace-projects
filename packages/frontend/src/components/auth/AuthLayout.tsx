import { Avatar, Box, Paper, Typography } from '@mui/material'

const BRANDING_IMAGE =
  'https://images.pexels.com/photos/19728112/pexels-photo-19728112/free-photo-of-pessoas-trabalhando-tecnologia-trabalho.jpeg?auto=compress&w=1260&h=750&dpr=1'

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
          color: 'white',
          backgroundImage: `linear-gradient(rgba(0, 21, 68, 0.78), rgba(0, 21, 68, 0.78)), url('${BRANDING_IMAGE}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
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
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, sm: 5 },
              borderRadius: 4,
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              bgcolor: 'background.paper',
            }}
          >
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
