import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
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
  MenuItem,
  Chip,
} from '@mui/material'
import { Edit, Delete, Add } from '@mui/icons-material'
import api from '../../services/api'

interface Job {
  id: number
  title: string
  description: string
  budget: number
  budgetType: string
  status: string
  experienceLevel: string
  skills: string[]
}

type SortBy = 'id' | 'title' | 'budget' | 'status' | 'experienceLevel' | 'budgetType'
type SortOrder = 'ASC' | 'DESC'

interface Props {
  onNew: () => void
  onEdit: (id: number) => void
}

const statusLabels: Record<string, string> = {
  open: 'Aberto',
  in_progress: 'Em andamento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

const statusColors: Record<string, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  open: 'info',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'error',
}

const expLevelLabels: Record<string, string> = {
  junior: 'Junior',
  mid: 'Pleno',
  senior: 'Sênior',
  lead: 'Líder',
}

export default function JobList({ onNew, onEdit }: Props) {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<Job[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<SortBy>('id')
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [expLevelFilter, setExpLevelFilter] = useState('')
  const [budgetTypeFilter, setBudgetTypeFilter] = useState('')
  const [error, setError] = useState('')

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
      if (expLevelFilter) params.experienceLevel = expLevelFilter
      if (budgetTypeFilter) params.budgetType = budgetTypeFilter

      const res = await api.get('/jobs', { params })
      if (Array.isArray(res.data)) {
        setJobs(res.data)
        setTotal(res.data.length)
      } else {
        setJobs(res.data.data ?? [])
        setTotal(res.data.total ?? 0)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar a lista.')
    }
  }, [page, rowsPerPage, sortBy, sortOrder, search, statusFilter, expLevelFilter, budgetTypeFilter])

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
    if (!confirm('Tem certeza que deseja excluir este job?')) return
    try {
      await api.delete(`/jobs/${id}`)
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
    { id: 'title', label: 'Título' },
    { id: 'budget', label: 'Orçamento' },
    { id: 'budgetType', label: 'Tipo' },
    { id: 'experienceLevel', label: 'Nível' },
    { id: 'status', label: 'Status' },
  ]

  const parseSkills = (skills: string | string[]): string[] => {
    if (Array.isArray(skills)) return skills
    try {
      const parsed = JSON.parse(skills)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return skills ? [skills] : []
    }
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Jobs</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={onNew}>Novo Job</Button>
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          label="Buscar"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(0)
          }}
          sx={{ minWidth: 220 }}
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
          {Object.entries(statusLabels).map(([value, label]) => (
            <MenuItem key={value} value={value}>{label}</MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          select
          label="Nível"
          value={expLevelFilter}
          onChange={(e) => {
            setExpLevelFilter(e.target.value)
            setPage(0)
          }}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {Object.entries(expLevelLabels).map(([value, label]) => (
            <MenuItem key={value} value={value}>{label}</MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          select
          label="Tipo"
          value={budgetTypeFilter}
          onChange={(e) => {
            setBudgetTypeFilter(e.target.value)
            setPage(0)
          }}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="hourly">Por Hora</MenuItem>
          <MenuItem value="fixed">Fixo</MenuItem>
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
              <TableCell>Habilidades</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((j) => (
              <TableRow key={j.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/jobs/${j.id}`)}>
                <TableCell>{j.title}</TableCell>
                <TableCell>${j.budget}</TableCell>
                <TableCell>{j.budgetType === 'hourly' ? 'Por Hora' : 'Fixo'}</TableCell>
                <TableCell>{expLevelLabels[j.experienceLevel] || j.experienceLevel}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={statusLabels[j.status] || j.status}
                    color={statusColors[j.status] || 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ gap: 0.5 }}>
                    {parseSkills(j.skills).map((skill, i) => (
                      <Chip
                        key={`${j.id}-${i}`}
                        size="small"
                        label={skill}
                        variant="outlined"
                        sx={{ fontSize: 12 }}
                      />
                    ))}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <IconButton onClick={(e) => { e.stopPropagation(); onEdit(j.id) }}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={(e) => { e.stopPropagation(); handleDelete(j.id) }}>
                      <Delete />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {jobs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Nenhum job encontrado.
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
    </Container>
  )
}
