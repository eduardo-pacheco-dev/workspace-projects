import { useState, useEffect } from 'react'
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
  TextField,
} from '@mui/material'
import {
  ArrowBack,
  Edit,
  Assignment,
  Send,
  Delete,
} from '@mui/icons-material'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

interface Comment {
  id: number
  content: string
  author: string
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
    </Container>
  )
}
