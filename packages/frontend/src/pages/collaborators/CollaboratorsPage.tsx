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
} from '@mui/material'
import { Edit, Delete, PersonAdd } from '@mui/icons-material'
import api from '../../services/api'
import CollaboratorModal from './CollaboratorModal'
import { useToast } from '../../contexts/ToastContext'

interface Collaborator {
  id: number
  codigo: string | null
  nome: string
  cpf: string | null
  cargo: string | null
  email: string | null
  telefone: string | null
  status: string
  isFreelancer: boolean
  companyId: number
  company?: { id: number; nome: string } | null
  createdAt: string
}

type SortBy = 'id' | 'codigo' | 'nome' | 'cpf' | 'cargo' | 'email' | 'telefone' | 'status' | 'createdAt'
type SortOrder = 'ASC' | 'DESC'

export default function CollaboratorsPage() {
  const { showToast } = useToast()
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<SortBy>('nome')
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nome: string } | null>(null)
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

      const res = await api.get('/collaborators', { params })
      if (Array.isArray(res.data)) {
        setCollaborators(res.data)
        setTotal(res.data.length)
      } else {
        setCollaborators(res.data.data ?? [])
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
      await api.delete(`/collaborators/${deleteTarget.id}`)
      showToast('Colaborador excluído com sucesso.')
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

  const columns: { id: SortBy; label: string }[] = [
    { id: 'codigo', label: 'Código' },
    { id: 'nome', label: 'Nome' },
    { id: 'cpf', label: 'CPF' },
    { id: 'cargo', label: 'Cargo' },
    { id: 'email', label: 'Email' },
    { id: 'telefone', label: 'Telefone' },
    { id: 'status', label: 'Status' },
  ]
  const showCompany = true
  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Colaboradores</Typography>
        <Button variant="contained" startIcon={<PersonAdd />} onClick={() => setModal({ open: true, editId: null })}>
          Novo Colaborador
        </Button>
      </Box>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          label="Buscar"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
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
              {showCompany && <TableCell>Empresa</TableCell>}
              <TableCell>Tipo</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {collaborators.map((c) => (
              <TableRow key={c.id} hover>
                <TableCell>{c.codigo || '-'}</TableCell>
                <TableCell>{c.nome}</TableCell>
                <TableCell>{c.cpf || '-'}</TableCell>
                <TableCell>{c.cargo || '-'}</TableCell>
                <TableCell>{c.email || '-'}</TableCell>
                <TableCell>{c.telefone || '-'}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={c.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    color={c.status === 'ativo' ? 'success' : 'default'}
                  />
                </TableCell>
                {showCompany && <TableCell>{c.company?.nome || '-'}</TableCell>}
                <TableCell>
                  <Chip
                    size="small"
                    label={c.isFreelancer ? 'Freelancer' : 'Colaborador'}
                    color={c.isFreelancer ? 'primary' : 'default'}
                  />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
                    <IconButton onClick={() => setModal({ open: true, editId: c.id })}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => setDeleteTarget({ id: c.id, nome: c.nome })}>
                      <Delete />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {collaborators.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  Nenhum colaborador encontrado.
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

      <CollaboratorModal
        open={modal.open}
        editId={modal.editId}
        onClose={() => setModal({ open: false, editId: null })}
        onSaved={() => fetchData()}
      />

      <Dialog
        open={!!deleteTarget}
        onClose={() => { if (!deleting) setDeleteTarget(null) }}
      >
        <DialogTitle>Excluir Colaborador</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o colaborador <strong>{deleteTarget?.nome}</strong>? Esta ação não pode ser desfeita.
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
