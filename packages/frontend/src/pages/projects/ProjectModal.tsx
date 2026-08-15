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
  Checkbox,
  FormControlLabel,
} from '@mui/material'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { getFieldErrors } from '../../schemas/authSchemas'
import useProjectOptions from '../../hooks/useProjectOptions'
import FreeSoloAutocomplete from '../../components/projects/FreeSoloAutocomplete'
import { projectSchema } from './projectSchemas'
import { OPERADORAS } from './projectsTypes'

interface ProjectModalProps {
  open: boolean
  editId?: number | null
  onClose: () => void
  onSaved: () => void
}

interface ProjectFormState {
  nome: string
  descricao: string
  cliente: string
  operadora: string
  responsavel: string
  dataInicio: string
  dataFim: string
  observacoes: string
  status: string
}

const initialForm: ProjectFormState = {
  nome: '',
  descricao: '',
  cliente: '',
  operadora: '',
  responsavel: '',
  dataInicio: '',
  dataFim: '',
  observacoes: '',
  status: 'ativo',
}

export default function ProjectModal({ open, editId, onClose, onSaved }: ProjectModalProps) {
  const isEdit = Boolean(editId)
  const { user } = useAuth()
  const { clients, users } = useProjectOptions(open, user?.name)
  const [form, setForm] = useState<ProjectFormState>(initialForm)
  const [indeterminado, setIndeterminado] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && editId) {
      api.get(`/projects/${editId}`)
        .then((res) => {
          const d = res.data
          setForm({
            nome: d.nome || '',
            descricao: d.descricao || '',
            cliente: d.cliente || '',
            operadora: d.operadora || '',
            responsavel: d.responsavel || '',
            dataInicio: d.dataInicio || '',
            dataFim: d.dataFim || '',
            observacoes: d.observacoes || '',
            status: d.status || 'ativo',
          })
          setIndeterminado(!d.dataFim)
        })
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
    }
  }, [open, editId])

  const handleChange = (key: keyof ProjectFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const result = projectSchema.safeParse(form)
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error))
      return
    }

    const payload: any = { ...form }
    payload.dataFim = indeterminado ? '' : form.dataFim

    setLoading(true)
    try {
      if (isEdit) {
        await api.patch(`/projects/${editId}`, payload)
      } else {
        await api.post('/projects', payload)
      }
      onSaved()
      handleClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (loading) return
    setError('')
    setFieldErrors({})
    setForm(initialForm)
    setIndeterminado(false)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Editar Projeto' : 'Novo Projeto'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome"
                value={form.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                margin="normal"
                required
                error={!!fieldErrors.nome}
                helperText={fieldErrors.nome}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FreeSoloAutocomplete
                label="Cliente"
                options={clients}
                value={form.cliente}
                onChange={(value) => handleChange('cliente', value)}
                placeholder="Selecione ou digite um cliente"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FreeSoloAutocomplete
                label="Responsável"
                options={users}
                value={form.responsavel}
                onChange={(value) => handleChange('responsavel', value)}
                placeholder="Selecione um usuário da empresa"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Operadora"
                value={form.operadora}
                onChange={(e) => handleChange('operadora', e.target.value)}
                margin="normal"
              >
                <MenuItem value="">Selecione</MenuItem>
                {OPERADORAS.map((operadora) => (
                  <MenuItem key={operadora} value={operadora}>{operadora}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Data de Início"
                type="date"
                value={form.dataInicio}
                onChange={(e) => handleChange('dataInicio', e.target.value)}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Data de Término"
                type="date"
                value={form.dataFim}
                onChange={(e) => handleChange('dataFim', e.target.value)}
                margin="normal"
                disabled={indeterminado}
                InputLabelProps={{ shrink: true }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={indeterminado}
                    onChange={(e) => {
                      setIndeterminado(e.target.checked)
                      if (e.target.checked) handleChange('dataFim', '')
                    }}
                  />
                }
                label="Término indeterminado"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                multiline
                rows={2}
                value={form.descricao}
                onChange={(e) => handleChange('descricao', e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Status"
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value)}
                margin="normal"
                required
              >
                <MenuItem value="ativo">Ativo</MenuItem>
                <MenuItem value="inativo">Inativo</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações"
                multiline
                rows={3}
                value={form.observacoes}
                onChange={(e) => handleChange('observacoes', e.target.value)}
                margin="normal"
              />
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
