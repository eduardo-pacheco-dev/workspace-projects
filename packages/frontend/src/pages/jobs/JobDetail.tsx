import { useState, useEffect, useRef } from 'react'
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material'
import { ArrowBack, Edit, AttachFile, Delete, Download, Visibility, PictureAsPdf, Send } from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'

interface Attachment {
  id: number
  jobId: number
  filename: string
  originalName: string
  mimetype: string
  size: number
  createdAt: string
}

interface Comment {
  id: number
  jobId: number
  content: string
  author: string
  createdAt: string
}

interface Job {
  id: number
  title: string
  description: string
  budget: number
  budgetType: string
  status: string
  skills: string
  experienceLevel: string
  clientId: string
}

const statusMap: Record<string, { label: string; color: 'info' | 'warning' | 'success' | 'error' }> = {
  open: { label: 'Aberto', color: 'info' },
  in_progress: { label: 'Em Andamento', color: 'warning' },
  completed: { label: 'Concluído', color: 'success' },
  cancelled: { label: 'Cancelado', color: 'error' },
}

const expLevelMap: Record<string, string> = {
  junior: 'Junior',
  mid: 'Pleno',
  senior: 'Sênior',
  lead: 'Lead',
}

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [job, setJob] = useState<Job | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<{ url: string; type: string; name: string } | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.get(`/jobs/${id}`)
      .then((res) => setJob(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
      .finally(() => setLoading(false))
  }, [id])

  const fetchAttachments = () => {
    api.get(`/attachments/job/${id}`)
      .then((res) => setAttachments(res.data))
      .catch(() => {})
  }

  useEffect(() => {
    fetchAttachments()
  }, [id])

  const fetchComments = () => {
    api.get(`/comments/job/${id}`)
      .then((res) => setComments(res.data))
      .catch(() => {})
  }

  useEffect(() => {
    fetchComments()
  }, [id])

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
      await api.post(`/comments/job/${id}`, { content: newComment })
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
  if (!job) return <Container sx={{ mt: 4 }}><Alert severity="warning">Job não encontrado.</Alert></Container>

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      await api.post(`/attachments/upload/${id}`, form)
      fetchAttachments()
    } catch (err: any) {
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

  const statusInfo = statusMap[job.status] || { label: job.status, color: 'info' as const }
  const skills = typeof job.skills === 'string'
    ? job.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : job.skills

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <IconButton onClick={() => navigate('/collaborators?tab=3')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>Detalhes do Job</Typography>
        <Button variant="contained" startIcon={<Edit />} onClick={() => navigate('/collaborators?tab=3')}>
          Editar
        </Button>
      </Box>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box>
            <Typography variant="h4">{job.title}</Typography>
            <Chip label={statusInfo.label} color={statusInfo.color} size="small" sx={{ mt: 0.5 }} />
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Orçamento</Typography>
            <Typography variant="body1" gutterBottom>${job.budget} ({job.budgetType === 'hourly' ? 'Por Hora' : 'Fixo'})</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Nível de Experiência</Typography>
            <Typography variant="body1" gutterBottom>{expLevelMap[job.experienceLevel] || job.experienceLevel}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Cliente</Typography>
            <Typography variant="body1" gutterBottom>{job.clientId || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Status</Typography>
            <Chip label={statusInfo.label} color={statusInfo.color} size="small" />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">Descrição</Typography>
            <Typography variant="body1" gutterBottom>{job.description || '-'}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Habilidades</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {skills.length > 0
                ? skills.map((s) => <Chip key={s} label={s} size="small" variant="outlined" color="primary" />)
                : <Typography variant="body2" color="text.secondary">Nenhuma habilidade cadastrada</Typography>
              }
            </Box>
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
        <Button variant="outlined" onClick={() => navigate('/collaborators?tab=3')}>
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
            <embed src={preview?.url} type="application/pdf" width="100%" height="600px" />
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreview(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
