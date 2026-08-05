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
  updated: number
  skipped: number
  errors: string[]
}

interface ImportRadioLinksModalProps {
  open: boolean
  onClose: () => void
  onImported: () => void
}

const exampleNome = 'ENLACE-EXEMPLO'

export default function ImportRadioLinksModal({ open, onClose, onImported }: ImportRadioLinksModalProps) {
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
        Nome: exampleNome,
        Frequência: '23 GHz',
        Capacidade: '1 Gbps',
        'Operadora A': 'TIM',
        'Site ID A': 'SITE-001',
        'End ID A': 'END-001',
        'Endereço A': 'Av. Exemplo, 100',
        'Latitude A': -23.5505,
        'Longitude A': -46.6333,
        'Operadora B': 'CLARO',
        'Site ID B': 'SITE-002',
        'End ID B': 'END-002',
        'Endereço B': 'Rua Exemplo, 200',
        'Latitude B': -23.555,
        'Longitude B': -46.64,
        Observações: 'Exemplo de preenchimento',
        Status: 'ativo',
      },
      {
        Nome: '',
        Frequência: '',
        Capacidade: '',
        'Operadora A': 'VIVO',
        'Site ID A': '',
        'End ID A': '',
        'Endereço A': '',
        'Latitude A': '',
        'Longitude A': '',
        'Operadora B': 'TIM',
        'Site ID B': '',
        'End ID B': '',
        'Endereço B': '',
        'Latitude B': '',
        'Longitude B': '',
        Observações: '',
        Status: 'ativo',
      },
    ]
    const ws = XLSX.utils.json_to_sheet(rows, { skipHeader: false })
    ws['!cols'] = [
      { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 14 },
      { wch: 32 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 14 },
      { wch: 32 }, { wch: 12 }, { wch: 12 }, { wch: 40 }, { wch: 10 },
    ]

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
    XLSX.utils.book_append_sheet(wb, ws, 'Enlaces de Rádio')
    XLSX.writeFile(wb, 'template-enlaces-de-radio.xlsx')
  }

  const str = (value: unknown) => (value != null ? String(value).trim() : '')

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

        const radioLinks = raw
          .map((r) => ({
            nome: str(r['Nome']),
            frequencia: str(r['Frequência']),
            capacidade: str(r['Capacidade']),
            operadoraA: str(r['Operadora A']),
            siteIdA: str(r['Site ID A']),
            endIdA: str(r['End ID A']),
            enderecoA: str(r['Endereço A']),
            latitudeA: r['Latitude A'],
            longitudeA: r['Longitude A'],
            operadoraB: str(r['Operadora B']),
            siteIdB: str(r['Site ID B']),
            endIdB: str(r['End ID B']),
            enderecoB: str(r['Endereço B']),
            latitudeB: r['Latitude B'],
            longitudeB: r['Longitude B'],
            observacoes: str(r['Observações']),
            status: str(r['Status']).toLowerCase(),
          }))
          .filter((r) => r.nome !== exampleNome)

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
