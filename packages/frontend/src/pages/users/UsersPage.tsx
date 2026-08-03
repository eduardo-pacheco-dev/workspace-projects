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
} from '@mui/material'
import { Edit, Delete, PersonAdd } from '@mui/icons-material'
import api from '../../services/api'
import UserModal from './UserModal'
import { useAuth } from '../../contexts/AuthContext'

interface User {
  id: number
  name: string
  lastName: string | null
  email: string
  phone: string | null
  status: string
  role?: string
  companyId?: number | null
  createdAt: string
}

type SortBy = 'id' | 'name' | 'lastName' | 'email' | 'phone' | 'status' | 'createdAt'
type SortOrder = 'ASC' | 'DESC'

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<SortBy>('id')
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })
  const [companies, setCompanies] = useState<{ id: number; nome: string }[]>([])

  useEffect(() => {
    api
      .get('/companies', { params: { limit: 100, sortBy: 'nome', sortOrder: 'ASC' } })
      .then((res) => {
        const d = res.data
        setCompanies(Array.isArray(d) ? d : d.data ?? [])
      })
      .catch(() => {})
  }, [])

  const companyName = (id?: number | null) =>
    id == null ? '-' : companies.find((c) => c.id === id)?.nome || `#${id}`

  const fetchData = useCallback(async () => {
    try {
      const params: any = {
        page: page + 1,
        limit: rowsPerPage,
        sortBy,
        sortOrder,
      }
      if (search) params.search = search

      const res = await api.get('/users', { params })
      if (Array.isArray(res.data)) {
        setUsers(res.data)
        setTotal(res.data.length)
      } else {
        setUsers(res.data.data ?? [])
        setTotal(res.data.total ?? 0)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar a lista.')
    }
  }, [page, rowsPerPage, sortBy, sortOrder, search])

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
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return
    try {
      await api.delete(`/users/${id}`)
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
    { id: 'name', label: 'Nome' },
    { id: 'lastName', label: 'Sobrenome' },
    { id: 'email', label: 'Email' },
    { id: 'phone', label: 'Telefone' },
    { id: 'status', label: 'Status' },
    { id: 'createdAt', label: 'Criado em' },
  ]

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Usuários</Typography>
        <Button variant="contained" startIcon={<PersonAdd />} onClick={() => setModal({ open: true, editId: null })}>
          Novo Usuário
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
              <TableCell>Perfil</TableCell>
              <TableCell>Empresa</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.lastName || '-'}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.phone || '-'}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={u.status === 'active' ? 'Ativo' : 'Inativo'}
                    color={u.status === 'active' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>{new Date(u.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    variant="outlined"
                    label={u.role === 'master' ? 'Master' : 'Usuário'}
                    color={u.role === 'master' ? 'primary' : 'default'}
                  />
                </TableCell>
                <TableCell>{u.role === 'master' ? '-' : companyName(u.companyId)}</TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
                    <IconButton onClick={() => setModal({ open: true, editId: u.id })}>
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(u.id)}
                      disabled={currentUser != null && String(currentUser.id) === String(u.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Nenhum usuário encontrado.
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

      <UserModal
        open={modal.open}
        editId={modal.editId}
        onClose={() => setModal({ open: false, editId: null })}
        onSaved={() => fetchData()}
      />
    </Container>
  )
}
