import { useState, useRef, useCallback, useEffect } from 'react'
import { Box, Button, Divider, IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Paper, Typography } from '@mui/material'
import { AttachFile, Delete, Download, PictureAsPdf, Visibility } from '@mui/icons-material'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import ConfirmDialog from '../ui/ConfirmDialog'
import FilePreviewDialog from '../ui/FilePreviewDialog'
import { formatSize } from '../../utils/format'

interface Attachment {
  id: number
  jobId: number
  filename: string
  originalName: string
  mimetype: string
  size: number
  createdAt: string
}

interface JobAttachmentsSectionProps {
  jobId: number
  onError: (message: string) => void
}

export default function JobAttachmentsSection({ jobId, onError }: JobAttachmentsSectionProps) {
  const { showToast } = useToast()
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<{ url: string; type: string; name: string } | null>(null)
  const [toDelete, setToDelete] = useState<Attachment | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(() => {
    api.get(`/attachments/job/${jobId}`)
      .then((res) => setAttachments(res.data))
      .catch(() => {})
  }, [jobId])

  useEffect(() => {
    load()
  }, [load])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      await api.post(`/attachments/upload/${jobId}`, form)
      load()
      showToast('Anexo adicionado com sucesso.')
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
        <input ref={fileInputRef} type="file" hidden onChange={handleUpload} />
      </Box>
      <Divider sx={{ mb: 2 }} />
      {attachments.length === 0 ? (
        <Typography variant="body2" color="text.secondary">Nenhum anexo cadastrado.</Typography>
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
