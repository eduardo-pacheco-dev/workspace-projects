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
  MenuItem,
  Stack,
  Chip,
} from '@mui/material'
import { Edit, Delete, Add } from '@mui/icons-material'
import api from '../../services/api'
import ServiceOrderModal from './ServiceOrderModal'

interface ServiceOrder {
  id: number
  numero: string
  cliente: string
  descricao: string
  endereco: string | null
  data: string | null
  valor: number | null
  status: string
  observacoes: string | null
}

type SortBy = 'id' | 'numero' | 'cliente' | 'data' | 'valor' | 'status'
type SortOrder = 'ASC' | 'DESC'

const statusColors: Record<string, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  aberta: 'info',
  em_andamento: 'warning',
  concluida: 'success',
  cancelada: 'error',
}

const statusLabels: Record<string, string> = {
  aberta: 'Aberta',
  em_andamento: 'Em andamento',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
}

export default function ServiceOrdersPage() {
  const [orders, setOrders] = useState<ServiceOrder[]>([])
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

      const res = await api.get('/service-orders', { params })
      if (Array.isArray(res.data)) {
        setOrders(res.data)
        setTotal(res.data.length)
      } else {
        setOrders(res.data.data ?? [])
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
    if (!confirm('Tem certeza que deseja excluir esta ordem de serviço?')) return
    try {
      await api.delete(`/service-orders/${id}`)
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

  const columns: { id: SortBy | 'descricao'; label: string; sortable?: boolean }[] = [
    { id: 'numero', label: 'Número' },
    { id: 'cliente', label: 'Cliente' },
    { id: 'descricao', label: 'Descrição', sortable: false },
    { id: 'data', label: 'Data' },
    { id: 'valor', label: 'Valor' },
    { id: 'status', label: 'Status' },
  ]

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Ordens de Serviço</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setModal({ open: true, editId: null })}>
          Nova Ordem de Serviço
        </Button>
      </Box>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          label="Buscar"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(0)
          }}
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
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="aberta">Aberta</MenuItem>
          <MenuItem value="em_andamento">Em andamento</MenuItem>
          <MenuItem value="concluida">Concluída</MenuItem>
          <MenuItem value="cancelada">Cancelada</MenuItem>
        </TextField>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.id}>
                  {col.sortable === false ? (
                    col.label
                  ) : (
                    <TableSortLabel
                      active={sortBy === col.id}
                      direction={sortBy === col.id ? sortOrder.toLowerCase() as 'asc' | 'desc' : 'asc'}
                      onClick={() => handleSort(col.id as SortBy)}
                    >
                      {col.label}
                    </TableSortLabel>
                  )}
                </TableCell>
              ))}
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((so) => (
              <TableRow key={so.id} hover>
                <TableCell>{so.numero}</TableCell>
                <TableCell>{so.cliente}</TableCell>
                <TableCell>{so.descricao}</TableCell>
                <TableCell>{so.data || '-'}</TableCell>
                <TableCell>
                  {so.valor != null
                    ? so.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                    : '-'}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={statusLabels[so.status] || so.status}
                    color={statusColors[so.status] || 'default'}
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => setModal({ open: true, editId: so.id })}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(so.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Nenhuma ordem de serviço encontrada.
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

      <ServiceOrderModal
        open={modal.open}
        editId={modal.editId}
        onClose={() => setModal({ open: false, editId: null })}
        onSaved={() => fetchData()}
      />
    </Container>
  )
}
