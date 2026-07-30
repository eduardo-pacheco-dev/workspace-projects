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
  Avatar,
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
  MenuItem,
} from '@mui/material'
import { ArrowBack, Edit, Person, Email, Phone, Language, AttachFile, Delete, Download, Visibility, PictureAsPdf } from '@mui/icons-material'
import api from '../../services/api'

interface Attachment {
  id: number
  freelancerId: number
  filename: string
  originalName: string
  mimetype: string
  size: number
  createdAt: string
}

interface Freelancer {
  id: number
  userId: number
  firstName: string
  lastName: string
  email?: string
  phone?: string
  bio: string
  portfolio: string
  hourlyRate: number
  skills: string
  experienceLevel: string
  availability: string
}

const expLevelMap: Record<string, string> = {
  junior: 'Junior',
  mid: 'Pleno',
  senior: 'Sênior',
  lead: 'Lead',
}

const availMap: Record<string, { label: string; color: 'success' | 'warning' | 'error' }> = {
  available: { label: 'Disponível', color: 'success' },
  busy: { label: 'Ocupado', color: 'warning' },
  unavailable: { label: 'Indisponível', color: 'error' },
}

export default function FreelancerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [freelancer, setFreelancer] = useState<Freelancer | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<{ url: string; type: string; name: string } | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', bio: '', portfolio: '',
    hourlyRate: 0, skills: '', experienceLevel: 'mid', availability: 'available',
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.get(`/freelancers/${id}`)
      .then((res) => setFreelancer(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
      .finally(() => setLoading(false))
  }, [id])

  const fetchAttachments = () => {
    api.get(`/attachments/freelancer/${id}`)
      .then((res) => setAttachments(res.data))
      .catch(() => {})
  }

  useEffect(() => {
    fetchAttachments()
  }, [id])

  if (loading) return <Container sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Container>
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>
  if (!freelancer) return <Container sx={{ mt: 4 }}><Alert severity="warning">Freelancer não encontrado.</Alert></Container>

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      await api.post(`/attachments/upload-freelancer/${id}`, form)
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

  const handleOpenEdit = () => {
    setForm({
      firstName: freelancer.firstName,
      lastName: freelancer.lastName,
      email: freelancer.email || '',
      phone: freelancer.phone ? formatPhone(freelancer.phone) : '',
      bio: freelancer.bio || '',
      portfolio: freelancer.portfolio || '',
      hourlyRate: freelancer.hourlyRate,
      skills: freelancer.skills || '',
      experienceLevel: freelancer.experienceLevel,
      availability: freelancer.availability,
    })
    setEditOpen(true)
  }

  const handleFormChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'phone' ? formatPhone(e.target.value) : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmitEdit = async () => {
    setSaving(true)
    try {
      const payload = { ...form, hourlyRate: Number(form.hourlyRate), phone: form.phone.replace(/\D/g, '') }
      const { data } = await api.patch(`/freelancers/${id}`, payload)
      setFreelancer(data)
      setEditOpen(false)
    } catch {
      setError('Não foi possível salvar as alterações.')
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = (att: Attachment) => {
    setPreview({ url: `/api/attachments/file/${att.id}`, type: att.mimetype, name: att.originalName })
  }

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length < 3) return digits
    if (digits.length < 8) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  const displayPhone = freelancer.phone ? formatPhone(freelancer.phone) : '-'

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const skills = typeof freelancer.skills === 'string'
    ? freelancer.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : freelancer.skills

  const availInfo = availMap[freelancer.availability] || { label: freelancer.availability, color: 'warning' as const }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <IconButton onClick={() => navigate('/freelancers')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>Detalhes do Freelancer</Typography>
        <Button variant="contained" startIcon={<Edit />} onClick={handleOpenEdit}>
          Editar
        </Button>
      </Box>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 32 }}>
            <Person />
          </Avatar>
          <Box>
            <Typography variant="h4">{freelancer.firstName} {freelancer.lastName}</Typography>
            <Chip
              label={availInfo.label}
              color={availInfo.color}
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Nome</Typography>
            <Typography variant="body1" gutterBottom>{freelancer.firstName} {freelancer.lastName}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Valor por Hora</Typography>
            <Typography variant="body1" gutterBottom>${freelancer.hourlyRate}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Nível de Experiência</Typography>
            <Typography variant="body1" gutterBottom>{expLevelMap[freelancer.experienceLevel] || freelancer.experienceLevel}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Disponibilidade</Typography>
            <Chip label={availInfo.label} color={availInfo.color} size="small" />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">Bio</Typography>
            <Typography variant="body1" gutterBottom>{freelancer.bio || '-'}</Typography>
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
        <Typography variant="h6" sx={{ mb: 2 }}>Contato</Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Email color="action" />
            <Box>
              <Typography variant="subtitle2" color="text.secondary">E-mail</Typography>
              <Typography variant="body1">{freelancer.email || '-'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Phone color="action" />
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Telefone</Typography>
              <Typography variant="body1">{displayPhone}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Language color="action" />
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Portfolio</Typography>
              {freelancer.portfolio ? (
                <Typography variant="body1" component="a" href={freelancer.portfolio} target="_blank" rel="noopener noreferrer" sx={{ color: 'primary.main' }}>
                  {freelancer.portfolio}
                </Typography>
              ) : (
                <Typography variant="body1">-</Typography>
              )}
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

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="outlined" onClick={() => navigate('/freelancers')}>
          Voltar para a Lista
        </Button>
      </Box>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Freelancer</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Nome" value={form.firstName} onChange={handleFormChange('firstName')} fullWidth />
              <TextField label="Sobrenome" value={form.lastName} onChange={handleFormChange('lastName')} fullWidth />
            </Box>
            <TextField label="E-mail" type="email" value={form.email} onChange={handleFormChange('email')} fullWidth />
            <TextField label="Telefone" value={form.phone} onChange={handleFormChange('phone')} fullWidth placeholder="(11) 99999-9999" />
            <TextField label="Bio" multiline rows={3} value={form.bio} onChange={handleFormChange('bio')} fullWidth />
            <TextField label="Portfolio (URL)" value={form.portfolio} onChange={handleFormChange('portfolio')} fullWidth />
            <TextField label="Valor por Hora" type="number" value={form.hourlyRate} onChange={handleFormChange('hourlyRate')} fullWidth />
            <TextField label="Habilidades (separadas por vírgula)" value={form.skills} onChange={handleFormChange('skills')} fullWidth />
            <TextField label="Nível" select value={form.experienceLevel} onChange={handleFormChange('experienceLevel')} fullWidth>
              <MenuItem value="junior">Junior</MenuItem>
              <MenuItem value="mid">Pleno</MenuItem>
              <MenuItem value="senior">Sênior</MenuItem>
              <MenuItem value="lead">Lead</MenuItem>
            </TextField>
            <TextField label="Disponibilidade" select value={form.availability} onChange={handleFormChange('availability')} fullWidth>
              <MenuItem value="available">Disponível</MenuItem>
              <MenuItem value="busy">Ocupado</MenuItem>
              <MenuItem value="unavailable">Indisponível</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmitEdit} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

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
