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
  Autocomplete,
} from '@mui/material'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { getFieldErrors } from '../../schemas/authSchemas'
import usePdcaOptions from '../../hooks/usePdcaOptions'
import FormSection from '../../components/pdca/FormSection'
import { pdcaSchema } from './pdcaSchemas'
import { tecnicaOptions, statusValidacaoOptions, ProjectOption } from './pdcaTypes'

interface PdcaModalProps {
  open: boolean
  editId?: number | null
  defaultProjectId?: number | null
  onClose: () => void
  onSaved: () => void
}

interface PdcaFormState {
  titulo: string
  problema: string
  impacto: string
  areaSetor: string
  responsavelCiclo: string
  tecnicaAnalise: string
  causaRaiz: string
  meta: string
  resultadoCheck: string
  kpi: string
  resultadoMedicao: string
  statusValidacao: string
  dataVerificacao: string
  responsavelValidacao: string
  decisoesAct: string
  pop: string
  licaoAprendida: string
  observacoes: string
}

const initialForm: PdcaFormState = {
  titulo: '',
  problema: '',
  impacto: '',
  areaSetor: '',
  responsavelCiclo: '',
  tecnicaAnalise: '',
  causaRaiz: '',
  meta: '',
  resultadoCheck: '',
  kpi: '',
  resultadoMedicao: '',
  statusValidacao: '',
  dataVerificacao: '',
  responsavelValidacao: '',
  decisoesAct: '',
  pop: '',
  licaoAprendida: '',
  observacoes: '',
}

