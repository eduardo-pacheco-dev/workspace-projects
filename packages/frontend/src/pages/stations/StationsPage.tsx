import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  IconButton,
  Alert,
  Box,
  TextField,
  Stack,
  Chip,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import { Edit, Delete, Add, Download, Upload } from '@mui/icons-material'
import * as XLSX from 'xlsx'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import ConfirmDialog from '../../components/ConfirmDialog'
import StationModal from './StationModal'

interface Station {
  id: number
  siteId: string
  endId: string
  endereco: string | null
  latitude: number | null
  longitude: number | null
  operadora: string | null
  observacoes: string | null
  status: string
}

type SortBy = 'id' | 'siteId' | 'endId' | 'endereco' | 'operadora' | 'status'
type SortOrder = 'ASC' | 'DESC'

export default function StationsPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [stations, setStations] = useState<Station[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<SortBy>('id')
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })
  const [stationToDelete, setStationToDelete] = useState<Station | null>(null)
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; duplicates: number; errors: string[] } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchData = useCallback(async () => {
    try {
      const params: any = {
        page: page + 1,
        limit: rowsPerPage,
        sortBy,
        sortOrder,
      }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter

      const res = await api.get('/stations', { params })
      if (Array.isArray(res.data)) {
        setStations(res.data)
        setTotal(res.data.length)
      } else {
        setStations(res.data.data ?? [])
        setTotal(res.data.total ?? 0)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar a lista.')
    }
  }, [page, rowsPerPage, sortBy, sortOrder, search, statusFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSort = (col: SortBy) => {
    if (sortBy === col) {
      setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'))
    } else {
      setSortBy(col)
      setSortOrder('ASC')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/stations/${id}`)
      fetchData()
      showToast('Estação excluída com sucesso.')
      setStationToDelete(null)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir. Tente novamente.')
      showToast(err.response?.data?.message || 'Não foi possível excluir. Tente novamente.', 'error')
      setStationToDelete(null)
    }
  }

  const handleChangePage = (_: any, newPage: number) => {
    setPage(newPage)
  }

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

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
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
          showToast('Nenhuma linha válida para importar.', 'error')
          return
        }

        api
          .post('/stations/import', { stations })
          .then((res) => {
            setImportResult(res.data)
            showToast(`${res.data.imported} estação(ões) importada(s), ${res.data.skipped} ignorada(s).`)
            fetchData()
          })
          .catch((err) => {
            showToast(err.response?.data?.message || 'Erro ao importar o arquivo.', 'error')
          })
      } catch {
        showToast('Não foi possível ler o arquivo. Use o template disponível.', 'error')
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const columns: { id: SortBy; label: string }[] = [
    { id: 'siteId', label: 'Site ID' },
    { id: 'endId', label: 'End ID' },
    { id: 'operadora', label: 'Operadora' },
    { id: 'endereco', label: 'Endereço' },
    { id: 'status', label: 'Status' },
  ]

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Estações (ERBS)</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Download />} onClick={handleDownloadTemplate}>
            Baixar Template
          </Button>
          <Button variant="outlined" startIcon={<Upload />} onClick={() => fileInputRef.current?.click()}>
            Importar
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setModal({ open: true, editId: null })}>
            Nova Estação
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            hidden
            onChange={handleImportFile}
          />
        </Box>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          label="Buscar"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(0)
          }}
          sx={{ minWidth: 250 }}
        />
        <TextField
          size="small"
          select
          label="Status"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(0)
          }}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="ativo">Ativo</MenuItem>
          <MenuItem value="inativo">Inativo</MenuItem>
        </TextField>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.id}>
                  <TableSortLabel
                    active={sortBy === col.id}
                    direction={sortBy === col.id ? sortOrder.toLowerCase() as 'asc' | 'desc' : 'asc'}
                    onClick={() => handleSort(col.id)}
                  >
                    {col.label}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stations.map((s) => (
              <TableRow
                key={s.id}
                hover
                onClick={() => navigate(`/stations/${s.id}`)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{s.siteId}</TableCell>
                <TableCell>{s.endId}</TableCell>
                <TableCell>{s.operadora || '-'}</TableCell>
                <TableCell>{s.endereco || '-'}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={s.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    color={s.status === 'ativo' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation()
                      setModal({ open: true, editId: s.id })
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation()
                      setStationToDelete(s)
                    }}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {stations.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Nenhuma estação encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />

      <StationModal
        open={modal.open}
        editId={modal.editId}
        onClose={() => setModal({ open: false, editId: null })}
        onSaved={() => fetchData()}
      />

      <ConfirmDialog
        open={!!stationToDelete}
        title="Excluir estação"
        message={`Tem certeza que deseja excluir a estação "${stationToDelete?.siteId}"?`}
        onClose={() => setStationToDelete(null)}
        onConfirm={() => stationToDelete && handleDelete(stationToDelete.id)}
      />

      <Dialog open={!!importResult} onClose={() => setImportResult(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Resultado do Import</DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ mb: importResult?.errors.length ? 2 : 0 }}>
            <Alert severity="success">{importResult?.imported} estação(ões) importada(s)</Alert>
            <Alert severity="warning">
              {importResult?.skipped} ignorada(s){importResult?.duplicates ? ` (${importResult.duplicates} duplicada(s))` : ''}
            </Alert>
          </Stack>
          {!!importResult?.errors.length && (
            <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
              {importResult.errors.map((msg, i) => (
                <ListItem key={i} sx={{ py: 0 }}>
                  <ListItemText primary={msg} />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportResult(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
