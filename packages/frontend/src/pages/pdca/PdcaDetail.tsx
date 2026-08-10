import { useState, useEffect, useCallback } from 'react'
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Chip,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
} from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import ConfirmDialog from '../../components/ConfirmDialog'
import PdcaModal from './PdcaModal'
import PdcaActionModal from './PdcaActionModal'
import {
  faseLabels,
  statusCicloLabels,
  statusAcaoLabels,
  tecnicaLabels,
  statusValidacaoLabels,
  faseColors,
  statusCicloColors,
  statusAcaoColors,
  statusValidacaoColors,
} from './pdcaTypes'
import type { Pdca, PdcaAction } from './pdcaTypes'

const FASE_ORDER = ['plan', 'do', 'check', 'act']

const formatDate = (value: string | null) => {
  if (!value) return '-'
  const date = new Date(`${value}T00:00:00`)
  return isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR')
}

const formatMoney = (value: number | null) => {
  if (value == null) return '-'
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const formatSizePercent = (value: number | null) => (value == null ? '-' : `${value}%`)

export default function PdcaDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const pdcaId = Number(id)

  const [pdca, setPdca] = useState<Pdca | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [actionModal, setActionModal] = useState({ open: false, editData: null as PdcaAction | null })
  const [toDelete, setToDelete] = useState(false)
  const [toDeleteAction, setToDeleteAction] = useState<PdcaAction | null>(null)
  const [advancing, setAdvancing] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    api.get(`/pdca/${pdcaId}`)
      .then((res) => setPdca(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar o ciclo PDCA.'))
      .finally(() => setLoading(false))
  }, [pdcaId])

  useEffect(() => {
    load()
  }, [load])

  const advancePhase = async () => {
    if (!pdca) return
    const idx = FASE_ORDER.indexOf(pdca.fase)
    const next = FASE_ORDER[idx + 1]
    if (!next) return
    setAdvancing(true)
    try {
      await api.patch(`/pdca/${pdca.id}`, { fase: next })
      showToast(`Ciclo avançado para ${faseLabels[next]}.`)
      load()
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível avançar a fase.', 'error')
    } finally {
      setAdvancing(false)
    }
  }

  const concludeCycle = async () => {
    if (!pdca) return
    try {
      await api.patch(`/pdca/${pdca.id}`, { statusCiclo: 'concluido' })
      showToast('Ciclo PDCA concluído.')
      load()
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível concluir o ciclo.', 'error')
    }
  }

  const restartCycle = async () => {
    if (!pdca) return
    try {
      const res = await api.post(`/pdca/${pdca.id}/restart`)
      showToast('Novo ciclo criado vinculado ao anterior.')
      navigate(`/pdca/${res.data.id}`)
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível reiniciar o ciclo.', 'error')
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/pdca/${pdcaId}`)
      showToast('Ciclo PDCA excluído com sucesso.')
      navigate('/pdca')
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível excluir.', 'error')
    }
  }

  const handleDeleteAction = async (action: PdcaAction) => {
    try {
      await api.delete(`/pdca/${pdcaId}/actions/${action.id}`)
      showToast('Ação excluída com sucesso.')
      load()
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível excluir a ação.', 'error')
    } finally {
      setToDeleteAction(null)
    }
  }

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Container>
    )
  }

  if (error && !pdca) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    )
  }

  if (!pdca) return null

  const currentStep = FASE_ORDER.indexOf(pdca.fase)
  const nextFase = FASE_ORDER[currentStep + 1]
  const actions = pdca.actions ?? []
  const overdueCount = actions.filter((a) => a.atrasado || a.status === 'atrasado').length

  return (
    <Container sx={{ mt: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/pdca')} sx={{ mb: 2 }}>
        Voltar
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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
              <Chip size="small" label={faseLabels[pdca.fase] || pdca.fase} color={faseColors[pdca.fase] || 'default'} />
              <Chip size="small" label={statusCicloLabels[pdca.statusCiclo] || pdca.statusCiclo} color={statusCicloColors[pdca.statusCiclo] || 'default'} />
              {overdueCount > 0 && <Chip size="small" color="error" label={`${overdueCount} ação(ões) atrasada(s)`} />}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {nextFase && pdca.statusCiclo !== 'concluido' && pdca.statusCiclo !== 'cancelado' && (
              <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={advancePhase} disabled={advancing}>
                Avançar para {faseLabels[nextFase]}
              </Button>
            )}
            {pdca.statusCiclo !== 'concluido' && pdca.statusCiclo !== 'cancelado' && (
              <Button variant="outlined" color="success" startIcon={<CheckCircleIcon />} onClick={concludeCycle}>
                Concluir Ciclo
              </Button>
            )}
            <Button variant="outlined" startIcon={<RestartAltIcon />} onClick={restartCycle}>
              Reiniciar Ciclo
            </Button>
            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
              Editar
            </Button>
            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => setToDelete(true)}>
              Excluir
            </Button>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={Math.max(0, currentStep)} alternativeLabel>
          {FASE_ORDER.map((f) => (
            <Step key={f}>
              <StepLabel>{faseLabels[f]}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Plan (Planejar)</Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Problema</Typography>
            <Typography variant="body1" gutterBottom>{pdca.problema || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Impacto</Typography>
            <Typography variant="body1" gutterBottom>{pdca.impacto || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Área / Setor</Typography>
            <Typography variant="body1" gutterBottom>{pdca.areaSetor || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Responsável</Typography>
            <Typography variant="body1" gutterBottom>{pdca.responsavelCiclo || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Técnica de análise</Typography>
            <Typography variant="body1" gutterBottom>{tecnicaLabels[pdca.tecnicaAnalise || ''] || pdca.tecnicaAnalise || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Meta planejada</Typography>
            <Typography variant="body1" gutterBottom>{pdca.meta || '-'}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">Análise da causa raiz</Typography>
            <Typography variant="body1" gutterBottom>{pdca.causaRaiz || '-'}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Plano de Ação (5W2H)</Typography>
          <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => setActionModal({ open: true, editData: null })}>
            Nova Ação
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {actions.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Nenhuma ação cadastrada.</Typography>
        ) : (
          <List dense disablePadding>
            {actions.map((a) => (
              <ListItem
                key={a.id}
                sx={{
                  px: 0,
                  borderLeft: '4px solid',
                  borderColor: a.atrasado || a.status === 'atrasado' ? 'error.main' : 'divider',
                  pl: 1,
                }}
              >
                <ListItemText
                  primary={a.what}
                  secondary={
                    <>
                      <Box component="span" sx={{ display: 'block' }}>
                        {[a.why, a.ondeAplicacao, a.who].filter(Boolean).join(' • ') || '—'}
                      </Box>
                      <Box component="span" sx={{ display: 'block', color: 'text.secondary' }}>
                        Início: {formatDate(a.whenInicio)} · Prazo: {formatDate(a.whenPrazo)} · Progresso: {formatSizePercent(a.progresso)} · Custo: {formatMoney(a.howMuch)}
                      </Box>
                    </>
                  }
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                  <Chip
                    size="small"
                    label={statusAcaoLabels[a.status] || a.status}
                    color={statusAcaoColors[a.status] || 'default'}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton size="small" onClick={() => setActionModal({ open: true, editData: a })}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setToDeleteAction(a)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Check (Checar / Verificar)</Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Avaliação de resultados</Typography>
            <Typography variant="body1" gutterBottom>{pdca.resultadoCheck || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">KPI / Indicador</Typography>
            <Typography variant="body1" gutterBottom>{pdca.kpi || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Medição</Typography>
            <Typography variant="body1" gutterBottom>{pdca.resultadoMedicao || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Status da validação</Typography>
            {pdca.statusValidacao ? (
              <Chip
                size="small"
                label={statusValidacaoLabels[pdca.statusValidacao] || pdca.statusValidacao}
                color={statusValidacaoColors[pdca.statusValidacao] || 'default'}
              />
            ) : (
              <Typography variant="body1">-</Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Data de verificação</Typography>
            <Typography variant="body1" gutterBottom>{formatDate(pdca.dataVerificacao)}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Responsável pela validação</Typography>
            <Typography variant="body1" gutterBottom>{pdca.responsavelValidacao || '-'}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Act (Agir / Padronizar)</Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Decisão</Typography>
            <Typography variant="body1" gutterBottom>{pdca.decisoesAct || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">POP</Typography>
            <Typography variant="body1" gutterBottom>{pdca.pop || '-'}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">Lição aprendida / Padronização</Typography>
            <Typography variant="body1" gutterBottom>{pdca.licaoAprendida || '-'}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <PdcaModal
        open={editOpen}
        editId={pdcaId}
        onClose={() => setEditOpen(false)}
        onSaved={() => {
          setEditOpen(false)
          load()
        }}
      />

      <PdcaActionModal
        open={actionModal.open}
        pdcaId={pdcaId}
        editData={actionModal.editData}
        onClose={() => setActionModal({ open: false, editData: null })}
        onSaved={() => {
          setActionModal({ open: false, editData: null })
          load()
        }}
      />

      <ConfirmDialog
        open={toDelete}
        title="Excluir ciclo PDCA"
        message={`Tem certeza que deseja excluir o ciclo "${pdca.titulo}"?`}
        onClose={() => setToDelete(false)}
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={!!toDeleteAction}
        title="Excluir ação"
        message={`Tem certeza que deseja excluir a ação "${toDeleteAction?.what}"?`}
        onClose={() => setToDeleteAction(null)}
        onConfirm={() => toDeleteAction && handleDeleteAction(toDeleteAction)}
      />
    </Container>
  )
}
