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
import { Edit, Delete, GroupAdd } from '@mui/icons-material'
import api from '../../services/api'
import TeamModal from './TeamModal'
import { useToast } from '../../contexts/ToastContext'

interface TeamMember {
  id: number
  collaboratorId: number
  collaborator?: {
    id: number
    nome: string | null
    firstName?: string | null
    lastName?: string | null
    isFreelancer: boolean
  }
}

interface Team {
  id: number
  nome: string
  descricao: string | null
  status: string
  members: TeamMember[]
  createdAt: string
}

type SortBy = 'id' | 'nome' | 'status' | 'createdAt'
type SortOrder = 'ASC' | 'DESC'

export default function TeamsTab() {
  const { showToast } = useToast()
  const [teams, setTeams] = useState<Team[]>([])
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

      const res = await api.get('/teams', { params })
      if (Array.isArray(res.data)) {
        setTeams(res.data)
        setTotal(res.data.length)
      } else {
        setTeams(res.data.data ?? [])
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
      await api.delete(`/teams/${deleteTarget.id}`)
      showToast('Equipe excluída com sucesso.')
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
    { id: 'nome', label: 'Nome' },
    { id: 'status', label: 'Status' },
  ]

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Equipes</Typography>
        <Button variant="contained" startIcon={<GroupAdd />} onClick={() => setModal({ open: true, editId: null })}>
          Nova Equipe
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
              <TableCell>Membros</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teams.map((t) => (
              <TableRow key={t.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{t.nome}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={t.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    color={t.status === 'ativo' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {t.members?.length ? (
                      t.members.slice(0, 4).map((m) => {
                        const c = m.collaborator
                        const name = c
                          ? c.nome || [c.firstName, c.lastName].filter(Boolean).join(' ')
                          : `#${m.collaboratorId}`
                        return (
                          <Chip
                            key={m.id}
                            size="small"
                            label={name}
                            color={c?.isFreelancer ? 'primary' : 'default'}
                            variant="outlined"
                          />
                        )
                      })
                    ) : (
                      <Typography variant="body2" color="text.secondary">Sem membros</Typography>
                    )}
                    {(t.members?.length ?? 0) > 4 && (
                      <Chip size="small" label={`+${t.members.length - 4}`} variant="outlined" />
                    )}
                  </Stack>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
                    <IconButton onClick={() => setModal({ open: true, editId: t.id })}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => setDeleteTarget({ id: t.id, nome: t.nome })}>
                      <Delete />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {teams.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Nenhuma equipe encontrada.
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

      <TeamModal
        open={modal.open}
        editId={modal.editId}
        onClose={() => setModal({ open: false, editId: null })}
        onSaved={() => fetchData()}
      />

      <Dialog
        open={!!deleteTarget}
        onClose={() => { if (!deleting) setDeleteTarget(null) }}
      >
        <DialogTitle>Excluir Equipe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir a equipe <strong>{deleteTarget?.nome}</strong>? Esta ação não pode ser desfeita.
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
