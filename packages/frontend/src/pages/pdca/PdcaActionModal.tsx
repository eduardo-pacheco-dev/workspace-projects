import { useState, useEffect, FormEvent } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  MenuItem,
  CircularProgress,
  Grid,
} from '@mui/material'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { statusAcaoOptions } from './pdcaTypes'
import type { PdcaAction } from './pdcaTypes'

interface PdcaActionModalProps {
  open: boolean
  pdcaId: number
  editData?: PdcaAction | null
  onClose: () => void
  onSaved: () => void
}

export default function PdcaActionModal({ open, pdcaId, editData, onClose, onSaved }: PdcaActionModalProps) {
  const isEdit = Boolean(editData)
  const { showToast } = useToast()

  const [what, setWhat] = useState('')
  const [why, setWhy] = useState('')
  const [ondeAplicacao, setOndeAplicacao] = useState('')
  const [whenInicio, setWhenInicio] = useState('')
  const [whenPrazo, setWhenPrazo] = useState('')
  const [who, setWho] = useState('')
  const [how, setHow] = useState('')
  const [howMuch, setHowMuch] = useState('')
  const [status, setStatus] = useState('pendente')
  const [progresso, setProgresso] = useState('0')
  const [observacoes, setObservacoes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setWhat(editData?.what || '')
      setWhy(editData?.why || '')
      setOndeAplicacao(editData?.ondeAplicacao || '')
      setWhenInicio(editData?.whenInicio || '')
      setWhenPrazo(editData?.whenPrazo || '')
      setWho(editData?.who || '')
      setHow(editData?.how || '')
      setHowMuch(editData?.howMuch != null ? String(editData.howMuch) : '')
      setStatus(editData?.status || 'pendente')
      setProgresso(editData?.progresso != null ? String(editData.progresso) : '0')
      setObservacoes(editData?.observacoes || '')
    }
  }, [open, editData])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const payload: any = {
      what,
      why,
      ondeAplicacao,
      whenInicio,
      whenPrazo,
      who,
      how,
      howMuch: howMuch !== '' ? Number(howMuch) : undefined,
      status,
      progresso: Number(progresso) || 0,
      observacoes,
    }

    try {
      if (isEdit) {
        await api.patch(`/pdca/${pdcaId}/actions/${editData?.id}`, payload)
      } else {
        await api.post(`/pdca/${pdcaId}/actions`, payload)
      }
      showToast(isEdit ? 'Ação atualizada com sucesso.' : 'Ação criada com sucesso.')
      onSaved()
      handleClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível salvar. Tente novamente.')
      showToast(err.response?.data?.message || 'Não foi possível salvar. Tente novamente.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (loading) return
    setError('')
    setWhat('')
    setWhy('')
    setOndeAplicacao('')
    setWhenInicio('')
    setWhenPrazo('')
    setWho('')
    setHow('')
    setHowMuch('')
    setStatus('pendente')
    setProgresso('0')
    setObservacoes('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Editar Ação (5W2H)' : 'Nova Ação (5W2H)'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="What — O que fazer" value={what} onChange={(e) => setWhat(e.target.value)} margin="normal" required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Why — Por que" multiline rows={2} value={why} onChange={(e) => setWhy(e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Where — Onde aplicar" value={ondeAplicacao} onChange={(e) => setOndeAplicacao(e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="When — Início" type="date" value={whenInicio} onChange={(e) => setWhenInicio(e.target.value)} margin="normal" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="When — Prazo limite" type="date" value={whenPrazo} onChange={(e) => setWhenPrazo(e.target.value)} margin="normal" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Who — Responsável" value={who} onChange={(e) => setWho(e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="How much — Custo estimado (R$)" type="number" value={howMuch} onChange={(e) => setHowMuch(e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="How — Como / Método" multiline rows={2} value={how} onChange={(e) => setHow(e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} margin="normal">
                {statusAcaoOptions.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Progresso (%)"
                type="number"
                value={progresso}
                onChange={(e) => setProgresso(e.target.value)}
                margin="normal"
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Observações / Evidências" multiline rows={2} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} margin="normal" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : (isEdit ? 'Salvar' : 'Criar')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
