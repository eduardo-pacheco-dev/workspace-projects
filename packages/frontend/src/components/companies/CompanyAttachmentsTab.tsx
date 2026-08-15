import { useState, useRef, useCallback, useEffect } from 'react'
import { Box, Button, Divider, IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Pagination, Paper, Stack, TextField, Typography } from '@mui/material'
import { AttachFile, Delete, Download, PictureAsPdf, Visibility } from '@mui/icons-material'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import ConfirmDialog from '../ConfirmDialog'
import FilePreviewDialog from '../FilePreviewDialog'
import { formatSize } from '../../utils/format'
import { CompanyAttachment } from '../../pages/companies/companiesTypes'

const PAGE_SIZE = 5

interface CompanyAttachmentsTabProps {
  companyId: number
}

export default function CompanyAttachmentsTab({ companyId }: CompanyAttachmentsTabProps) {
  const { showToast } = useToast()
  const [attachments, setAttachments] = useState<CompanyAttachment[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<{ url: string; type: string; name: string } | null>(null)
  const [toDelete, setToDelete] = useState<CompanyAttachment | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(() => {
    const params: any = { page, limit: PAGE_SIZE }
    if (search) params.search = search
    api.get(`/attachments/company/${companyId}`, { params })
      .then((res) => {
        setAttachments(Array.isArray(res.data) ? res.data : res.data.data ?? [])
        setTotal(Array.isArray(res.data) ? res.data.length : res.data.total ?? 0)
      })
      .catch(() => {})
  }, [companyId, page, search])

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
      await api.post(`/attachments/upload/company/${companyId}`, form)
      load()
      showToast('Anexo enviado com sucesso.')
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível enviar o arquivo.', 'error')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (attachmentId: number) => {
    try {
      await api.delete(`/attachments/${attachmentId}`)
      setToDelete(null)
      load()
      showToast('Anexo excluído com sucesso.')
    } catch (err: any) {
      setToDelete(null)
      showToast(err.response?.data?.message || 'Não foi possível excluir o anexo.', 'error')
    }
  }

  const handlePreview = (attachment: CompanyAttachment) => {
    setPreview({ url: `/api/attachments/file/${attachment.id}`, type: attachment.mimetype, name: attachment.originalName })
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h6">Anexos</Typography>
          <Typography variant="body2" color="text.secondary">
            {total} anexo(s)
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            size="small"
            label="Buscar anexo"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
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
                  <IconButton
                    size="small"
                    component="a"
                    href={`/api/attachments/download/${attachment.id}`}
                    target="_blank"
                    onClick={() => showToast('Download do anexo iniciado.')}
                  >
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
      {total > PAGE_SIZE && (
        <Stack alignItems="center" sx={{ mt: 2 }}>
          <Pagination count={Math.ceil(total / PAGE_SIZE)} page={page} onChange={(_, value) => setPage(value)} size="small" />
        </Stack>
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
