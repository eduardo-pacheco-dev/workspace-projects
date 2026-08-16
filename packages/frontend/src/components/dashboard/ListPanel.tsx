import { Avatar, Box, Divider, Paper, Typography } from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import Button from '../ui/Button'
import { useNavigate } from 'react-router-dom'

export interface ListRow {
  key: number | string
  icon: React.ReactNode
  gradient: string
  title: string
  caption?: string
  chip?: React.ReactNode
  path: string
}

interface ListPanelProps {
  title: string
  rows: ListRow[]
  emptyMessage: string
  action?: { label: string; path: string }
}

export default function ListPanel({ title, rows, emptyMessage, action }: ListPanelProps) {
  const navigate = useNavigate()

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, height: '100%', border: '1px solid rgba(0,0,0,0.08)', bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'rgb(0, 21, 68)' }}>
          {title}
        </Typography>
        {action && (
          <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate(action.path)}>
            {action.label}
          </Button>
        )}
      </Box>
      <Divider sx={{ mb: 2 }} />
      {rows.length === 0 ? (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
          {emptyMessage}
        </Typography>
      ) : (
        rows.map((row, index) => (
          <Box key={row.key}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                py: 1.5,
                cursor: 'pointer',
                borderRadius: 1,
                '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' },
              }}
              onClick={() => navigate(row.path)}
            >
              <Avatar sx={{ width: 36, height: 36, background: row.gradient }}>{row.icon}</Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {row.title}
                </Typography>
                {row.caption && (
                  <Typography variant="caption" color="text.secondary">
                    {row.caption}
                  </Typography>
                )}
              </Box>
              {row.chip}
            </Box>
            {index < rows.length - 1 && <Divider />}
          </Box>
        ))
      )}
    </Paper>
  )
}
