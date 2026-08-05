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
import * as XLSX from 'xlsx'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'

interface ImportResult {
  imported: number
  skipped: number
  duplicates: number
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

  const handleDownloadTemplate = () => {
    const rows = [
      {
        'Site ID': 'SITE-001',
        'End ID': 'END-001',
        Operadora: 'TIM',
        Status: 'ativo',
        Endereço: 'Av. Exemplo, 100',
        Latitude: -23.5505,
        Longitude: -46.6333,
        Observações: 'Exemplo de preenchimento',
      },
      {
        'Site ID': '',
        'End ID': '',
        Operadora: 'CLARO',
        Status: 'ativo',
        Endereço: '',
        Latitude: '',
        Longitude: '',
        Observações: '',
      },
    ]
    const ws = XLSX.utils.json_to_sheet(rows, { skipHeader: false })
    ws['!cols'] = [{ wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 40 }, { wch: 12 }, { wch: 12 }, { wch: 40 }]

    const border = {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } },
    }
    const cellAddresses = XLSX.utils.decode_range(ws['!ref'] || 'A1')
    for (let r = cellAddresses.s.r; r <= cellAddresses.e.r; r++) {
      for (let c = cellAddresses.s.c; c <= cellAddresses.e.c; c++) {
        const addr = XLSX.utils.encode_cell({ r, c })
        if (!ws[addr]) ws[addr] = { t: 's', v: '' }
        ws[addr].s = { border }
        if (r === 0) {
          ws[addr].s = {
            ...ws[addr].s,
            font: { bold: true, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: '1976D2' } },
            alignment: { horizontal: 'center' },
          }
        }
      }
    }
    ws['!freeze'] = { xSplit: 0, ySplit: 1 }

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Estações')
    XLSX.writeFile(wb, 'template-estacoes.xlsx')
  }

  const handleFile = (file: File) => {
    setError('')
    setResult(null)
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })

        const stations = raw
          .map((r) => ({
            siteId: String(r['Site ID'] ?? '').trim(),
            endId: String(r['End ID'] ?? '').trim(),
            operadora: r['Operadora'] != null ? String(r['Operadora']).trim() : '',
            status: String(r['Status'] ?? '').trim().toLowerCase(),
            endereco: r['Endereço'] != null ? String(r['Endereço']).trim() : '',
            latitude: r['Latitude'],
            longitude: r['Longitude'],
            observacoes: r['Observações'] != null ? String(r['Observações']).trim() : '',
          }))
          .filter((s) => !(s.siteId === 'SITE-001' && s.endId === 'END-001'))

        if (stations.length === 0) {
          setError('Nenhuma linha válida para importar. Verifique o template.')
          return
        }

        setLoading(true)
        api
          .post('/stations/import', { stations })
          .then((res) => {
            setResult(res.data)
            showToast(`${res.data.imported} estação(ões) importada(s).`)
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
      <DialogTitle>Importar Estações</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Baixe o template, preencha as colunas e envie o arquivo (.xlsx, .xls ou .csv). Estações com o mesmo Site ID e End ID serão ignoradas.
        </Typography>

        <Button variant="outlined" startIcon={<Download />} onClick={handleDownloadTemplate} sx={{ mb: 2 }}>
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
            <Alert severity="success">{result.imported} estação(ões) importada(s)</Alert>
            <Alert severity="warning">
              {result.skipped} ignorada(s){result.duplicates ? ` (${result.duplicates} duplicada(s))` : ''}
            </Alert>
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
