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
  TablePagination,
  Stack,
  MenuItem,
} from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CellTowerIcon from '@mui/icons-material/CellTower'
import ShareIcon from '@mui/icons-material/Share'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DownloadIcon from '@mui/icons-material/Download'
import SendIcon from '@mui/icons-material/Send'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import ConfirmDialog from '../../components/ConfirmDialog'
import { formatDateTime } from '../../utils/format'
import StationModal from './StationModal'

interface Station {
  id: number
  siteId: string
  endId: string
  elementType: string | null
  technology: string | null
  areaHolder: string | null
  infraContractType: string | null
  infraHolder: string | null
  infraType: string | null
  evType: string | null
  evSupplier: string | null
  address: string | null
  regional: string | null
  latitude: number | null
  longitude: number | null
  mobileCarrier: string | null
  towerType: string | null
  nominalAev: number | null
  groundArea: number | null
  structureHeight: number | null
  stationId: string | null
  notes: string | null
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

const mobileCarrierColors: Record<string, 'success' | 'info' | 'warning' | 'default'> = {
  TIM: 'info',
  CLARO: 'warning',
  VIVO: 'success',
  Outras: 'default',
}

export default function StationDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const stationId = Number(id)
  const { showToast } = useToast()
  const [station, setStation] = useState<Station | null>(null)
  const [error, setError] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<{ url: string; type: string; name: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [attachmentPage, setAttachmentPage] = useState(0)
  const [attachmentsTotal, setAttachmentsTotal] = useState(0)
  const [attachmentsPerPage, setAttachmentsPerPage] = useState(5)
  const [attachmentSearch, setAttachmentSearch] = useState('')
  const [attachmentType, setAttachmentType] = useState('')
  const [comments, setComments] = useState<Comment[]>([])
  const [commentsError, setCommentsError] = useState('')
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [attachmentToDelete, setAttachmentToDelete] = useState<Attachment | null>(null)
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null)
  const [commentPage, setCommentPage] = useState(0)
  const [commentsTotal, setCommentsTotal] = useState(0)
  const [commentsPerPage, setCommentsPerPage] = useState(5)

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get(`/stations/${stationId}`)
      setStation(res.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar a estação.')
    }
  }, [stationId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const fetchAttachments = useCallback(() => {
    api
      .get(`/attachments/station/${stationId}`, {
        params: {
          page: attachmentPage + 1,
          limit: attachmentsPerPage,
          search: attachmentSearch || undefined,
          type: attachmentType || undefined,
        },
      })
      .then((res) => {
        setAttachments(res.data.data ?? [])
        setAttachmentsTotal(res.data.total ?? 0)
      })
      .catch(() => {})
  }, [stationId, attachmentPage, attachmentsPerPage, attachmentSearch, attachmentType])

  useEffect(() => {
    fetchAttachments()
  }, [fetchAttachments])

  const fetchComments = useCallback(() => {
    setCommentsError('')
    api
      .get(`/comments/station/${stationId}`, {
        params: { page: commentPage + 1, limit: commentsPerPage },
      })
      .then((res) => {
        setComments(res.data.data ?? [])
        setCommentsTotal(res.data.total ?? 0)
      })
      .catch((err) => {
        setCommentsError(err.response?.data?.message || 'Não foi possível carregar os comentários.')
      })
  }, [stationId, commentPage, commentsPerPage])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return
    setSubmitting(true)
    try {
      await api.post(`/comments/station/${stationId}`, { content: newComment })
      setNewComment('')
      setCommentPage(0)
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
    try {
      await api.delete(`/comments/${commentId}`)
      setCommentPage(0)
      fetchComments()
      showToast('Comentário excluído com sucesso.')
      setCommentToDelete(null)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir o comentário.')
      showToast(err.response?.data?.message || 'Não foi possível excluir o comentário.', 'error')
      setCommentToDelete(null)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const MAX_SIZE = 50 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      showToast('O arquivo excede o limite de 50MB.', 'error')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      await api.post(`/attachments/upload/station/${stationId}`, form)
      setAttachmentPage(0)
      fetchAttachments()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível enviar o arquivo.')
      showToast(err.response?.data?.message || 'Não foi possível enviar o arquivo.', 'error')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeleteAttachment = async (attId: number) => {
    try {
      await api.delete(`/attachments/${attId}`)
      setAttachmentPage(0)
      fetchAttachments()
      showToast('Anexo excluído com sucesso.')
      setAttachmentToDelete(null)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir o anexo.')
      showToast(err.response?.data?.message || 'Não foi possível excluir o anexo.', 'error')
      setAttachmentToDelete(null)
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

  const handleDelete = async () => {
    try {
      await api.delete(`/stations/${stationId}`)
      showToast('Estação excluída com sucesso.')
      navigate('/stations')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir. Tente novamente.')
      showToast(err.response?.data?.message || 'Não foi possível excluir. Tente novamente.', 'error')
    }
  }

  const handleShare = async () => {
    if (!station) return
    const text = `Estação ${station.siteId} (${station.mobileCarrier || 'sem operadora'})`
    const url = `https://maps.google.com/maps?q=${station.latitude},${station.longitude}`
    if (navigator.share) {
      try {
        await navigator.share({ title: text, text, url })
        return
      } catch (err: any) {
        if (err?.name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} - ${url}`)
      alert('Link copiado para a área de transferência!')
    } catch {
      alert(`Compartilhe este link: ${url}`)
    }
  }

  const fields = station
    ? [
        { label: 'Site ID', value: station.siteId },
        ...(station.mobileCarrier === 'TIM'
          ? [{ label: 'End ID', value: station.endId }]
          : []),
        { label: 'Tipo de elemento', value: station.elementType || '-' },
        { label: 'Tecnologia', value: station.technology || '-' },
        { label: 'Operadora', value: station.mobileCarrier || '-' },
        { label: 'Regional', value: station.regional || '-' },
        { label: 'Tipo da torre', value: station.towerType || '-' },
        { label: 'Detentor da Área', value: station.areaHolder || '-' },
        { label: 'Detentor de Infra', value: station.infraHolder || '-' },
        { label: 'Tipo de contrato Infra', value: station.infraContractType || '-' },
        { label: 'Tipo de Infra', value: station.infraType || '-' },
        { label: 'Tipo de EV', value: station.evType || '-' },
        { label: 'Fornecedor de EV', value: station.evSupplier || '-' },
        { label: 'AEV Nominal', value: station.nominalAev != null ? String(station.nominalAev) : '-' },
        { label: 'Área de solo', value: station.groundArea != null ? String(station.groundArea) : '-' },
        { label: 'Altura da estrutura', value: station.structureHeight != null ? String(station.structureHeight) : '-' },
        { label: 'Station ID (id da detentora)', value: station.stationId || '-' },
        { label: 'Endereço', value: station.address || '-' },
        {
          label: 'Coordenadas',
          value:
            station.latitude != null && station.longitude != null
              ? `${station.latitude}, ${station.longitude}`
              : '-',
        },
        { label: 'Observações', value: station.notes || '-' },
        { label: 'Criado em', value: formatDateTime(station.createdAt) },
        { label: 'Atualizado em', value: formatDateTime(station.updatedAt) },
      ]
    : []

  return (
    <Container sx={{ mt: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/stations')} sx={{ mb: 2 }}>
        Voltar
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {station && (
        <>
          <Card sx={{ mb: 3, bgcolor: 'rgba(21, 101, 192, 0.08)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CellTowerIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{station.siteId}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Chip
                        size="small"
                        label={station.mobileCarrier || 'Sem operadora'}
                        color={mobileCarrierColors[station.mobileCarrier || ''] || 'default'}
                      />
                      {station.mobileCarrier === 'TIM' && (
                        <Typography variant="subtitle1" color="text.secondary">
                          · {station.endId}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
                <Box>
                  <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditOpen(true)} sx={{ mr: 1 }}>
                    Editar
                  </Button>
                  <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => setConfirmDelete(true)}>
                    Excluir
                  </Button>
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Chip
                  label={station.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  color={station.status === 'ativo' ? 'success' : 'default'}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Informações da Estação</Typography>
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

          <Paper sx={{ p: 3, mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h6">Localização no Mapa</Typography>
              {station.latitude != null && station.longitude != null && (
                <Button variant="outlined" startIcon={<ShareIcon />} onClick={handleShare}>
                  Compartilhar Localização
                </Button>
              )}
            </Box>
            {station.latitude != null && station.longitude != null ? (
              <Box
                component="iframe"
                title={`Mapa da estação ${station.siteId}`}
                src={`https://maps.google.com/maps?q=${station.latitude},${station.longitude}&z=16&output=embed`}
                loading="lazy"
                sx={{
                  width: '100%',
                  height: 400,
                  border: 0,
                  borderRadius: 1,
                  display: 'block',
                }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                Esta estação não possui coordenadas cadastradas.
              </Typography>
            )}
          </Paper>

          <Paper sx={{ p: 3, mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h6">Anexos</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Máx. 50MB por arquivo
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AttachFileIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? 'Enviando...' : 'Adicionar Anexo'}
                </Button>
              </Box>
              <input ref={fileInputRef} type="file" hidden onChange={handleUpload} />
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
              <TextField
                size="small"
                label="Buscar anexo"
                value={attachmentSearch}
                onChange={(e) => {
                  setAttachmentSearch(e.target.value)
                  setAttachmentPage(0)
                }}
                sx={{ minWidth: 220 }}
              />
              <TextField
                size="small"
                select
                label="Tipo"
                value={attachmentType}
                onChange={(e) => {
                  setAttachmentType(e.target.value)
                  setAttachmentPage(0)
                }}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="image">Imagens</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="document">Documentos</MenuItem>
              </TextField>
            </Stack>
            {attachments.length === 0 ? (
              <Typography variant="body2" color="text.secondary">Nenhum anexo encontrado.</Typography>
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
                        <IconButton size="small" onClick={() => setAttachmentToDelete(att)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  )
                })}
              </List>
            )}
            {attachmentsTotal > attachmentsPerPage && (
              <TablePagination
                component="div"
                count={attachmentsTotal}
                page={attachmentPage}
                onPageChange={(_, page) => setAttachmentPage(page)}
                rowsPerPage={attachmentsPerPage}
                onRowsPerPageChange={(e) => {
                  setAttachmentsPerPage(parseInt(e.target.value, 10))
                  setAttachmentPage(0)
                }}
                rowsPerPageOptions={[5, 10, 25]}
                labelRowsPerPage="Por página:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
              />
            )}
          </Paper>

          <Paper sx={{ p: 3, mt: 3 }}>
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
                              <IconButton size="small" onClick={() => setCommentToDelete(c.id)}>
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
            {commentsTotal > commentsPerPage && (
              <TablePagination
                component="div"
                count={commentsTotal}
                page={commentPage}
                onPageChange={(_, page) => setCommentPage(page)}
                rowsPerPage={commentsPerPage}
                onRowsPerPageChange={(e) => {
                  setCommentsPerPage(parseInt(e.target.value, 10))
                  setCommentPage(0)
                }}
                rowsPerPageOptions={[5, 10, 25]}
                labelRowsPerPage="Por página:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
              />
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

          <StationModal
            open={editOpen}
            editId={stationId}
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

      <ConfirmDialog
        open={confirmDelete}
        title="Excluir estação"
        message={`Tem certeza que deseja excluir a estação "${station?.siteId}"?`}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={!!attachmentToDelete}
        title="Excluir anexo"
        message={`Tem certeza que deseja excluir o anexo "${attachmentToDelete?.originalName}"?`}
        onClose={() => setAttachmentToDelete(null)}
        onConfirm={() => attachmentToDelete && handleDeleteAttachment(attachmentToDelete.id)}
      />

      <ConfirmDialog
        open={commentToDelete != null}
        title="Excluir comentário"
        message="Tem certeza que deseja excluir este comentário?"
        onClose={() => setCommentToDelete(null)}
        onConfirm={() => commentToDelete != null && handleDeleteComment(commentToDelete)}
      />
    </Container>
  )
}
