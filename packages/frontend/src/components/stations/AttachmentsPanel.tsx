import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  TablePagination,
  TextField,
  Typography,
} from '@mui/material'
import { AttachFile, Delete, Download, PictureAsPdf, Visibility } from '@mui/icons-material'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import ConfirmDialog from '../ConfirmDialog'
import FilePreviewDialog from '../FilePreviewDialog'
import { Attachment } from '../../pages/tasks/tasksTypes'
import { formatSize } from '../../utils/format'

const MAX_FILE_SIZE = 50 * 1024 * 1024

interface AttachmentsPanelProps {
  stationId: number
  onError: (message: string) => void
}

export default function AttachmentsPanel({ stationId, onError }: AttachmentsPanelProps) {
  const { showToast } = useToast()
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<{ url: string; type: string; name: string } | null>(null)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [perPage, setPerPage] = useState(5)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [toDelete, setToDelete] = useState<Attachment | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(() => {
    api
      .get(`/attachments/station/${stationId}`, {
        params: {
          page: page + 1,
          limit: perPage,
          search: search || undefined,
          type: type || undefined,
        },
      })
      .then((res) => {
        setAttachments(res.data.data ?? [])
        setTotal(res.data.total ?? 0)
      })
      .catch(() => {})
  }, [stationId, page, perPage, search, type])

  useEffect(() => {
    load()
  }, [load])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_FILE_SIZE) {
      showToast('O arquivo excede o limite de 50MB.', 'error')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      await api.post(`/attachments/upload/station/${stationId}`, form)
      setPage(0)
      load()
    } catch (err: any) {
      const message = err.response?.data?.message || 'Não foi possível enviar o arquivo.'
      onError(message)
      showToast(message, 'error')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (attachmentId: number) => {
    try {
      await api.delete(`/attachments/${attachmentId}`)
      setPage(0)
      load()
      showToast('Anexo excluído com sucesso.')
      setToDelete(null)
    } catch (err: any) {
      const message = err.response?.data?.message || 'Não foi possível excluir o anexo.'
      onError(message)
      showToast(message, 'error')
      setToDelete(null)
    }
  }

  const handlePreview = (attachment: Attachment) => {
    setPreview({ url: `/api/attachments/file/${attachment.id}`, type: attachment.mimetype, name: attachment.originalName })
  }

  return (
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
            startIcon={<AttachFile />}
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
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(0)
          }}
          sx={{ minWidth: 220 }}
        />
        <TextField
          size="small"
          select
          label="Tipo"
          value={type}
          onChange={(e) => {
            setType(e.target.value)
            setPage(0)
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
          {attachments.map((attachment) => {
            const isImage = attachment.mimetype.startsWith('image/')
            const isPdf = attachment.mimetype === 'application/pdf'
            return (
              <ListItem key={attachment.id} sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 44 }}>
                  {isImage ? (
                    <Box
                      component="img"
                      src={`/api/attachments/file/${attachment.id}`}
                      sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1 }}
                    />
                  ) : isPdf ? (
                    <PictureAsPdf color="error" />
                  ) : (
                    <AttachFile fontSize="small" />
                  )}
                </ListItemIcon>
                <ListItemText primary={attachment.originalName} secondary={formatSize(attachment.size)} />
                <ListItemSecondaryAction>
                  {(isImage || isPdf) && (
                    <IconButton size="small" onClick={() => handlePreview(attachment)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton size="small" component="a" href={`/api/attachments/download/${attachment.id}`} target="_blank">
                    <Download fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => setToDelete(attachment)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            )
          })}
        </List>
      )}
      {total > perPage && (
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={perPage}
          onRowsPerPageChange={(e) => {
            setPerPage(parseInt(e.target.value, 10))
            setPage(0)
          }}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      )}

      <FilePreviewDialog preview={preview} onClose={() => setPreview(null)} />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Excluir anexo"
        message={`Tem certeza que deseja excluir o anexo "${toDelete?.originalName}"?`}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && handleDelete(toDelete.id)}
      />
    </Paper>
  )
}
