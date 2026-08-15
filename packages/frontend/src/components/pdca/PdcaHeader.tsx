import { Box, Button, Chip, Paper, Typography } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import PdcaChip from './PdcaChip'
import { Pdca, faseLabels, FASE_ORDER } from '../../pages/pdca/pdcaTypes'

interface PdcaHeaderProps {
  pdca: Pdca
  advancing: boolean
  onAdvance: () => void
  onConclude: () => void
  onRestart: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function PdcaHeader({
  pdca,
  advancing,
  onAdvance,
  onConclude,
  onRestart,
  onEdit,
  onDelete,
}: PdcaHeaderProps) {
  const currentStep = FASE_ORDER.indexOf(pdca.fase)
  const nextFase = FASE_ORDER[currentStep + 1]
  const overdueCount = (pdca.actions ?? []).filter((a) => a.atrasado || a.status === 'atrasado').length
  const closed = pdca.statusCiclo === 'concluido' || pdca.statusCiclo === 'cancelado'

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 250 }}>
          <Typography variant="h4">{pdca.titulo}</Typography>
          {pdca.cicloPaiId && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Ciclo vinculado ao ciclo #{pdca.cicloPaiId}
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
            <PdcaChip kind="fase" value={pdca.fase} />
            <PdcaChip kind="statusCiclo" value={pdca.statusCiclo} />
            {overdueCount > 0 && <Chip size="small" color="error" label={`${overdueCount} ação(ões) atrasada(s)`} />}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {nextFase && !closed && (
            <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={onAdvance} disabled={advancing}>
              Avançar para {faseLabels[nextFase]}
            </Button>
          )}
          {!closed && (
            <Button variant="outlined" color="success" startIcon={<CheckCircleIcon />} onClick={onConclude}>
              Concluir Ciclo
            </Button>
          )}
          <Button variant="outlined" startIcon={<RestartAltIcon />} onClick={onRestart}>
            Reiniciar Ciclo
          </Button>
          <Button variant="outlined" startIcon={<EditIcon />} onClick={onEdit}>
            Editar
          </Button>
          <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={onDelete}>
            Excluir
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}
