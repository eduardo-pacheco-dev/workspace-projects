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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Avatar,
  Card,
  CardContent,
  CardActions,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import {
  Edit,
  Delete,
  PersonAdd,
  FileDownload,
  TableView,
  GridView,
} from '@mui/icons-material'
import * as XLSX from 'xlsx'
import api from '../../services/api'
import { roleLabels } from '../settings/roleModules'
import UserModal from './UserModal'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'

interface User {
  id: number
  name: string
  lastName: string | null
  email: string
  phone: string | null
  status: string
  role?: string
  companyId?: number | null
  companyName?: string | null
  createdAt: string
}

type SortBy = 'id' | 'name' | 'lastName' | 'email' | 'phone' | 'status' | 'createdAt'
type SortOrder = 'ASC' | 'DESC'

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const { showToast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<SortBy>('id')
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

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

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/users/${deleteTarget.id}`)
      showToast('Usuário excluído com sucesso.')
      fetchData()
      setDeleteTarget(null)
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível excluir. Tente novamente.', 'error')
    } finally {
      setDeleting(false)
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

      const res = await api.get('/users', { params })
      const list: User[] = Array.isArray(res.data) ? res.data : (res.data.data ?? [])

      const rows = list.map((u) => ({
        Nome: u.name,
        Sobrenome: u.lastName || '',
        Email: u.email,
        Telefone: u.phone || '',
        Perfil: u.role ? (roleLabels[u.role] || u.role) : '',
        Empresa: u.role === 'master' ? '' : (u.companyName || ''),
        Status: u.status === 'active' ? 'Ativo' : 'Inativo',
        'Criado em': new Date(u.createdAt).toLocaleDateString('pt-BR'),
      }))

      const ws = XLSX.utils.json_to_sheet(rows)
      ws['!cols'] = [
        { wch: 22 },
        { wch: 22 },
        { wch: 30 },
        { wch: 16 },
        { wch: 14 },
        { wch: 24 },
        { wch: 10 },
        { wch: 12 },
      ]

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Usuários')
      XLSX.writeFile(wb, `usuarios-${new Date().toISOString().slice(0, 10)}.xlsx`)
      showToast('Lista de usuários exportada com sucesso.')
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível exportar. Tente novamente.', 'error')
    }
  }

  const columns: { id: SortBy; label: string }[] = [
    { id: 'name', label: 'Nome' },
    { id: 'lastName', label: 'Sobrenome' },
    { id: 'email', label: 'Email' },
    { id: 'phone', label: 'Telefone' },
    { id: 'status', label: 'Status' },
    { id: 'createdAt', label: 'Criado em' },
  ]

  const getInitials = (name: string) =>
    name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '?'

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Usuários</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<FileDownload />} onClick={handleExport}>
            Exportar Excel
          </Button>
          <Button variant="contained" startIcon={<PersonAdd />} onClick={() => setModal({ open: true, editId: null })}>
            Novo Usuário
          </Button>
        </Box>
      </Box>

      <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
        <TextField
          size="small"
          label="Buscar"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(0)
          }}
        />
        <Box sx={{ flexGrow: 1 }} />
        <ToggleButtonGroup
          size="small"
          exclusive
          value={viewMode}
          onChange={(_, v) => v && setViewMode(v)}
        >
          <ToggleButton value="table" aria-label="Visualizar em tabela">
            <TableView fontSize="small" />
          </ToggleButton>
          <ToggleButton value="cards" aria-label="Visualizar em cartões">
            <GridView fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {viewMode === 'table' ? (
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
                      label={u.role ? (roleLabels[u.role] || u.role) : '-'}
                      color={u.role === 'master' ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>{u.role === 'master' ? '-' : (u.companyName || '-')}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
                      <IconButton onClick={() => setModal({ open: true, editId: u.id })}>
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={() => setDeleteTarget({ id: u.id, name: u.name })}
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
      ) : (
        <Box>
          {users.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">Nenhum usuário encontrado.</Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {users.map((u) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={u.id}>
                  <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44, fontSize: 18 }}>
                          {getInitials(u.name)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
                            {u.name} {u.lastName || ''}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {u.email}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                        <Chip
                          size="small"
                          variant="outlined"
                          label={u.role ? (roleLabels[u.role] || u.role) : '-'}
                          color={u.role === 'master' ? 'primary' : 'default'}
                        />
                        <Chip
                          size="small"
                          label={u.status === 'active' ? 'Ativo' : 'Inativo'}
                          color={u.status === 'active' ? 'success' : 'default'}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        Telefone: {u.phone || '-'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        Empresa: {u.role === 'master' ? '-' : (u.companyName || '-')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Criado em: {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2, justifyContent: 'flex-end' }}>
                      <Button size="small" startIcon={<Edit />} onClick={() => setModal({ open: true, editId: u.id })}>
                        Editar
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => setDeleteTarget({ id: u.id, name: u.name })}
                        disabled={currentUser != null && String(currentUser.id) === String(u.id)}
                      >
                        Excluir
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

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

      <Dialog
        open={!!deleteTarget}
        onClose={() => { if (!deleting) setDeleteTarget(null) }}
      >
        <DialogTitle>Excluir Usuário</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o usuário <strong>{deleteTarget?.name}</strong>? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
