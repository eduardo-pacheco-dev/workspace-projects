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
import { Edit, Delete, Add, FileDownload } from '@mui/icons-material'
import * as XLSX from 'xlsx'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import ClientModal from './ClientModal'

interface Client {
  id: number
  nome: string
  documento: string | null
  email: string | null
  telefone: string | null
  endereco: string | null
  cidade: string | null
  uf: string | null
  observacoes: string | null
  status: string
}

type SortBy = 'id' | 'nome' | 'documento' | 'email' | 'telefone' | 'cidade' | 'status'
type SortOrder = 'ASC' | 'DESC'

export default function ClientsPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
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

      const res = await api.get('/clients', { params })
      if (Array.isArray(res.data)) {
        setClients(res.data)
        setTotal(res.data.length)
      } else {
        setClients(res.data.data ?? [])
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
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return
    try {
      await api.delete(`/clients/${id}`)
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

  const handleExport = async () => {
    try {
      const params: any = {
        page: 1,
        limit: 10000,
        sortBy,
        sortOrder,
      }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter

      const res = await api.get('/clients', { params })
      const list: Client[] = Array.isArray(res.data) ? res.data : (res.data.data ?? [])

      const rows = list.map((c) => ({
        Nome: c.nome,
        CNPJ: c.documento || '',
        Email: c.email || '',
        Telefone: c.telefone || '',
        Endereço: c.endereco || '',
        Cidade: c.cidade || '',
        UF: c.uf || '',
        Observações: c.observacoes || '',
        Status: c.status === 'ativo' ? 'Ativo' : 'Inativo',
      }))

      const ws = XLSX.utils.json_to_sheet(rows)
      ws['!cols'] = [
        { wch: 30 },
        { wch: 20 },
        { wch: 30 },
        { wch: 18 },
        { wch: 34 },
        { wch: 18 },
        { wch: 6 },
        { wch: 34 },
        { wch: 10 },
      ]

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Clientes')
      XLSX.writeFile(wb, `clientes-${new Date().toISOString().slice(0, 10)}.xlsx`)
      showToast('Lista de clientes exportada com sucesso.')
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível exportar. Tente novamente.', 'error')
    }
  }

  const columns: { id: SortBy; label: string }[] = [
    { id: 'nome', label: 'Nome' },
    { id: 'documento', label: 'CNPJ' },
    { id: 'email', label: 'Email' },
    { id: 'telefone', label: 'Telefone' },
    { id: 'cidade', label: 'Cidade' },
    { id: 'status', label: 'Status' },
  ]

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Clientes</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<FileDownload />} onClick={handleExport}>
            Exportar Excel
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setModal({ open: true, editId: null })}>
            Novo Cliente
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
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((c) => (
              <TableRow
                key={c.id}
                hover
                onClick={() => navigate(`/clients/${c.id}`)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{c.nome}</TableCell>
                <TableCell>{c.documento || '-'}</TableCell>
                <TableCell>{c.email || '-'}</TableCell>
                <TableCell>{c.telefone || '-'}</TableCell>
                <TableCell>
                  {c.cidade || '-'}
                  {c.uf ? `/${c.uf}` : ''}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={c.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    color={c.status === 'ativo' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation()
                      setModal({ open: true, editId: c.id })
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(c.id)
                    }}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {clients.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Nenhum cliente encontrado.
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

      <ClientModal
        open={modal.open}
        editId={modal.editId}
        onClose={() => setModal({ open: false, editId: null })}
        onSaved={() => fetchData()}
      />
    </Container>
  )
}
