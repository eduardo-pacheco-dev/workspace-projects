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
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import ConfirmDialog from '../../components/ConfirmDialog'
import PdcaModal from './PdcaModal'
import { faseLabels, statusCicloLabels, faseColors, statusCicloColors } from './pdcaTypes'
import type { Pdca } from './pdcaTypes'

type SortBy = 'id' | 'titulo' | 'fase' | 'statusCiclo' | 'createdAt'
type SortOrder = 'ASC' | 'DESC'

interface PdcaPageProps {
  projectId?: number | null
  embedded?: boolean
}

export default function PdcaPage({ projectId, embedded }: PdcaPageProps) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [items, setItems] = useState<Pdca[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<SortBy>('id')
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC')
  const [search, setSearch] = useState('')
  const [projectFilter, setProjectFilter] = useState('')
  const [faseFilter, setFaseFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })
  const [toDelete, setToDelete] = useState<Pdca | null>(null)
  const [projects, setProjects] = useState<{ id: number; nome: string }[]>([])

  const fetchData = useCallback(async () => {
    try {
      const params: any = { page: page + 1, limit: rowsPerPage, sortBy, sortOrder }
      if (search) params.search = search
      if (embedded && projectId) params.projectId = projectId
      else if (projectFilter) params.projectId = projectFilter
      if (faseFilter) params.fase = faseFilter
      if (statusFilter) params.status = statusFilter

      const res = await api.get('/pdca', { params })
      if (Array.isArray(res.data)) {
        setItems(res.data)
        setTotal(res.data.length)
      } else {
        setItems(res.data.data ?? [])
        setTotal(res.data.total ?? 0)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar os ciclos PDCA.')
    }
  }, [page, rowsPerPage, sortBy, sortOrder, search, projectFilter, faseFilter, statusFilter, embedded, projectId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    api.get('/projects', { params: { limit: 1000, sortBy: 'nome', sortOrder: 'ASC' } })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data.data ?? [])
        setProjects(data.map((p: any) => ({ id: p.id, nome: p.nome })))
      })
      .catch(() => {})
  }, [])

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
      await api.delete(`/pdca/${id}`)
      fetchData()
      showToast('Ciclo PDCA excluído com sucesso.')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir.')
      showToast(err.response?.data?.message || 'Não foi possível excluir.', 'error')
    }
  }

  const handleChangePage = (_: any, newPage: number) => setPage(newPage)

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const columns: { id: SortBy; label: string }[] = [
    { id: 'titulo', label: 'Título' },
    { id: 'fase', label: 'Fase' },
    { id: 'statusCiclo', label: 'Status' },
  ]

  const table = (
    <TableContainer component={Paper} sx={embedded ? { boxShadow: 'none' } : undefined}>
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
            <TableCell>Projeto</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((p) => (
            <TableRow
              key={p.id}
              hover
              onClick={() => navigate(`/pdca/${p.id}`)}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell>{p.titulo}</TableCell>
              <TableCell>
                <Chip size="small" label={faseLabels[p.fase] || p.fase} color={faseColors[p.fase] || 'default'} />
              </TableCell>
              <TableCell>
                <Chip size="small" label={statusCicloLabels[p.statusCiclo] || p.statusCiclo} color={statusCicloColors[p.statusCiclo] || 'default'} />
              </TableCell>
              <TableCell>{projects.find((pr) => pr.id === p.projectId)?.nome || '-'}</TableCell>
              <TableCell>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation()
                    setModal({ open: true, editId: p.id })
                  }}
                >
                  <Edit />
                </IconButton>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation()
                    setToDelete(p)
                  }}
                >
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                Nenhum ciclo PDCA encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )

  const header = (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
      <Box>
        <Typography variant={embedded ? 'h6' : 'h4'}>{embedded ? 'Ciclos PDCA' : 'PDCA'}</Typography>
        <Typography variant="body2" color="text.secondary">
          Gestão de melhoria contínua: Plan, Do, Check, Act
        </Typography>
      </Box>
      <Button variant="contained" startIcon={<Add />} onClick={() => setModal({ open: true, editId: null })}>
        Novo Ciclo
      </Button>
    </Box>
  )

  const filters = !embedded && (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
      <TextField size="small" label="Buscar" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} sx={{ minWidth: 200 }} />
      <TextField
        size="small"
        select
        label="Projeto"
        value={projectFilter}
        onChange={(e) => { setProjectFilter(e.target.value); setPage(0) }}
        sx={{ minWidth: 180 }}
      >
        <MenuItem value="">Todos</MenuItem>
        {projects.map((p) => (
          <MenuItem key={p.id} value={p.id}>{p.nome}</MenuItem>
        ))}
      </TextField>
      <TextField
        size="small"
        select
        label="Fase"
        value={faseFilter}
        onChange={(e) => { setFaseFilter(e.target.value); setPage(0) }}
        sx={{ minWidth: 140 }}
      >
        <MenuItem value="">Todas</MenuItem>
        <MenuItem value="plan">Plan</MenuItem>
        <MenuItem value="do">Do</MenuItem>
        <MenuItem value="check">Check</MenuItem>
        <MenuItem value="act">Act</MenuItem>
      </TextField>
      <TextField
        size="small"
        select
        label="Status"
        value={statusFilter}
        onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }}
        sx={{ minWidth: 150 }}
      >
        <MenuItem value="">Todos</MenuItem>
        {Object.entries(statusCicloLabels).map(([value, label]) => (
          <MenuItem key={value} value={value}>{label}</MenuItem>
        ))}
      </TextField>
    </Stack>
  )

  const pagination = (
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
  )

  const modals = (
    <>
      <PdcaModal
        open={modal.open}
        editId={modal.editId}
        defaultProjectId={embedded ? projectId : null}
        onClose={() => setModal({ open: false, editId: null })}
        onSaved={() => fetchData()}
      />
      <ConfirmDialog
        open={!!toDelete}
        title="Excluir ciclo PDCA"
        message={`Tem certeza que deseja excluir o ciclo "${toDelete?.titulo}"?`}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && handleDelete(toDelete.id)}
      />
    </>
  )

  if (embedded) {
    return (
      <Box>
        {header}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {table}
        {pagination}
        {modals}
      </Box>
    )
  }

  return (
    <Container sx={{ mt: 4 }}>
      {header}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {filters}
      {table}
      {pagination}
      {modals}
    </Container>
  )
}
