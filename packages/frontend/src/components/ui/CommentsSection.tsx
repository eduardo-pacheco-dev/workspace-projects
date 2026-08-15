import { useState, useCallback, useEffect } from 'react'
import { Alert, Box, CircularProgress, Divider, IconButton, List, ListItem, Pagination, Paper, Stack, TextField, Typography } from '@mui/material'
import { ArrowBack, Delete, Edit, Send } from '@mui/icons-material'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import ConfirmDialog from './ConfirmDialog'

export type CommentResource = 'client' | 'job' | 'project' | 'company' | 'service-order' | 'station' | 'radio-link'

interface Comment {
  id: number
  content: string
  author: string
  createdAt: string
}

interface CommentsSectionProps {
  resource: CommentResource
  resourceId: number
  paginated?: boolean
  pageSize?: number
  title?: string
}

export default function CommentsSection({ resource, resourceId, paginated = false, pageSize = 5, title = 'Comentários' }: CommentsSectionProps) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [commentsError, setCommentsError] = useState('')
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const [toDelete, setToDelete] = useState<number | null>(null)

  const load = useCallback(() => {
    setCommentsError('')
    const params = paginated ? { page, limit: pageSize } : undefined
    api.get(`/comments/${resource}/${resourceId}`, { params })
      .then((res) => {
        if (paginated) {
          const data = Array.isArray(res.data) ? res.data : res.data.data ?? []
          setComments(data)
          setTotal(Array.isArray(res.data) ? res.data.length : res.data.total ?? 0)
        } else {
          setComments(res.data)
        }
      })
      .catch((err) => {
        setCommentsError(err.response?.data?.message || 'Não foi possível carregar os comentários.')
      })
  }, [resource, resourceId, paginated, page, pageSize])

  useEffect(() => {
    load()
  }, [load])

  const submitComment = async () => {
    if (!newComment.trim()) return
    setSubmitting(true)
    try {
      await api.post(`/comments/${resource}/${resourceId}`, { content: newComment })
      setNewComment('')
      load()
      showToast('Comentário adicionado com sucesso.')
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível enviar o comentário.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditContent('')
  }

  const saveEdit = async (commentId: number) => {
    if (!editContent.trim()) return
    try {
      await api.patch(`/comments/${commentId}`, { content: editContent })
      setEditingId(null)
      setEditContent('')
      load()
      showToast('Comentário atualizado com sucesso.')
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível editar o comentário.', 'error')
    }
  }

  const deleteComment = async (commentId: number) => {
    try {
      await api.delete(`/comments/${commentId}`)
      load()
      showToast('Comentário excluído com sucesso.')
      setToDelete(null)
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível excluir o comentário.', 'error')
      setToDelete(null)
    }
  }

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
      <Divider sx={{ mb: 2 }} />
      {commentsError && <Alert severity="error" sx={{ mb: 2 }}>{commentsError}</Alert>}
      {!commentsError && comments.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Nenhum comentário ainda.</Typography>
      ) : (
        <List dense disablePadding sx={{ mb: 2 }}>
          {comments.map((comment) => {
            const isOwner = user?.email === comment.author
            return (
              <ListItem key={comment.id} sx={{ px: 0, flexDirection: 'column', alignItems: 'stretch' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="subtitle2">{comment.author}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(comment.createdAt).toLocaleString('pt-BR')}
                    </Typography>
                    {isOwner && editingId !== comment.id && (
                      <>
                        <IconButton size="small" onClick={() => startEdit(comment)}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => setToDelete(comment.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </Box>
                {editingId === comment.id ? (
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      autoFocus
                    />
                    <IconButton size="small" color="primary" onClick={() => saveEdit(comment.id)}>
                      <Send fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={cancelEdit}>
                      <ArrowBack fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Typography variant="body2">{comment.content}</Typography>
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
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment() } }}
          disabled={submitting}
        />
        <IconButton color="primary" onClick={submitComment} disabled={submitting || !newComment.trim()}>
          {submitting ? <CircularProgress size={20} /> : <Send />}
        </IconButton>
      </Box>
      {paginated && total > pageSize && (
        <Stack alignItems="center" sx={{ mt: 2 }}>
          <Pagination count={Math.ceil(total / pageSize)} page={page} onChange={(_, value) => setPage(value)} size="small" />
        </Stack>
      )}

      <ConfirmDialog
        open={toDelete != null}
        title="Excluir comentário"
        message="Tem certeza que deseja excluir este comentário?"
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete != null && deleteComment(toDelete)}
      />
    </Paper>
  )
}
