import { useState, useCallback, useEffect } from 'react'
import { Box, CircularProgress, Divider, IconButton, List, ListItem, Paper, TextField, Typography } from '@mui/material'
import { ArrowBack, Delete, Edit, Send } from '@mui/icons-material'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import ConfirmDialog from '../ConfirmDialog'

interface Comment {
  id: number
  jobId: number
  content: string
  author: string
  createdAt: string
}

interface JobCommentsSectionProps {
  jobId: number
  onError: (message: string) => void
}

export default function JobCommentsSection({ jobId, onError }: JobCommentsSectionProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const [toDelete, setToDelete] = useState<number | null>(null)

  const load = useCallback(() => {
    api.get(`/comments/job/${jobId}`)
      .then((res) => setComments(res.data))
      .catch(() => {})
  }, [jobId])

  useEffect(() => {
    load()
  }, [load])

  const submitComment = async () => {
    if (!newComment.trim()) return
    setSubmitting(true)
    try {
      await api.post(`/comments/job/${jobId}`, { content: newComment })
      setNewComment('')
      load()
    } catch (err: any) {
      onError(err.response?.data?.message || 'Não foi possível enviar o comentário.')
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
    } catch (err: any) {
      onError(err.response?.data?.message || 'Não foi possível editar o comentário.')
    }
  }

  const deleteComment = async (commentId: number) => {
    try {
      await api.delete(`/comments/${commentId}`)
      load()
      setToDelete(null)
    } catch (err: any) {
      onError(err.response?.data?.message || 'Não foi possível excluir o comentário.')
      setToDelete(null)
    }
  }

  return (
    <Paper sx={{ p: 4, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Comentários</Typography>
      <Divider sx={{ mb: 2 }} />
      {comments.length === 0 ? (
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