export default function PdcaModal({ open, editId, defaultProjectId, onClose, onSaved }: PdcaModalProps) {
  const isEdit = Boolean(editId)
  const { showToast } = useToast()
  const projects = usePdcaOptions(open)
  const [form, setForm] = useState<PdcaFormState>(initialForm)
  const [project, setProject] = useState<ProjectOption | null>(null)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && editId) {
      setLoading(true)
      api.get(`/pdca/${editId}`)
        .then((res) => {
          const d = res.data
          setForm({
            titulo: d.titulo || '',
            problema: d.problema || '',
            impacto: d.impacto || '',
            areaSetor: d.areaSetor || '',
            responsavelCiclo: d.responsavelCiclo || '',
            tecnicaAnalise: d.tecnicaAnalise || '',
            causaRaiz: d.causaRaiz || '',
            meta: d.meta || '',
            resultadoCheck: d.resultadoCheck || '',
            kpi: d.kpi || '',
            resultadoMedicao: d.resultadoMedicao || '',
            statusValidacao: d.statusValidacao || '',
            dataVerificacao: d.dataVerificacao || '',
            responsavelValidacao: d.responsavelValidacao || '',
            decisoesAct: d.decisoesAct || '',
            pop: d.pop || '',
            licaoAprendida: d.licaoAprendida || '',
            observacoes: d.observacoes || '',
          })
          setProject(d.projectId ? { id: d.projectId, nome: '' } : null)
        })
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
        .finally(() => setLoading(false))
    } else if (open && defaultProjectId) {
      setProject({ id: defaultProjectId, nome: '' })
    }
  }, [open, editId, defaultProjectId])

  const handleChange = (key: keyof PdcaFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const result = pdcaSchema.safeParse(form)
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error))
      return
    }

    const payload: any = { ...form, projectId: project?.id ?? null }

    setLoading(true)
    try {
      if (isEdit) {
        await api.patch(`/pdca/${editId}`, payload)
      } else {
        await api.post('/pdca', payload)
      }
      showToast(isEdit ? 'Ciclo PDCA atualizado com sucesso.' : 'Ciclo PDCA criado com sucesso.')
      onSaved()
      handleClose()
    } catch (err: any) {
      const message = err.response?.data?.message || 'Não foi possível salvar. Tente novamente.'
      setError(message)
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (loading) return
    setError('')
    setFieldErrors({})
    setForm(initialForm)
    setProject(null)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Editar Ciclo PDCA' : 'Novo Ciclo PDCA'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="Título"
                    value={form.titulo}
                    onChange={(e) => handleChange('titulo', e.target.value)}
                    margin="normal"
                    required
                    error={!!fieldErrors.titulo}
                    helperText={fieldErrors.titulo}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Autocomplete
                    fullWidth
                    options={projects}
                    getOptionLabel={(p) => p.nome || `Projeto #${p.id}`}
                    value={project}
                    onChange={(_, v) => setProject(v)}
                    isOptionEqualToValue={(o, v) => o.id === v.id}
                    renderInput={(params) => (
                      <TextField {...params} label="Projeto" margin="normal" placeholder="Selecione um projeto" />
                    )}
                  />
                </Grid>
              </Grid>

              <FormSection title="Plan (Planejar)">
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Problema (descrição detalhada)" multiline rows={2} value={form.problema} onChange={(e) => handleChange('problema', e.target.value)} margin="normal" />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth label="Impacto" value={form.impacto} onChange={(e) => handleChange('impacto', e.target.value)} margin="normal" />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth label="Área / Setor" value={form.areaSetor} onChange={(e) => handleChange('areaSetor', e.target.value)} margin="normal" />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth label="Responsável" value={form.responsavelCiclo} onChange={(e) => handleChange('responsavelCiclo', e.target.value)} margin="normal" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth select label="Técnica de análise de causa" value={form.tecnicaAnalise} onChange={(e) => handleChange('tecnicaAnalise', e.target.value)} margin="normal">
                      <MenuItem value="">Selecione</MenuItem>
                      {tecnicaOptions.map((o) => (
                        <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Meta planejada" value={form.meta} onChange={(e) => handleChange('meta', e.target.value)} margin="normal" />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Análise da causa raiz" multiline rows={2} value={form.causaRaiz} onChange={(e) => handleChange('causaRaiz', e.target.value)} margin="normal" />
                  </Grid>
                </Grid>
              </FormSection>

              <FormSection title="Check (Checar / Verificar)">
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Avaliação de resultados" multiline rows={2} value={form.resultadoCheck} onChange={(e) => handleChange('resultadoCheck', e.target.value)} margin="normal" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="KPI / Indicador" value={form.kpi} onChange={(e) => handleChange('kpi', e.target.value)} margin="normal" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Medição qualitativa/quantitativa" value={form.resultadoMedicao} onChange={(e) => handleChange('resultadoMedicao', e.target.value)} margin="normal" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth select label="Status da validação" value={form.statusValidacao} onChange={(e) => handleChange('statusValidacao', e.target.value)} margin="normal">
                      <MenuItem value="">Selecione</MenuItem>
                      {statusValidacaoOptions.map((o) => (
                        <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Data de verificação" type="date" value={form.dataVerificacao} onChange={(e) => handleChange('dataVerificacao', e.target.value)} margin="normal" InputLabelProps={{ shrink: true }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Responsável pela validação" value={form.responsavelValidacao} onChange={(e) => handleChange('responsavelValidacao', e.target.value)} margin="normal" />
                  </Grid>
                </Grid>
              </FormSection>

              <FormSection title="Act (Agir / Padronizar)">
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Decisão / Tomada de ação" multiline rows={2} value={form.decisoesAct} onChange={(e) => handleChange('decisoesAct', e.target.value)} margin="normal" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Procedimento Operacional Padrão (POP)" multiline rows={2} value={form.pop} onChange={(e) => handleChange('pop', e.target.value)} margin="normal" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Lição aprendida / Padronização" multiline rows={2} value={form.licaoAprendida} onChange={(e) => handleChange('licaoAprendida', e.target.value)} margin="normal" />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Observações" multiline rows={2} value={form.observacoes} onChange={(e) => handleChange('observacoes', e.target.value)} margin="normal" />
                  </Grid>
                </Grid>
              </FormSection>
            </>
          )}
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
