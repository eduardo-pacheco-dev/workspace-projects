import { useState, useCallback, useEffect } from 'react'
import { Alert, Box, CircularProgress, Divider, IconButton, List, ListItem, Pagination, Paper, Stack, TextField, Typography } from '@mui/material'
import { ArrowBack, Delete, Edit, Send } from '@mui/icons-material'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import DeleteModal from '../modals/DeleteModal'
import { CompanyComment } from '../../pages/companies/companiesTypes'

const PAGE_SIZE = 5

interface CompanyCommentsTabProps {
  companyId: number
}

export default function CompanyCommentsTab({ companyId }: CompanyCommentsTabProps) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [comments, setComments] = useState<CompanyComment[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [commentsError, setCommentsError] = useState('')
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const [toDelete, setToDelete] = useState<CompanyComment | null>(null)

  const load = useCallback(() => {
    setCommentsError('')
    api.get(`/comments/company/${companyId}`, { params: { page, limit: PAGE_SIZE } })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.data ?? []
        setComments(data)
        setTotal(Array.isArray(res.data) ? res.data.length : res.data.total ?? 0)
      })
      .catch((err) => {
        setCommentsError(err.response?.data?.message || 'Não foi possível carregar os comentários.')
      })
  }, [companyId, page])

  useEffect(() => {
    load()
  }, [load])

  const submitComment = async () => {
    if (!newComment.trim()) return
    setSubmitting(true)
    try {
      await api.post(`/comments/company/${companyId}`, { content: newComment })
      setNewComment('')
      load()
      showToast('Comentário adicionado com sucesso.')
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível enviar o comentário.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (comment: CompanyComment) => {
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
      setToDelete(null)
      load()
      showToast('Comentário excluído com sucesso.')
    } catch (err: any) {
      setToDelete(null)
      showToast(err.response?.data?.message || 'Não foi possível excluir o comentário.', 'error')
    }
  }

  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2, bgcolor: 'background.paper' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, color: 'rgb(0, 21, 68)', mb: 2 }}>Comentários</Typography>
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
                        <IconButton size="small" onClick={() => setToDelete(comment)}>
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
      {total > PAGE_SIZE && (
        <Stack alignItems="center" sx={{ mt: 2 }}>
          <Pagination count={Math.ceil(total / PAGE_SIZE)} page={page} onChange={(_, value) => setPage(value)} size="small" />
        </Stack>
      )}

      <DeleteModal
        open={Boolean(toDelete)}
        title="Excluir comentário"
        message={`Tem certeza que deseja excluir o comentário de ${toDelete?.author}? Esta ação não poderá ser desfeita.`}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteComment(toDelete.id)}
      />
    </Paper>
  )
}
