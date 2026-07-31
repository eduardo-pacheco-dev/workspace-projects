import { useState, useEffect, useRef, FormEvent } from 'react'
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
} from '@mui/material'
import {
  ArrowBack,
  Edit,
  Assignment,
  Send,
  Delete,
  AttachFile,
  PictureAsPdf,
  Visibility,
  Download,
  NoteAdd,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

interface Comment {
  id: number
  content: string
  author: string
  createdAt: string
}

interface Attachment {
  id: number
  filename: string
  originalName: string
  mimetype: string
  size: number
}

interface Observation {
  id: number
  title: string
  description: string | null
  filename: string | null
  originalName: string | null
  mimetype: string | null
  size: number | null
  createdAt: string
}

interface ServiceOrder {
  id: number
  numero: string
  cliente: string
  descricao: string | null
  siteId: string | null
  endId: string | null
  operadora: string | null
  dataInicio: string | null
  dataFim: string | null
  status: string
  observacoes: string | null
  createdAt: string
}

const statusMap: Record<string, { label: string; color: 'default' | 'info' | 'warning' | 'success' | 'error' }> = {
  aberta: { label: 'Aberta', color: 'info' },
  em_andamento: { label: 'Em andamento', color: 'warning' },
  concluida: { label: 'Concluída', color: 'success' },
  cancelada: { label: 'Cancelada', color: 'error' },
}

export default function ServiceOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [order, setOrder] = useState<ServiceOrder | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<{ url: string; type: string; name: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [observations, setObservations] = useState<Observation[]>([])
  const [obsTitle, setObsTitle] = useState('')
  const [obsDescription, setObsDescription] = useState('')
  const [obsFile, setObsFile] = useState<File | null>(null)
  const [obsError, setObsError] = useState('')
  const [submittingObs, setSubmittingObs] = useState(false)
  const obsFileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api
      .get(`/service-orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
      .finally(() => setLoading(false))
  }, [id])

  const fetchComments = () => {
    api.get(`/comments/service-order/${id}`)
      .then((res) => setComments(res.data))
      .catch(() => {})
  }

  useEffect(() => {
    fetchComments()
  }, [id])

  const fetchAttachments = () => {
    api.get(`/attachments/service-order/${id}`)
      .then((res) => setAttachments(res.data))
      .catch(() => {})
  }

  useEffect(() => {
    fetchAttachments()
  }, [id])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      await api.post(`/attachments/upload/service-order/${id}`, form)
      fetchAttachments()
    } catch {
      setError('Não foi possível enviar o arquivo.')
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
    } catch {
      setError('Não foi possível excluir o anexo.')
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

  const fetchObservations = () => {
    api.get(`/service-orders/${id}/observations`)
      .then((res) => setObservations(res.data))
      .catch(() => {})
  }

  useEffect(() => {
    fetchObservations()
  }, [id])

  const handleSubmitObservation = async (e: FormEvent) => {
    e.preventDefault()
    setObsError('')
    if (!obsTitle.trim()) {
      setObsError('Informe o título da observação.')
      return
    }
    setSubmittingObs(true)
    try {
      const form = new FormData()
      form.append('title', obsTitle)
      form.append('description', obsDescription)
      if (obsFile) form.append('file', obsFile)
      await api.post(`/service-orders/${id}/observations`, form)
      setObsTitle('')
      setObsDescription('')
      setObsFile(null)
      if (obsFileInputRef.current) obsFileInputRef.current.value = ''
      fetchObservations()
    } catch (err: any) {
      setObsError(err.response?.data?.message || 'Não foi possível adicionar a observação.')
    } finally {
      setSubmittingObs(false)
    }
  }

  const handlePreviewObservation = (obs: Observation) => {
    if (obs.filename) {
      setPreview({ url: `/api/service-orders/observations/${obs.id}/file`, type: obs.mimetype || '', name: obs.originalName || obs.title })
    }
  }

  const handleDeleteObservation = async (obsId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta observação?')) return
    try {
      await api.delete(`/service-orders/observations/${obsId}`)
      fetchObservations()
    } catch {
      setObsError('Não foi possível excluir a observação.')
    }
  }

  const handleMoveObservation = async (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= observations.length) return
    const next = [...observations]
    ;[next[index], next[target]] = [next[target], next[index]]
    setObservations(next)
    try {
      await api.patch(`/service-orders/${id}/observations/reorder`, {
        ids: next.map((o) => o.id),
      })
    } catch {
      setObsError('Não foi possível reordenar as observações.')
      fetchObservations()
    }
  }

  const handleEditComment = (c: Comment) => {
    setEditingId(c.id)
    setEditContent(c.content)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditContent('')
  }

  const handleSaveEdit = async (commentId: number) => {
    if (!editContent.trim()) return
    try {
      await api.patch(`/comments/${commentId}`, { content: editContent })
      setEditingId(null)
      setEditContent('')
      fetchComments()
    } catch {
      setError('Não foi possível editar o comentário.')
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Tem certeza que deseja excluir este comentário?')) return
    try {
      await api.delete(`/comments/${commentId}`)
      fetchComments()
    } catch {
      setError('Não foi possível excluir o comentário.')
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return
    setSubmitting(true)
    try {
      await api.post(`/comments/service-order/${id}`, { content: newComment })
      setNewComment('')
      fetchComments()
    } catch {
      setError('Não foi possível enviar o comentário.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Container sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Container>
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>
  if (!order) return <Container sx={{ mt: 4 }}><Alert severity="warning">Ordem de serviço não encontrada.</Alert></Container>

  const statusInfo = statusMap[order.status] || { label: order.status, color: 'default' as const }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <IconButton onClick={() => navigate('/service-orders')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>Detalhes da Ordem de Serviço</Typography>
        <Button variant="contained" startIcon={<Edit />} onClick={() => navigate('/service-orders?edit=' + order.id)}>
          Editar
        </Button>
      </Box>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
          <IconButton sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }} size="large">
            <Assignment />
          </IconButton>
          <Box>
            <Typography variant="h4">{order.numero}</Typography>
            <Chip label={statusInfo.label} color={statusInfo.color} size="small" sx={{ mt: 0.5 }} />
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Cliente</Typography>
            <Typography variant="body1" gutterBottom>{order.cliente}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Operadora</Typography>
            <Typography variant="body1" gutterBottom>{order.operadora || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Site ID</Typography>
            <Typography variant="body1" gutterBottom>{order.siteId || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">End ID</Typography>
            <Typography variant="body1" gutterBottom>{order.endId || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Data de Início</Typography>
            <Typography variant="body1" gutterBottom>{order.dataInicio || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Data de Fim</Typography>
            <Typography variant="body1" gutterBottom>{order.dataFim || '-'}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">Descrição</Typography>
            <Typography variant="body1" gutterBottom>{order.descricao || '-'}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">Observações</Typography>
            <Typography variant="body1" gutterBottom>{order.observacoes || '-'}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">Criado em</Typography>
            <Typography variant="body1" gutterBottom>
              {new Date(order.createdAt).toLocaleString('pt-BR')}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Anexos</Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AttachFile />}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Enviando...' : 'Adicionar Anexo'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            hidden
            onChange={handleUpload}
          />
        </Box>
        <Divider sx={{ mb: 2 }} />
        {attachments.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Nenhum anexo cadastrado.</Typography>
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
                  <ListItemText
                    primary={att.originalName}
                    secondary={formatSize(att.size)}
                  />
                  <ListItemSecondaryAction>
                    {(isImage || isPdf) && (
                      <IconButton size="small" onClick={() => handlePreview(att)}>
                        <Visibility fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      component="a"
                      href={`/api/attachments/download/${att.id}`}
                      target="_blank"
                    >
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

      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Observações</Typography>
        <Divider sx={{ mb: 2 }} />
        {obsError && <Alert severity="error" sx={{ mb: 2 }}>{obsError}</Alert>}
        {observations.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Nenhuma observação cadastrada.</Typography>
        ) : (
          <List dense disablePadding sx={{ mb: 2 }}>
            {observations.map((obs, index) => {
              const isImage = obs.mimetype?.startsWith('image/')
              const isPdf = obs.mimetype === 'application/pdf'
              return (
                <ListItem key={obs.id} sx={{ px: 0, flexDirection: 'column', alignItems: 'stretch', mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{obs.title}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <IconButton size="small" disabled={index === 0} onClick={() => handleMoveObservation(index, -1)}>
                        <ArrowUpward fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        disabled={index === observations.length - 1}
                        onClick={() => handleMoveObservation(index, 1)}
                      >
                        <ArrowDownward fontSize="small" />
                      </IconButton>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(obs.createdAt).toLocaleString('pt-BR')}
                      </Typography>
                      <IconButton size="small" onClick={() => handleDeleteObservation(obs.id)}>
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
                        <IconButton size="small" onClick={() => handlePreviewObservation(obs)}>
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
                </ListItem>
              )
            })}
          </List>
        )}
        <Box component="form" onSubmit={handleSubmitObservation}>
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
              <Button
                variant="outlined"
                size="small"
                startIcon={<AttachFile />}
                onClick={() => obsFileInputRef.current?.click()}
              >
                {obsFile ? obsFile.name : 'Anexar arquivo'}
              </Button>
              {obsFile && (
                <IconButton size="small" onClick={() => { setObsFile(null); if (obsFileInputRef.current) obsFileInputRef.current.value = '' }}>
                  <Delete fontSize="small" />
                </IconButton>
              )}
              <input
                ref={obsFileInputRef}
                type="file"
                hidden
                onChange={(e) => setObsFile(e.target.files?.[0] || null)}
              />
              <Box sx={{ flexGrow: 1 }} />
              <Button
                type="submit"
                variant="contained"
                size="small"
                startIcon={<NoteAdd />}
                disabled={submittingObs}
              >
                {submittingObs ? 'Adicionando...' : 'Adicionar Observação'}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Comentários</Typography>
        <Divider sx={{ mb: 2 }} />
        {comments.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Nenhum comentário ainda.</Typography>
        ) : (
          <List dense disablePadding sx={{ mb: 2 }}>
            {comments.map((c) => {
              const isOwner = user?.email === c.author
              return (
                <ListItem key={c.id} sx={{ px: 0, flexDirection: 'column', alignItems: 'stretch' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="subtitle2">{c.author}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(c.createdAt).toLocaleString('pt-BR')}
                      </Typography>
                      {isOwner && editingId !== c.id && (
                        <>
                          <IconButton size="small" onClick={() => handleEditComment(c)}>
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteComment(c.id)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </Box>
                  {editingId === c.id ? (
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        autoFocus
                      />
                      <IconButton size="small" color="primary" onClick={() => handleSaveEdit(c.id)}>
                        <Send fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={handleCancelEdit}>
                        <ArrowBack fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Typography variant="body2">{c.content}</Typography>
                  )}
                </ListItem>
              )
            })}
          </List>
        )}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Escreva um comentário..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitComment() } }}
            disabled={submitting}
          />
          <IconButton color="primary" onClick={handleSubmitComment} disabled={submitting || !newComment.trim()}>
            <Send />
          </IconButton>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="outlined" onClick={() => navigate('/service-orders')}>
          Voltar para a Lista
        </Button>
      </Box>

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
