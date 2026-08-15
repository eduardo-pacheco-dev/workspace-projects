import { Avatar, Box, Button, Card, CardActions, CardContent, Typography } from '@mui/material'
import { Delete, Edit } from '@mui/icons-material'
import { getInitials } from '../../utils/format'

interface EntityCardProps {
  title: string
  subtitle?: string
  initials: string
  status?: React.ReactNode
  details?: string[]
  onOpen?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export default function EntityCard({ title, subtitle, initials, status, details = [], onOpen, onEdit, onDelete }: EntityCardProps) {
  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: onOpen ? 'pointer' : undefined }} onClick={onOpen}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44, fontSize: 18 }}>
            {getInitials(initials)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>{title}</Typography>
            {subtitle && <Typography variant="body2" color="text.secondary" noWrap>{subtitle}</Typography>}
          </Box>
        </Box>
        {status && <Box sx={{ mb: 1 }}>{status}</Box>}
        {details.map((detail, index) => (
          <Typography key={index} variant="body2" color="text.secondary" noWrap>
            {detail}
          </Typography>
        ))}
      </CardContent>
      {(onEdit || onDelete) && (
        <CardActions sx={{ px: 2, pb: 2, justifyContent: 'flex-end' }}>
          {onEdit && (
            <Button size="small" startIcon={<Edit />} onClick={(e) => { e.stopPropagation(); onEdit() }}>
              Editar
            </Button>
          )}
          {onDelete && (
            <Button size="small" color="error" startIcon={<Delete />} onClick={(e) => { e.stopPropagation(); onDelete() }}>
              Excluir
            </Button>
          )}
        </CardActions>
      )}
    </Card>
  )
}
