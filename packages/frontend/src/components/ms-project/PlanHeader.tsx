import { Box, Button, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { Replay, Edit, ArrowBack } from '@mui/icons-material'
import { MsProjectDetail } from '../../pages/ms-project/msProjectTypes'
import MsProjectStatusChip from './MsProjectStatusChip'

interface PlanHeaderProps {
  plan: MsProjectDetail
  recomputing: boolean
  onRecompute: () => void
  onEdit: () => void
}

export default function PlanHeader({ plan, recomputing, onRecompute, onEdit }: PlanHeaderProps) {
  return (
    <Box sx={{ mb: 2 }}>
      <Button component={Link} to="/ms-project" startIcon={<ArrowBack />} size="small" sx={{ mb: 1 }}>
        Voltar para planos
      </Button>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h4">{plan.name}</Typography>
            <MsProjectStatusChip status={plan.status} />
          </Stack>
          {plan.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {plan.description}
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Replay />} onClick={onRecompute} disabled={recomputing}>
            Recalcular
          </Button>
          <Button variant="outlined" startIcon={<Edit />} onClick={onEdit}>
            Editar
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}
