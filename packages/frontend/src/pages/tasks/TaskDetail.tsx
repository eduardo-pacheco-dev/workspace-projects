import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Typography,
  Button,
  Alert,
  Box,
  CircularProgress,
  Chip,
  Paper,
  Grid,
  Divider,
  IconButton,
  Stack,
  TextField,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material'
import {
  ArrowBack,
  Edit,
  Assignment,
  Add,
  Delete,
  AttachFile,
  PictureAsPdf,
  Visibility,
  Download,
} from '@mui/icons-material'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import TaskModal from './TaskModal'
import Markdown from '../../components/Markdown'
import {
  Task,
  statusLabels,
  statusColors,
  priorityLabels,
  priorityColors,
  formatDateTime,
} from './tasksTypes'

interface Attachment {
  id: number
  filename: string
  originalName: string
  mimetype: string
  size: number
}

export default function TaskDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [task, setTask] = useState<Task | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [subtaskTitle, setSubtaskTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<{ url: string; type: string; name: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    api.get(`/tasks/${id}`)
      .then((res) => setTask(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
      .finally(() => setLoading(false))
  }, [id])

  const reloadSubtasks = useCallback(() => {
    api.get(`/tasks/${id}/subtasks`)
      .then((res) => {
        setTask((prev) => (prev ? { ...prev, subtasks: res.data ?? [] } : prev))
      })
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar as subtarefas.'))
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const fetchAttachments = useCallback(() => {
    api.get(`/attachments/task/${id}`)
      .then((res) => setAttachments(res.data ?? []))
      .catch(() => {})
  }, [id])

  useEffect(() => {
    fetchAttachments()
  }, [fetchAttachments])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('file', file)
      await api.post(`/attachments/upload/task/${id}`, form)
      fetchAttachments()
      showToast('Anexo adicionado com sucesso.')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível enviar o arquivo.')
      showToast(err.response?.data?.message || 'Não foi possível enviar o arquivo.', 'error')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeleteAttachment = async (attId: number) => {
    if (!confirm('Tem certeza que deseja excluir este anexo?')) return
    try {
      await api.delete(`/attachments/${attId}`)
      fetchAttachments()
      showToast('Anexo excluído com sucesso.')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir o anexo.')
      showToast(err.response?.data?.message || 'Não foi possível excluir o anexo.', 'error')
    }
  }

  const handlePreview = (att: Attachment) => {
    setPreview({ url: `/api/attachments/file/${att.id}`, type: att.mimetype, name: att.originalName })
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const addSubtask = async () => {
    if (!subtaskTitle.trim()) return
    setSubmitting(true)
    setError('')
    try {
      await api.post('/tasks', { title: subtaskTitle.trim(), parentId: Number(id) })
      setSubtaskTitle('')
      await reloadSubtasks()
      showToast('Subtarefa adicionada com sucesso.')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível adicionar a subtarefa.')
      showToast(err.response?.data?.message || 'Não foi possível adicionar a subtarefa.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleSubtask = async (sub: Task) => {
    try {
      await api.patch(`/tasks/${sub.id}`, { status: sub.status === 'completed' ? 'pending' : 'completed' })
      await reloadSubtasks()
      showToast(sub.status === 'completed' ? 'Subtarefa reaberta.' : 'Subtarefa concluída.')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível atualizar a subtarefa.')
      showToast(err.response?.data?.message || 'Não foi possível atualizar a subtarefa.', 'error')
    }
  }

  const deleteSubtask = async (subId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta subtarefa?')) return
    try {
      await api.delete(`/tasks/${subId}`)
      await reloadSubtasks()
      showToast('Subtarefa excluída com sucesso.')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir a subtarefa.')
      showToast(err.response?.data?.message || 'Não foi possível excluir a subtarefa.', 'error')
    }
  }

  if (loading) return <Container sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Container>
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>
  if (!task) return <Container sx={{ mt: 4 }}><Alert severity="warning">Tarefa não encontrada.</Alert></Container>

  const InfoItem = ({ label, value }: { label: string; value?: string | number | null }) => (
    <Grid item xs={12} sm={6} md={4}>
      <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
      <Typography variant="body1" gutterBottom>{value || '-'}</Typography>
    </Grid>
  )

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <IconButton onClick={() => navigate('/tasks')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>Detalhes da Tarefa</Typography>
        <Button variant="contained" startIcon={<Edit />} onClick={() => setModalOpen(true)}>
          Editar
        </Button>
      </Box>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Box sx={{ width: 56, height: 56, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1976d2, #42a5f5)', color: 'white' }}>
            <Assignment fontSize="large" />
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 200 }}>
            <Typography variant="h4">{task.title}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
              <Chip
                size="small"
                label={statusLabels[task.status] || task.status}
                color={statusColors[task.status] || 'default'}
              />
              <Chip
                size="small"
                label={priorityLabels[task.priority] || task.priority}
                color={priorityColors[task.priority] || 'default'}
                variant="outlined"
              />
            </Stack>
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">Descrição</Typography>
            <Box sx={{ pt: 0.5 }}>
              <Markdown>{task.description}</Markdown>
            </Box>
          </Grid>
          <InfoItem label="Status" value={statusLabels[task.status] || task.status} />
          <InfoItem label="Prioridade" value={priorityLabels[task.priority] || task.priority} />
          <InfoItem label="Vencimento" value={formatDateTime(task.dueAt)} />
          <InfoItem label="Projeto" value={task.project} />
          <InfoItem label="Cliente" value={task.client} />
          <InfoItem label="Responsável" value={task.assignedTo} />
          <InfoItem label="Criada em" value={task.createdAt ? new Date(task.createdAt).toLocaleString('pt-BR') : undefined} />
          <InfoItem label="Atualizada em" value={task.updatedAt ? new Date(task.updatedAt).toLocaleString('pt-BR') : undefined} />
        </Grid>
      </Paper>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Subtarefas ({task.subtasks?.length ?? 0})
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Nova subtarefa"
            value={subtaskTitle}
            onChange={(e) => setSubtaskTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubtask() } }}
            disabled={submitting}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={addSubtask}
            disabled={submitting || !subtaskTitle.trim()}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Adicionar
          </Button>
        </Box>

        {!task.subtasks || task.subtasks.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Nenhuma subtarefa cadastrada.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {task.subtasks.map((sub) => {
              const info = { label: statusLabels[sub.status] || sub.status, color: (statusColors[sub.status] || 'default') as any }
              return (
                <Box
                  key={sub.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    py: 0.5,
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' },
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={sub.status === 'completed'}
                    onChange={() => toggleSubtask(sub)}
                  />
                  <Typography
                    variant="body1"
                    sx={{ flexGrow: 1, textDecoration: sub.status === 'completed' ? 'line-through' : 'none', color: sub.status === 'completed' ? 'text.secondary' : 'inherit' }}
                  >
                    {sub.title}
                  </Typography>
                  <Chip size="small" label={info.label} color={info.color} />
                  <IconButton size="small" onClick={() => deleteSubtask(sub.id)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              )
            })}
          </Stack>
        )}
      </Paper>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Anexos ({attachments.length})
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AttachFile />}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Enviando...' : 'Adicionar Anexo'}
          </Button>
          <input ref={fileInputRef} type="file" hidden onChange={handleUpload} />
        </Box>
        <Divider sx={{ mb: 2 }} />
        {attachments.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Nenhum anexo cadastrado.
          </Typography>
        ) : (
          <List dense disablePadding>
            {attachments.map((att) => {
              const isImage = att.mimetype.startsWith('image/')
              const isPdf = att.mimetype === 'application/pdf'
              return (
                <ListItem key={att.id} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 44 }}>
                    {isImage ? (
                      <Box
                        component="img"
                        src={`/api/attachments/file/${att.id}`}
                        sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1 }}
                      />
                    ) : isPdf ? (
                      <PictureAsPdf color="error" />
                    ) : (
                      <AttachFile fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText primary={att.originalName} secondary={formatSize(att.size)} />
                  <ListItemSecondaryAction>
                    {(isImage || isPdf) && (
                      <IconButton size="small" onClick={() => handlePreview(att)}>
                        <Visibility fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton size="small" component="a" href={`/api/attachments/download/${att.id}`} target="_blank">
                      <Download fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteAttachment(att.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              )
            })}
          </List>
        )}
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button variant="outlined" onClick={() => navigate('/tasks')}>
          Voltar para a Lista
        </Button>
      </Box>

      <TaskModal
        open={modalOpen}
        editId={Number(id)}
        onClose={() => setModalOpen(false)}
        onSaved={load}
      />

      <Dialog open={!!preview} onClose={() => setPreview(null)} maxWidth="lg" fullWidth>
        <DialogTitle>{preview?.name || 'Preview'}</DialogTitle>
        <DialogContent>
          {preview?.type.startsWith('image/') ? (
            <Box
              component="img"
              src={preview?.url}
              sx={{ maxWidth: '100%', maxHeight: '80vh', display: 'block', mx: 'auto' }}
            />
          ) : preview?.type === 'application/pdf' ? (
            <Box
              component="iframe"
              src={preview?.url}
              sx={{ width: '100%', height: '80vh', border: 'none' }}
              title="PDF Preview"
            />
          ) : (
            <Typography variant="body1">
              Pré-visualização não disponível para este tipo de arquivo.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  )
}
