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
} from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna'
import ShareIcon from '@mui/icons-material/Share'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DownloadIcon from '@mui/icons-material/Download'
import SendIcon from '@mui/icons-material/Send'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { formatDateTime } from '../../utils/format'
import RadioLinkModal from './RadioLinkModal'

interface RadioLink {
  id: number
  nome: string
  frequencia: string | null
  capacidade: string | null
  siteIdA: string | null
  endIdA: string | null
  enderecoA: string | null
  latitudeA: number | null
  longitudeA: number | null
  operadoraA: string | null
  siteIdB: string | null
  endIdB: string | null
  enderecoB: string | null
  latitudeB: number | null
  longitudeB: number | null
  operadoraB: string | null
  observacoes: string | null
  status: string
  createdAt: string
  updatedAt: string
}

const operadoraColors: Record<string, 'success' | 'info' | 'warning' | 'default'> = {
  TIM: 'info',
  CLARO: 'warning',
  VIVO: 'success',
  Outras: 'default',
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

const distanceLabelStyle = `
.radio-link-distance-icon {
  width: 220px !important;
  height: 40px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
}
.radio-link-distance {
  background-color: #6a1b9a;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 2px 10px;
  font-weight: 600;
  font-size: 13px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  transform-origin: center;
}
`

const toRad = (deg: number) => (deg * Math.PI) / 180
const toDeg = (rad: number) => (rad * 180) / Math.PI

function bearingBetween(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const phi1 = toRad(lat1)
  const phi2 = toRad(lat2)
  const deltaLng = toRad(lng2 - lng1)
  const y = Math.sin(deltaLng) * Math.cos(phi2)
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLng)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

export default function RadioLinkDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const radioLinkId = Number(id)
  const [radioLink, setRadioLink] = useState<RadioLink | null>(null)
  const [error, setError] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
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
      const res = await api.get(`/radio-links/${radioLinkId}`)
      setRadioLink(res.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar o enlace.')
    }
  }, [radioLinkId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const fetchAttachments = useCallback(() => {
    api.get(`/attachments/radio-link/${radioLinkId}`)
      .then((res) => setAttachments(res.data))
      .catch(() => {})
  }, [radioLinkId])

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
      await api.post(`/attachments/upload/radio-link/${radioLinkId}`, form)
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
    api.get(`/comments/radio-link/${radioLinkId}`)
      .then((res) => {
        setComments(res.data)
      })
      .catch((err) => {
        setCommentsError(err.response?.data?.message || 'Não foi possível carregar os comentários.')
      })
  }, [radioLinkId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return
    setSubmitting(true)
    try {
      await api.post(`/comments/radio-link/${radioLinkId}`, { content: newComment })
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

  useEffect(() => {
    if (!radioLink || !mapRef.current) return
    const latA = radioLink.latitudeA
    const lngA = radioLink.longitudeA
    const latB = radioLink.latitudeB
    const lngB = radioLink.longitudeB
    if (latA == null || lngA == null || latB == null || lngB == null) return

    const map = L.map(mapRef.current)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    const points: [number, number][] = []
    L.circleMarker([latA, lngA], { radius: 8, color: '#1565c0', fillColor: '#1565c0', fillOpacity: 1 })
      .addTo(map)
      .bindPopup(`Estação A: ${radioLink.siteIdA || ''}`)
    points.push([latA, lngA])

    L.circleMarker([latB, lngB], { radius: 8, color: '#c62828', fillColor: '#c62828', fillOpacity: 1 })
      .addTo(map)
      .bindPopup(`Estação B: ${radioLink.siteIdB || ''}`)
    points.push([latB, lngB])

    const distanceM = map.distance([latA, lngA], [latB, lngB])
    const distanceKm = distanceM / 1000
    const distanceLabel = distanceKm >= 100 ? `${distanceKm.toFixed(0)} km` : `${distanceKm.toFixed(1)} km`

    L.polyline(points, { color: '#6a1b9a', weight: 3, dashArray: '6 6' }).addTo(map)

    const bearing = bearingBetween(latA, lngA, latB, lngB)
    const rotation = bearing - 90

    const midpoint = L.latLng((latA + latB) / 2, (lngA + lngB) / 2)
    const icon = L.divIcon({
      className: 'radio-link-distance-icon',
      html: `<span class="radio-link-distance" style="transform: rotate(${rotation}deg)">${distanceLabel}</span>`,
      iconSize: [220, 40],
      iconAnchor: [110, 20],
    })
    L.marker(midpoint, { icon, interactive: false }).addTo(map)

    map.fitBounds(L.latLngBounds(points), { padding: [40, 40] })

    return () => {
      map.remove()
    }
  }, [radioLink])

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir o enlace "${radioLink?.nome}"?`)) return
    try {
      await api.delete(`/radio-links/${radioLinkId}`)
      navigate('/radio-links')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir. Tente novamente.')
    }
  }

  const handleShare = async (lat: number, lng: number, label: string) => {
    const text = `Estação ${label} do enlace ${radioLink?.nome}`
    const url = `https://maps.google.com/maps?q=${lat},${lng}`
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

  const renderEnd = (title: string, end: {
    siteId: string | null
    endId: string | null
    endereco: string | null
    latitude: number | null
    longitude: number | null
    operadora: string | null
  }) => {
    const hasCoords = end.latitude != null && end.longitude != null
    const fields = [
      { label: 'Site ID', value: end.siteId || '-' },
      { label: 'End ID', value: end.endId || '-' },
      { label: 'Endereço', value: end.endereco || '-' },
      {
        label: 'Coordenadas',
        value: hasCoords ? `${end.latitude}, ${end.longitude}` : '-',
      },
    ]

    return (
      <Paper sx={{ p: 3, mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="h6">{title}</Typography>
          {end.operadora && (
            <Chip size="small" label={end.operadora} color={operadoraColors[end.operadora] || 'default'} />
          )}
        </Box>
        <Grid container spacing={2}>
          {fields.map((field) => (
            <Grid item xs={12} sm={6} key={field.label}>
              <Typography variant="subtitle2" color="text.secondary">
                {field.label}
              </Typography>
              <Typography variant="body1">{field.value}</Typography>
            </Grid>
          ))}
        </Grid>
      </Paper>
    )
  }

  const hasBothCoords =
    radioLink != null &&
    radioLink.latitudeA != null &&
    radioLink.longitudeA != null &&
    radioLink.latitudeB != null &&
    radioLink.longitudeB != null

  return (
    <Container sx={{ mt: 4 }}>
      <style>{distanceLabelStyle}</style>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/radio-links')} sx={{ mb: 2 }}>
        Voltar
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {radioLink && (
        <>
          <Card sx={{ mb: 3, bgcolor: 'rgba(156, 39, 176, 0.08)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SettingsInputAntennaIcon color="secondary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{radioLink.nome}</Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      {radioLink.frequencia || 'Sem frequência'}
                      {radioLink.capacidade ? ` · ${radioLink.capacidade}` : ''}
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
                  label={radioLink.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  color={radioLink.status === 'ativo' ? 'success' : 'default'}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Informações do Enlace</Typography>
            <Grid container spacing={2}>
              {[
                { label: 'Nome', value: radioLink.nome },
                { label: 'Frequência', value: radioLink.frequencia || '-' },
                { label: 'Capacidade', value: radioLink.capacidade || '-' },
                { label: 'Observações', value: radioLink.observacoes || '-' },
                { label: 'Criado em', value: formatDateTime(radioLink.createdAt) },
                { label: 'Atualizado em', value: formatDateTime(radioLink.updatedAt) },
              ].map((field) => (
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

          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} md={6}>
              {renderEnd('Estação A', {
                siteId: radioLink.siteIdA,
                endId: radioLink.endIdA,
                endereco: radioLink.enderecoA,
                latitude: radioLink.latitudeA,
                longitude: radioLink.longitudeA,
                operadora: radioLink.operadoraA,
              })}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderEnd('Estação B', {
                siteId: radioLink.siteIdB,
                endId: radioLink.endIdB,
                endereco: radioLink.enderecoB,
                latitude: radioLink.latitudeB,
                longitude: radioLink.longitudeB,
                operadora: radioLink.operadoraB,
              })}
            </Grid>
          </Grid>

          <Paper sx={{ p: 3, mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h6">Mapa do Enlace</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {radioLink.latitudeA != null && radioLink.longitudeA != null && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ShareIcon />}
                    onClick={() => handleShare(radioLink.latitudeA!, radioLink.longitudeA!, 'A')}
                  >
                    Compartilhar A
                  </Button>
                )}
                {radioLink.latitudeB != null && radioLink.longitudeB != null && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ShareIcon />}
                    onClick={() => handleShare(radioLink.latitudeB!, radioLink.longitudeB!, 'B')}
                  >
                    Compartilhar B
                  </Button>
                )}
              </Box>
            </Box>
            {hasBothCoords ? (
              <Box
                ref={mapRef}
                sx={{
                  width: '100%',
                  height: 420,
                  borderRadius: 1,
                  overflow: 'hidden',
                  zIndex: 0,
                }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                As duas pontas precisam de coordenadas para exibir o mapa do enlace.
              </Typography>
            )}
          </Paper>

          <Paper sx={{ p: 3, mt: 3 }}>
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

          <RadioLinkModal
            open={editOpen}
            editId={radioLinkId}
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
