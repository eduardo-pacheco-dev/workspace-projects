import { Avatar, Box, Button, Card, CardActions, CardContent, Grid, Paper, Typography } from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'
import { Lpu, formatValor } from '../../pages/lpu/lpuTypes'
import { getInitials } from '../../utils/format'
import LpuStatusChip from './LpuStatusChip'

interface LpusCardsProps {
  lpus: Lpu[]
  onEdit: (lpu: Lpu) => void
  onDelete: (lpu: Lpu) => void
}

export default function LpusCards({ lpus, onEdit, onDelete }: LpusCardsProps) {
  if (lpus.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">Nenhuma LPU encontrada.</Typography>
      </Paper>
    )
  }

  return (
    <Grid container spacing={2}>
      {lpus.map((lpu) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={lpu.id}>
          <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44, fontSize: 18 }}>
                  {getInitials(lpu.nome)}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
                    {lpu.nome}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {lpu.freelancer?.nome || 'Sem freelancer'}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mb: 1 }}>
                <LpuStatusChip status={lpu.status} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Valor: {formatValor(lpu.valor)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Data: {lpu.data || '-'}
              </Typography>
              {lpu.descricao && (
                <Typography variant="body2" color="text.secondary" noWrap>
                  {lpu.descricao}
                </Typography>
              )}
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2, justifyContent: 'flex-end' }}>
              <Button size="small" startIcon={<Edit />} onClick={() => onEdit(lpu)}>
                Editar
              </Button>
              <Button size="small" color="error" startIcon={<Delete />} onClick={() => onDelete(lpu)}>
                Excluir
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}
