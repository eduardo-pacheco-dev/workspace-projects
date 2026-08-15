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
  CircularProgress,
  MenuItem,
  Grid,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material'
import { Delete } from '@mui/icons-material'
import api from '../../services/api'
import { getFieldErrors } from '../../schemas/authSchemas'
import ConfirmDialog from '../../components/ConfirmDialog'
import { resourceSchema } from './msProjectSchemas'
import { MsResource, MsTask, resourceTypeOptions } from './msProjectTypes'

interface ResourceModalProps {
  projectId: number
  open: boolean
  editId?: number | null
  tasks: MsTask[]
  onClose: () => void
  onSaved: () => void
}

export default function ResourceModal({ projectId, open, editId, tasks, onClose, onSaved }: ResourceModalProps) {
  const isEdit = Boolean(editId)

  const [name, setName] = useState('')
  const [type, setType] = useState('work')
  const [email, setEmail] = useState('')
  const [maxUnits, setMaxUnits] = useState('100')
  const [taskId, setTaskId] = useState('')
  const [units, setUnits] = useState('100')
  const [work, setWork] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (open && editId) {
      setLoading(true)
      api
        .get(`/ms-project/${projectId}`)
        .then((res) => {
          const resource = res.data.resources.find((r: MsResource) => r.id === editId)
          if (!resource) return
          setName(resource.name)
          setType(resource.type)
          setEmail(resource.email || '')
          setMaxUnits(String(resource.maxUnits))
        })
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
        .finally(() => setLoading(false))
    }
  }, [open, editId, projectId])

  const reset = () => {
    setName('')
    setType('work')
    setEmail('')
    setMaxUnits('100')
    setTaskId('')
    setUnits('100')
    setWork('')
    setError('')
    setFieldErrors({})
    setDeleting(false)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const result = resourceSchema.safeParse({ name, type, email, maxUnits, taskId, units, work })
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error))
      return
    }

    setLoading(true)
    try {
      const payload = {
        name,
        type,
        email,
        maxUnits: Math.max(1, Number(maxUnits) || 100),
      }
      if (isEdit) {
        await api.patch(`/ms-project/resources/${editId}`, payload)
      } else {
        const created = await api.post(`/ms-project/${projectId}/resources`, payload)
        if (taskId) {
          const createdResource = created.data.resources[created.data.resources.length - 1]
          await api.post(`/ms-project/${projectId}/assignments`, {
            taskId: Number(taskId),
            resourceId: createdResource.id,
            units: Math.max(1, Number(units) || 100),
            work: work ? Math.max(0, Number(work)) : undefined,
          })
        }
      }
      reset()
      onSaved()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!editId) return
    setDeleting(true)
    try {
      await api.delete(`/ms-project/resources/${editId}`)
      reset()
      onSaved()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir. Tente novamente.')
    } finally {
      setDeleting(false)
    }
  }

  const handleClose = () => {
    if (loading || deleting) return
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Editar Recurso' : 'Novo Recurso'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <TextField
                fullWidth
                label="Nome"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setFieldErrors((prev) => ({ ...prev, name: '' }))
                }}
                margin="normal"
                required
                autoFocus
                error={!!fieldErrors.name}
                helperText={fieldErrors.name}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                select
                label="Tipo"
                value={type}
                onChange={(e) => setType(e.target.value)}
                margin="normal"
              >
                {resourceTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <TextField
                fullWidth
                label="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Unidade máx."
                type="number"
                value={maxUnits}
                onChange={(e) => setMaxUnits(e.target.value)}
                margin="normal"
                inputProps={{ min: 1, max: 1000 }}
              />
            </Grid>
          </Grid>
          {!isEdit && (
            <>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Atribuir à tarefa"
                    value={taskId}
                    onChange={(e) => setTaskId(e.target.value)}
                    margin="normal"
                  >
                    <MenuItem value="">Sem atribuição</MenuItem>
                    {tasks.map((task) => (
                      <MenuItem key={task.id} value={task.id}>{task.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Unidades (%)"
                    type="number"
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                    margin="normal"
                    disabled={!taskId}
                    inputProps={{ min: 1, max: 1000 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Trabalho (h)"
                    type="number"
                    value={work}
                    onChange={(e) => setWork(e.target.value)}
                    margin="normal"
                    disabled={!taskId}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
              </Grid>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {isEdit && (
            <Tooltip title="Excluir recurso">
              <IconButton color="error" onClick={() => setConfirmDelete(true)} disabled={loading || deleting} sx={{ mr: 'auto' }}>
                <Delete />
              </IconButton>
            </Tooltip>
          )}
          <Button onClick={handleClose} disabled={loading || deleting}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={loading || deleting}>
            {loading ? <CircularProgress size={24} color="inherit" /> : (isEdit ? 'Salvar' : 'Criar')}
          </Button>
        </DialogActions>
      </Box>

      <ConfirmDialog
        open={confirmDelete}
        title="Excluir recurso"
        message="Tem certeza que deseja excluir este recurso?"
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </Dialog>
  )
}
