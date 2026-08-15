import { useState, useEffect, useCallback } from 'react'
import { Alert, Box, Button, CircularProgress, Container, Grid, Paper, Step, StepLabel, Stepper, Typography } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import ConfirmDialog from '../../components/ConfirmDialog'
import InfoItem from '../../components/InfoItem'
import PdcaChip from '../../components/pdca/PdcaChip'
import PdcaHeader from '../../components/pdca/PdcaHeader'
import PdcaInfoSection from '../../components/pdca/PdcaInfoSection'
import ActionsSection from '../../components/pdca/ActionsSection'
import PdcaModal from './PdcaModal'
import {
  Pdca,
  faseLabels,
  tecnicaLabels,
  FASE_ORDER,
  formatPdcaDate,
} from './pdcaTypes'

export default function PdcaDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const pdcaId = Number(id)

  const [pdca, setPdca] = useState<Pdca | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [toDelete, setToDelete] = useState(false)
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

  return (
    <Container sx={{ mt: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/pdca')} sx={{ mb: 2 }}>
        Voltar
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <PdcaHeader
        pdca={pdca}
        advancing={advancing}
        onAdvance={advancePhase}
        onConclude={concludeCycle}
        onRestart={restartCycle}
        onEdit={() => setEditOpen(true)}
        onDelete={() => setToDelete(true)}
      />

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={Math.max(0, currentStep)} alternativeLabel>
          {FASE_ORDER.map((fase) => (
            <Step key={fase}>
              <StepLabel>{faseLabels[fase]}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <PdcaInfoSection title="Plan (Planejar)">
        <InfoItem label="Problema" value={pdca.problema} md={6} />
        <InfoItem label="Impacto" value={pdca.impacto} md={6} />
        <InfoItem label="Área / Setor" value={pdca.areaSetor} md={6} />
        <InfoItem label="Responsável" value={pdca.responsavelCiclo} md={6} />
        <InfoItem label="Técnica de análise" value={tecnicaLabels[pdca.tecnicaAnalise || ''] || pdca.tecnicaAnalise || '-'} md={6} />
        <InfoItem label="Meta planejada" value={pdca.meta} md={6} />
        <InfoItem label="Análise da causa raiz" value={pdca.causaRaiz} md={12} />
      </PdcaInfoSection>

      <ActionsSection pdcaId={pdcaId} actions={pdca.actions ?? []} onReload={load} />

      <PdcaInfoSection title="Check (Checar / Verificar)">
        <InfoItem label="Avaliação de resultados" value={pdca.resultadoCheck} md={6} />
        <InfoItem label="KPI / Indicador" value={pdca.kpi} md={6} />
        <InfoItem label="Medição" value={pdca.resultadoMedicao} md={6} />
        <Grid item xs={12} sm={6} md={6}>
          <Typography variant="subtitle2" color="text.secondary">Status da validação</Typography>
          {pdca.statusValidacao ? (
            <Box sx={{ mt: 0.5 }}>
              <PdcaChip kind="statusValidacao" value={pdca.statusValidacao} />
            </Box>
          ) : (
            <Typography variant="body1">-</Typography>
          )}
        </Grid>
        <InfoItem label="Data de verificação" value={formatPdcaDate(pdca.dataVerificacao)} md={6} />
        <InfoItem label="Responsável pela validação" value={pdca.responsavelValidacao} md={6} />
      </PdcaInfoSection>

      <PdcaInfoSection title="Act (Agir / Padronizar)">
        <InfoItem label="Decisão" value={pdca.decisoesAct} md={6} />
        <InfoItem label="POP" value={pdca.pop} md={6} />
        <InfoItem label="Lição aprendida / Padronização" value={pdca.licaoAprendida} md={12} />
      </PdcaInfoSection>

      <PdcaModal
        open={editOpen}
        editId={pdcaId}
        onClose={() => setEditOpen(false)}
        onSaved={() => {
          setEditOpen(false)
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
    </Container>
  )
}
