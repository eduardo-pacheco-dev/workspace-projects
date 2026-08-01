import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Container,
  Typography,
  Card,
  CardContent,
  Paper,
  Alert,
  Box,
  Grid,
  Chip,
  Button,
  Divider,
  Tabs,
  Tab,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  CircularProgress,
} from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import FolderIcon from '@mui/icons-material/Folder'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DownloadIcon from '@mui/icons-material/Download'
import SendIcon from '@mui/icons-material/Send'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { formatDateTime } from '../../utils/format'
import ProjectModal from './ProjectModal'

interface Project {
  id: number
  nome: string
  codigo: string | null
  descricao: string | null
  cliente: string | null
  dataInicio: string | null
  dataFim: string | null
  observacoes: string | null
  status: string
  createdAt: string
  updatedAt: string
}

interface Attachment {
  id: number
  filename: string
  originalName: string
  mimetype: string
  size: number
}

interface Comment {
  id: number
  content: string
  author: string
  createdAt: string
}

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const projectId = Number(id)
  const [project, setProject] = useState<Project | null>(null)
  const [error, setError] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [tab, setTab] = useState(0)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<{ url: string; type: string; name: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentsError, setCommentsError] = useState('')
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get(`/projects/${projectId}`)
      setProject(res.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar o projeto.')
    }
  }, [projectId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const fetchAttachments = useCallback(() => {
    api.get(`/attachments/project/${projectId}`)
      .then((res) => setAttachments(res.data))
      .catch(() => {})
  }, [projectId])

  useEffect(() => {
    fetchAttachments()
  }, [fetchAttachments])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      await api.post(`/attachments/upload/project/${projectId}`, form)
      fetchAttachments()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível enviar o arquivo.')
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir o anexo.')
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

  const fetchComments = useCallback(() => {
    setCommentsError('')
    api.get(`/comments/project/${projectId}`)
      .then((res) => {
        setComments(res.data)
      })
      .catch((err) => {
        setCommentsError(err.response?.data?.message || 'Não foi possível carregar os comentários.')
      })
  }, [projectId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return
    setSubmitting(true)
    try {
      await api.post(`/comments/project/${projectId}`, { content: newComment })
      setNewComment('')
      fetchComments()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível enviar o comentário.')
    } finally {
      setSubmitting(false)
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível editar o comentário.')
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Tem certeza que deseja excluir este comentário?')) return
    try {
      await api.delete(`/comments/${commentId}`)
      fetchComments()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir o comentário.')
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir o projeto "${project?.nome}"?`)) return
    try {
      await api.delete(`/projects/${projectId}`)
      navigate('/projects')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir. Tente novamente.')
    }
  }

  const formatDate = (value: string | null) => {
    if (!value) return null
    const date = new Date(`${value}T00:00:00`)
    return isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR')
  }

  const fields = project
    ? [
        { label: 'Código', value: project.codigo || '-' },
        { label: 'Cliente', value: project.cliente || '-' },
        { label: 'Data de Início', value: formatDate(project.dataInicio) || '-' },
        { label: 'Data de Término', value: formatDate(project.dataFim) || 'Indeterminado' },
        { label: 'Descrição', value: project.descricao || '-' },
        { label: 'Observações', value: project.observacoes || '-' },
        { label: 'Criado em', value: formatDateTime(project.createdAt) },
        { label: 'Atualizado em', value: formatDateTime(project.updatedAt) },
      ]
    : []

  return (
    <Container sx={{ mt: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/projects')} sx={{ mb: 2 }}>
        Voltar
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {project && (
        <>
          <Card sx={{ mb: 3, bgcolor: 'rgba(46, 125, 50, 0.08)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FolderIcon color="success" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{project.nome}</Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      {project.codigo || 'Sem código'} {project.cliente ? ` · ${project.cliente}` : ''}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditOpen(true)} sx={{ mr: 1 }}>
                    Editar
                  </Button>
                  <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDelete}>
                    Excluir
                  </Button>
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Chip
                  label={project.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  color={project.status === 'ativo' ? 'success' : 'default'}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>

          <Paper sx={{ mb: 3 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
              <Tab label="Overview" />
              <Tab label="Anexos" />
              <Tab label="Comentários" />
            </Tabs>
          </Paper>

          {tab === 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Informações do Projeto</Typography>
              <Grid container spacing={2}>
                {fields.map((field) => (
                  <Grid item xs={12} sm={6} key={field.label}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {field.label}
                    </Typography>
                    <Typography variant="body1">{field.value}</Typography>
                    <Divider sx={{ mt: 1 }} />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {tab === 1 && (
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Anexos</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AttachFileIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? 'Enviando...' : 'Adicionar Anexo'}
                </Button>
                <input ref={fileInputRef} type="file" hidden onChange={handleUpload} />
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
                            <PictureAsPdfIcon color="error" />
                          ) : (
                            <AttachFileIcon fontSize="small" />
                          )}
                        </ListItemIcon>
                        <ListItemText primary={att.originalName} secondary={formatSize(att.size)} />
                        <ListItemSecondaryAction>
                          {(isImage || isPdf) && (
                            <IconButton size="small" onClick={() => handlePreview(att)}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton size="small" component="a" href={`/api/attachments/download/${att.id}`} target="_blank">
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteAttachment(att.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    )
                  })}
                </List>
              )}
            </Paper>
          )}

          {tab === 2 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Comentários</Typography>
              <Divider sx={{ mb: 2 }} />
              {commentsError && <Alert severity="error" sx={{ mb: 2 }}>{commentsError}</Alert>}
              {!commentsError && comments.length === 0 ? (
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
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" onClick={() => handleDeleteComment(c.id)}>
                                  <DeleteIcon fontSize="small" />
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
                              <SendIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={handleCancelEdit}>
                              <ArrowBackIcon fontSize="small" />
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
                  {submitting ? <CircularProgress size={20} /> : <SendIcon />}
                </IconButton>
              </Box>
            </Paper>
          )}

          <ProjectModal
            open={editOpen}
            editId={projectId}
            onClose={() => setEditOpen(false)}
            onSaved={() => {
              setEditOpen(false)
              fetchData()
            }}
          />
        </>
      )}

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
