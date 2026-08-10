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
  Typography,
  Divider,
  Autocomplete,
} from '@mui/material'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { tecnicaOptions, statusValidacaoOptions } from './pdcaTypes'

interface PdcaModalProps {
  open: boolean
  editId?: number | null
  defaultProjectId?: number | null
  onClose: () => void
  onSaved: () => void
}

interface ProjectOption {
  id: number
  nome: string
}

export default function PdcaModal({ open, editId, defaultProjectId, onClose, onSaved }: PdcaModalProps) {
  const isEdit = Boolean(editId)
  const { showToast } = useToast()

  const [titulo, setTitulo] = useState('')
  const [project, setProject] = useState<ProjectOption | null>(null)
  const [problema, setProblema] = useState('')
  const [impacto, setImpacto] = useState('')
  const [areaSetor, setAreaSetor] = useState('')
  const [responsavelCiclo, setResponsavelCiclo] = useState('')
  const [tecnicaAnalise, setTecnicaAnalise] = useState('')
  const [causaRaiz, setCausaRaiz] = useState('')
  const [meta, setMeta] = useState('')
  const [resultadoCheck, setResultadoCheck] = useState('')
  const [kpi, setKpi] = useState('')
  const [resultadoMedicao, setResultadoMedicao] = useState('')
  const [statusValidacao, setStatusValidacao] = useState('')
  const [dataVerificacao, setDataVerificacao] = useState('')
  const [responsavelValidacao, setResponsavelValidacao] = useState('')
  const [decisoesAct, setDecisoesAct] = useState('')
  const [pop, setPop] = useState('')
  const [licaoAprendida, setLicaoAprendida] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState<ProjectOption[]>([])

  useEffect(() => {
    if (!open) return
    api.get('/projects', { params: { limit: 1000, sortBy: 'nome', sortOrder: 'ASC' } })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data.data ?? [])
        setProjects(data.map((p: any) => ({ id: p.id, nome: p.nome })))
      })
      .catch(() => {})
  }, [open])

  useEffect(() => {
    if (open && editId) {
      setLoading(true)
      api.get(`/pdca/${editId}`)
        .then((res) => {
          const d = res.data
          setTitulo(d.titulo || '')
          setProject(d.projectId ? { id: d.projectId, nome: '' } : null)
          setProblema(d.problema || '')
          setImpacto(d.impacto || '')
          setAreaSetor(d.areaSetor || '')
          setResponsavelCiclo(d.responsavelCiclo || '')
          setTecnicaAnalise(d.tecnicaAnalise || '')
          setCausaRaiz(d.causaRaiz || '')
          setMeta(d.meta || '')
          setResultadoCheck(d.resultadoCheck || '')
          setKpi(d.kpi || '')
          setResultadoMedicao(d.resultadoMedicao || '')
          setStatusValidacao(d.statusValidacao || '')
          setDataVerificacao(d.dataVerificacao || '')
          setResponsavelValidacao(d.responsavelValidacao || '')
          setDecisoesAct(d.decisoesAct || '')
          setPop(d.pop || '')
          setLicaoAprendida(d.licaoAprendida || '')
          setObservacoes(d.observacoes || '')
        })
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
        .finally(() => setLoading(false))
    } else if (open && defaultProjectId) {
      setProject({ id: defaultProjectId, nome: '' })
    }
  }, [open, editId, defaultProjectId])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const payload: any = {
      titulo,
      projectId: project?.id ?? null,
      problema,
      impacto,
      areaSetor,
      responsavelCiclo,
      tecnicaAnalise,
      causaRaiz,
      meta,
      resultadoCheck,
      kpi,
      resultadoMedicao,
      statusValidacao,
      dataVerificacao,
      responsavelValidacao,
      decisoesAct,
      pop,
      licaoAprendida,
      observacoes,
    }

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
      setError(err.response?.data?.message || 'Não foi possível salvar. Tente novamente.')
      showToast(err.response?.data?.message || 'Não foi possível salvar. Tente novamente.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (loading) return
    setError('')
    setTitulo('')
    setProject(null)
    setProblema('')
    setImpacto('')
    setAreaSetor('')
    setResponsavelCiclo('')
    setTecnicaAnalise('')
    setCausaRaiz('')
    setMeta('')
    setResultadoCheck('')
    setKpi('')
    setResultadoMedicao('')
    setStatusValidacao('')
    setDataVerificacao('')
    setResponsavelValidacao('')
    setDecisoesAct('')
    setPop('')
    setLicaoAprendida('')
    setObservacoes('')
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
                  <TextField fullWidth label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} margin="normal" required />
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

              <Typography variant="subtitle2" color="primary" sx={{ mt: 2, mb: 0.5 }}>
                Plan (Planejar)
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Problema (descrição detalhada)" multiline rows={2} value={problema} onChange={(e) => setProblema(e.target.value)} margin="normal" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Impacto" value={impacto} onChange={(e) => setImpacto(e.target.value)} margin="normal" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Área / Setor" value={areaSetor} onChange={(e) => setAreaSetor(e.target.value)} margin="normal" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Responsável" value={responsavelCiclo} onChange={(e) => setResponsavelCiclo(e.target.value)} margin="normal" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth select label="Técnica de análise de causa" value={tecnicaAnalise} onChange={(e) => setTecnicaAnalise(e.target.value)} margin="normal">
                    <MenuItem value="">Selecione</MenuItem>
                    {tecnicaOptions.map((o) => (
                      <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Meta planejada" value={meta} onChange={(e) => setMeta(e.target.value)} margin="normal" />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Análise da causa raiz" multiline rows={2} value={causaRaiz} onChange={(e) => setCausaRaiz(e.target.value)} margin="normal" />
                </Grid>
              </Grid>

              <Typography variant="subtitle2" color="primary" sx={{ mt: 2, mb: 0.5 }}>
                Check (Checar / Verificar)
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Avaliação de resultados" multiline rows={2} value={resultadoCheck} onChange={(e) => setResultadoCheck(e.target.value)} margin="normal" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="KPI / Indicador" value={kpi} onChange={(e) => setKpi(e.target.value)} margin="normal" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Medição qualitativa/quantitativa" value={resultadoMedicao} onChange={(e) => setResultadoMedicao(e.target.value)} margin="normal" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth select label="Status da validação" value={statusValidacao} onChange={(e) => setStatusValidacao(e.target.value)} margin="normal">
                    <MenuItem value="">Selecione</MenuItem>
                    {statusValidacaoOptions.map((o) => (
                      <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Data de verificação" type="date" value={dataVerificacao} onChange={(e) => setDataVerificacao(e.target.value)} margin="normal" InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Responsável pela validação" value={responsavelValidacao} onChange={(e) => setResponsavelValidacao(e.target.value)} margin="normal" />
                </Grid>
              </Grid>

              <Typography variant="subtitle2" color="primary" sx={{ mt: 2, mb: 0.5 }}>
                Act (Agir / Padronizar)
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Decisão / Tomada de ação" multiline rows={2} value={decisoesAct} onChange={(e) => setDecisoesAct(e.target.value)} margin="normal" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Procedimento Operacional Padrão (POP)" multiline rows={2} value={pop} onChange={(e) => setPop(e.target.value)} margin="normal" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Lição aprendida / Padronização" multiline rows={2} value={licaoAprendida} onChange={(e) => setLicaoAprendida(e.target.value)} margin="normal" />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Observações" multiline rows={2} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} margin="normal" />
                </Grid>
              </Grid>
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
