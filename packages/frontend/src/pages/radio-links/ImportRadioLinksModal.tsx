import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Box,
  Typography,
  CircularProgress,
  Stack,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import { Download, UploadFile, FileUpload } from '@mui/icons-material'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { downloadRadioLinkTemplate, parseRadioLinkFile } from './radioLinkImport'

interface ImportResult {
  imported: number
  updated: number
  skipped: number
  errors: string[]
}

interface ImportRadioLinksModalProps {
  open: boolean
  onClose: () => void
  onImported: () => void
}

export default function ImportRadioLinksModal({ open, onClose, onImported }: ImportRadioLinksModalProps) {
  const { showToast } = useToast()
  const [fileName, setFileName] = useState('')
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    setError('')
    setResult(null)
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const radioLinks = parseRadioLinkFile(e.target?.result as ArrayBuffer)

        if (radioLinks.length === 0) {
          setError('Nenhuma linha válida para importar. Verifique o template.')
          return
        }

        setLoading(true)
        api
          .post('/radio-links/import', { radioLinks })
          .then((res) => {
            setResult(res.data)
            showToast(
              `${res.data.imported} importado(s), ${res.data.updated} atualizado(s), ${res.data.skipped} ignorado(s).`,
            )
            onImported()
          })
          .catch((err) => {
            setError(err.response?.data?.message || 'Erro ao importar o arquivo.')
          })
          .finally(() => setLoading(false))
      } catch {
        setError('Não foi possível ler o arquivo. Use o template disponível.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) handleFile(file)
    event.target.value = ''
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleClose = () => {
    if (loading) return
    setFileName('')
    setError('')
    setResult(null)
    setDragging(false)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Importar Enlaces de Rádio</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Baixe o template, preencha as colunas e envie o arquivo (.xlsx, .xls ou .csv). Enlaces que já existem (mesmo Nome) serão atualizados. As estações A e B são identificadas pelo Site ID.
        </Typography>

        <Button variant="outlined" startIcon={<Download />} onClick={downloadRadioLinkTemplate} sx={{ mb: 2 }}>
          Baixar Template
        </Button>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          sx={{
            border: '2px dashed',
            borderColor: dragging ? 'primary.main' : 'divider',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: dragging ? 'action.hover' : 'transparent',
            transition: 'background-color 0.2s, border-color 0.2s',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            hidden
            onChange={handleInputChange}
          />
          {fileName ? (
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
              <UploadFile />
              <Typography variant="body2">{fileName}</Typography>
            </Stack>
          ) : (
            <>
              <FileUpload sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
              <Typography>Arraste o arquivo aqui ou clique para selecionar</Typography>
            </>
          )}
        </Box>

        {loading && (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2">Importando...</Typography>
          </Stack>
        )}

        {result && (
          <Stack spacing={1} sx={{ mt: 2 }}>
            {result.imported > 0 && <Alert severity="success">{result.imported} enlace(s) importado(s)</Alert>}
            {result.updated > 0 && <Alert severity="info">{result.updated} enlace(s) atualizado(s)</Alert>}
            {result.skipped > 0 && (
              <Alert severity="warning">{result.skipped} ignorado(s)</Alert>
            )}
            {!!result.errors.length && (
              <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                {result.errors.map((msg, i) => (
                  <ListItem key={i} sx={{ py: 0 }}>
                    <ListItemText primary={msg} />
                  </ListItem>
                ))}
              </List>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>Fechar</Button>
      </DialogActions>
    </Dialog>
  )
}
