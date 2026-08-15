import { Avatar, Box, Card, CardContent, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export interface StatCardConfig {
  label: string
  value: string
  icon: React.ReactNode
  gradient: string
  path: string
}

export default function StatCard({ label, value, icon, gradient, path }: StatCardConfig) {
  const navigate = useNavigate()

  return (
    <Card
      onClick={() => navigate(path)}
      sx={{
        borderRadius: 3,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.04)',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.12)' },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 44, height: 44, background: gradient, boxShadow: 2 }}>
            {icon}
          </Avatar>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
