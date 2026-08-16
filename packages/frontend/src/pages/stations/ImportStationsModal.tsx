import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
import Button from '../../components/ui/Button'
import { downloadStationTemplate, parseStationFile } from './stationImport'

interface ImportResult {
  imported: number
  updated: number
  skipped: number
  errors: string[]
}

interface ImportStationsModalProps {
  open: boolean
  onClose: () => void
  onImported: () => void
}

export default function ImportStationsModal({ open, onClose, onImported }: ImportStationsModalProps) {
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
        const stations = parseStationFile(e.target?.result as ArrayBuffer)

        if (stations.length === 0) {
          setError('Nenhuma linha válida para importar. Verifique o template.')
          return
        }

        setLoading(true)
        api
          .post('/stations/import', { stations })
          .then((res) => {
            setResult(res.data)
            showToast(
              `${res.data.imported} importada(s), ${res.data.updated} atualizada(s), ${res.data.skipped} ignorada(s).`,
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
      <DialogTitle sx={{ fontWeight: 700 }}>Importar Estações</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Baixe o template, preencha as colunas e envie o arquivo (.xlsx, .xls ou .csv). O End ID só é aplicado para a mobileCarrier TIM. Estações que já existem (mesmo Site ID e End ID) serão atualizadas.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box
          sx={{
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
            p: 2,
            borderRadius: 2,
            border: '1px solid rgba(0,0,0,0.08)',
            bgcolor: 'rgba(0, 21, 68, 0.03)',
          }}
        >
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Passo 1 — Baixe o template
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Use as colunas do arquivo para preencher os dados.
            </Typography>
          </Box>
          <Button variant="outlined" startIcon={<Download />} onClick={downloadStationTemplate}>
            Baixar Template
          </Button>
        </Box>

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
            borderColor: dragging ? 'rgb(0, 21, 68)' : 'rgba(0, 21, 68, 0.3)',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: dragging ? 'rgba(0, 21, 68, 0.06)' : 'transparent',
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
            <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  bgcolor: 'rgba(0, 21, 68, 0.08)',
                  color: 'rgb(0, 21, 68)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <UploadFile fontSize="small" />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{fileName}</Typography>
            </Stack>
          ) : (
            <>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: 'rgba(0, 21, 68, 0.08)',
                  color: 'rgb(0, 21, 68)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <FileUpload sx={{ fontSize: 30 }} />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Arraste o arquivo aqui ou clique para selecionar
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Formatos aceitos: .xlsx, .xls, .csv
              </Typography>
            </>
          )}
        </Box>

        {loading && (
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 2, py: 1 }}>
            <CircularProgress size={20} color="inherit" sx={{ color: 'rgb(0, 21, 68)' }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Importando...</Typography>
          </Stack>
        )}

        {result && (
          <Stack spacing={1} sx={{ mt: 2 }}>
            {result.imported > 0 && <Alert severity="success">{result.imported} estação(ões) importada(s)</Alert>}
            {result.updated > 0 && <Alert severity="info">{result.updated} estação(ões) atualizada(s)</Alert>}
            {result.skipped > 0 && (
              <Alert severity="warning">{result.skipped} ignorada(s)</Alert>
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
        <Button variant="outlined" onClick={handleClose} disabled={loading}>Fechar</Button>
      </DialogActions>
    </Dialog>
  )
}
