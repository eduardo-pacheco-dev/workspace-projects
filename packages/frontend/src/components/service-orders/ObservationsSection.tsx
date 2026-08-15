import { useState, useCallback, useEffect, FormEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { ArrowUpward, ArrowDownward, Delete, Edit, FileDownload, NoteAdd, PictureAsPdf, AttachFile, Visibility, Download } from '@mui/icons-material'
import api from '../../services/api'
import ConfirmDialog from '../ui/ConfirmDialog'
import FilePreviewDialog from '../ui/FilePreviewDialog'
import FileButton from './FileButton'
import { Observation } from '../../pages/service-orders/serviceOrdersTypes'
import { exportObservationsToTxt } from '../../pages/service-orders/serviceOrderExport'
import { formatSize } from '../../utils/format'

interface ObservationsSectionProps {
  orderId: number
  orderNumber: string
}

export default function ObservationsSection({ orderId, orderNumber }: ObservationsSectionProps) {
  const [observations, setObservations] = useState<Observation[]>([])
  const [obsTitle, setObsTitle] = useState('')
  const [obsDescription, setObsDescription] = useState('')
  const [obsFile, setObsFile] = useState<File | null>(null)
  const [obsError, setObsError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editFile, setEditFile] = useState<File | null>(null)
  const [toDelete, setToDelete] = useState<Observation | null>(null)
  const [preview, setPreview] = useState<{ url: string; type: string; name: string } | null>(null)

  const load = useCallback(() => {
    api.get(`/service-orders/${orderId}/observations`)
      .then((res) => setObservations(res.data))
      .catch(() => {})
  }, [orderId])

  useEffect(() => {
    load()
  }, [load])

  const submitObservation = async (e: FormEvent) => {
    e.preventDefault()
    setObsError('')
    if (!obsTitle.trim()) {
      setObsError('Informe o título da observação.')
      return
    }
    setSubmitting(true)
    try {
      const form = new FormData()
      form.append('title', obsTitle)
      form.append('description', obsDescription)
      if (obsFile) form.append('file', obsFile)
      await api.post(`/service-orders/${orderId}/observations`, form)
      setObsTitle('')
      setObsDescription('')
      setObsFile(null)
      load()
    } catch (err: any) {
      setObsError(err.response?.data?.message || 'Não foi possível adicionar a observação.')
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (obs: Observation) => {
    setEditingId(obs.id)
    setEditTitle(obs.title)
    setEditDescription(obs.description || '')
    setEditFile(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
    setEditDescription('')
    setEditFile(null)
  }

  const saveEdit = async (obsId: number) => {
    setObsError('')
    if (!editTitle.trim()) {
      setObsError('Informe o título da observação.')
      return
    }
    setSubmitting(true)
    try {
      const form = new FormData()
      form.append('title', editTitle)
      form.append('description', editDescription)
      if (editFile) form.append('file', editFile)
      await api.patch(`/service-orders/observations/${obsId}`, form)
      cancelEdit()
      load()
    } catch (err: any) {
      setObsError(err.response?.data?.message || 'Não foi possível editar a observação.')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteObservation = async (obsId: number) => {
    try {
      await api.delete(`/service-orders/observations/${obsId}`)
      load()
      setToDelete(null)
    } catch (err: any) {
      setObsError(err.response?.data?.message || 'Não foi possível excluir a observação.')
      setToDelete(null)
    }
  }

  const moveObservation = async (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= observations.length) return
    const next = [...observations]
    ;[next[index], next[target]] = [next[target], next[index]]
    setObservations(next)
    try {
      await api.patch(`/service-orders/${orderId}/observations/reorder`, {
        ids: next.map((o) => o.id),
      })
    } catch (err: any) {
      setObsError(err.response?.data?.message || 'Não foi possível reordenar as observações.')
      load()
    }
  }

  const handlePreview = (obs: Observation) => {
    if (obs.filename) {
      setPreview({ url: `/api/service-orders/observations/${obs.id}/file`, type: obs.mimetype || '', name: obs.originalName || obs.title })
    }
  }

  return (
    <Paper sx={{ p: 4, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Observações</Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<FileDownload />}
          onClick={() => exportObservationsToTxt(observations, orderNumber)}
          disabled={observations.length === 0}
        >
          Exportar TXT
        </Button>
      </Box>
      <Divider sx={{ mb: 2 }} />
      {obsError && <Alert severity="error" sx={{ mb: 2 }}>{obsError}</Alert>}
      {observations.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Nenhuma observação cadastrada.</Typography>
      ) : (
        <List dense disablePadding sx={{ mb: 2 }}>
          {observations.map((obs, index) => {
            const isImage = obs.mimetype?.startsWith('image/')
            const isPdf = obs.mimetype === 'application/pdf'
            const isEditing = editingId === obs.id
            return (
              <ListItem key={obs.id} sx={{ px: 0, flexDirection: 'column', alignItems: 'stretch', mb: 2 }}>
                {isEditing ? (
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Editar Observação</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(obs.createdAt).toLocaleString('pt-BR')}
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      size="small"
                      label="Título"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      required
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Descrição"
                      multiline
                      rows={2}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <FileButton file={editFile} existingName={obs.originalName} onFileChange={setEditFile} />
                      <Box sx={{ flexGrow: 1 }} />
                      <Button size="small" onClick={cancelEdit} disabled={submitting}>Cancelar</Button>
                      <Button size="small" variant="contained" onClick={() => saveEdit(obs.id)} disabled={submitting}>
                        {submitting ? 'Salvando...' : 'Salvar'}
                      </Button>
                    </Box>
                  </Stack>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{obs.title}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IconButton size="small" disabled={index === 0} onClick={() => moveObservation(index, -1)}>
                          <ArrowUpward fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          disabled={index === observations.length - 1}
                          onClick={() => moveObservation(index, 1)}
                        >
                          <ArrowDownward fontSize="small" />
                        </IconButton>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(obs.createdAt).toLocaleString('pt-BR')}
                        </Typography>
                        <IconButton size="small" onClick={() => startEdit(obs)}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => setToDelete(obs)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    {obs.description && (
                      <Typography variant="body2" color="text.secondary">{obs.description}</Typography>
                    )}
                    {obs.filename && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {isImage ? (
                            <Box
                              component="img"
                              src={`/api/service-orders/observations/${obs.id}/file`}
                              sx={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 1 }}
                            />
                          ) : isPdf ? (
                            <PictureAsPdf color="error" fontSize="small" />
                          ) : (
                            <AttachFile fontSize="small" />
                          )}
                        </ListItemIcon>
                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                          {obs.originalName} {obs.size != null ? `(${formatSize(obs.size)})` : ''}
                        </Typography>
                        {(isImage || isPdf) && (
                          <IconButton size="small" onClick={() => handlePreview(obs)}>
                            <Visibility fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          component="a"
                          href={`/api/service-orders/observations/${obs.id}/file`}
                          target="_blank"
                        >
                          <Download fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </>
                )}
              </ListItem>
            )
          })}
        </List>
      )}
      <Box component="form" onSubmit={submitObservation}>
        <Stack spacing={1.5}>
          <TextField
            fullWidth
            size="small"
            label="Título"
            value={obsTitle}
            onChange={(e) => setObsTitle(e.target.value)}
            required
          />
          <TextField
            fullWidth
            size="small"
            label="Descrição"
            multiline
            rows={2}
            value={obsDescription}
            onChange={(e) => setObsDescription(e.target.value)}
          />
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <FileButton file={obsFile} onFileChange={setObsFile} />
            <Box sx={{ flexGrow: 1 }} />
            <Button
              type="submit"
              variant="contained"
              size="small"
              startIcon={<NoteAdd />}
              disabled={submitting}
            >
              {submitting ? 'Adicionando...' : 'Adicionar Observação'}
            </Button>
          </Box>
        </Stack>
      </Box>

      <FilePreviewDialog preview={preview} onClose={() => setPreview(null)} />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Excluir observação"
        message={`Tem certeza que deseja excluir a observação "${toDelete?.title}"?`}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteObservation(toDelete.id)}
      />
    </Paper>
  )
}
