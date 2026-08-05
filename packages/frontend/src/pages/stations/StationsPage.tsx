import { useState, useEffect, useCallback } from 'react'
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
} from '@mui/material'
import { Edit, Delete, Add, Upload } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import ConfirmDialog from '../../components/ConfirmDialog'
import StationModal from './StationModal'
import ImportStationsModal from './ImportStationsModal'

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
  const [operadoraFilter, setOperadoraFilter] = useState('')
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })
  const [stationToDelete, setStationToDelete] = useState<Station | null>(null)
  const [importOpen, setImportOpen] = useState(false)

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
      if (operadoraFilter) params.operadora = operadoraFilter

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
  }, [page, rowsPerPage, sortBy, sortOrder, search, statusFilter, operadoraFilter])

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
          <Button variant="outlined" startIcon={<Upload />} onClick={() => setImportOpen(true)}>
            Importar
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setModal({ open: true, editId: null })}>
            Nova Estação
          </Button>
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
        <TextField
          size="small"
          select
          label="Operadora"
          value={operadoraFilter}
          onChange={(e) => {
            setOperadoraFilter(e.target.value)
            setPage(0)
          }}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">Todas</MenuItem>
          <MenuItem value="TIM">TIM</MenuItem>
          <MenuItem value="CLARO">CLARO</MenuItem>
          <MenuItem value="VIVO">VIVO</MenuItem>
          <MenuItem value="Outras">Outras</MenuItem>
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

      <ImportStationsModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={() => fetchData()}
      />
    </Container>
  )
}
