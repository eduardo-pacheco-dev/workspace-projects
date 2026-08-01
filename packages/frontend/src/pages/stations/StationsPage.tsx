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
import { Edit, Delete, Add } from '@mui/icons-material'
import api from '../../services/api'
import StationModal from './StationModal'

interface Station {
  id: number
  nome: string
  codigo: string | null
  endereco: string | null
  latitude: number | null
  longitude: number | null
  tecnologia: string | null
  operadora: string | null
  observacoes: string | null
  status: string
}

type SortBy = 'id' | 'nome' | 'codigo' | 'endereco' | 'operadora' | 'tecnologia' | 'status'
type SortOrder = 'ASC' | 'DESC'

export default function StationsPage() {
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
    if (!confirm('Tem certeza que deseja excluir esta estação?')) return
    try {
      await api.delete(`/stations/${id}`)
      fetchData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir. Tente novamente.')
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
    { id: 'nome', label: 'Nome' },
    { id: 'codigo', label: 'Código' },
    { id: 'operadora', label: 'Operadora' },
    { id: 'endereco', label: 'Endereço' },
    { id: 'tecnologia', label: 'Tecnologia' },
    { id: 'status', label: 'Status' },
  ]

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Estações (ERBS)</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setModal({ open: true, editId: null })}>
          Nova Estação
        </Button>
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
              <TableRow key={s.id} hover>
                <TableCell>{s.nome}</TableCell>
                <TableCell>{s.codigo || '-'}</TableCell>
                <TableCell>{s.operadora || '-'}</TableCell>
                <TableCell>{s.endereco || '-'}</TableCell>
                <TableCell>{s.tecnologia || '-'}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={s.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    color={s.status === 'ativo' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => setModal({ open: true, editId: s.id })}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(s.id)}>
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
    </Container>
  )
}
