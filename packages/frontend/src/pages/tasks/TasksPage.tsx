import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
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
import TaskModal from './TaskModal'
import {
  Task,
  statusOptions,
  statusLabels,
  statusColors,
  priorityOptions,
  priorityLabels,
  priorityColors,
  formatDateTime,
} from './tasksTypes'

type SortBy = 'id' | 'title' | 'status' | 'priority' | 'dueAt' | 'project' | 'client' | 'assignedTo'
type SortOrder = 'ASC' | 'DESC'

export default function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const editParam = searchParams.get('edit')

  const [tasks, setTasks] = useState<Task[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<SortBy>('dueAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })

  useEffect(() => {
    if (editParam) {
      setModal({ open: true, editId: Number(editParam) })
      setSearchParams({}, { replace: true })
    }
  }, [editParam, setSearchParams])

  const fetchTasks = useCallback(async () => {
    setError('')
    try {
      const params: any = {
        page: page + 1,
        limit: rowsPerPage,
        sortBy,
        sortOrder,
      }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      if (priorityFilter) params.priority = priorityFilter

      const res = await api.get('/tasks', { params })
      if (Array.isArray(res.data)) {
        setTasks(res.data)
        setTotal(res.data.length)
      } else {
        setTasks(res.data.data ?? [])
        setTotal(res.data.total ?? 0)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar as tarefas.')
    }
  }, [page, rowsPerPage, sortBy, sortOrder, search, statusFilter, priorityFilter])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleSort = (col: SortBy) => {
    if (sortBy === col) {
      setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'))
    } else {
      setSortBy(col)
      setSortOrder('ASC')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return
    try {
      await api.delete(`/tasks/${id}`)
      fetchTasks()
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
    { id: 'status', label: 'Status' },
    { id: 'priority', label: 'Prioridade' },
    { id: 'dueAt', label: 'Vencimento' },
    { id: 'project', label: 'Projeto' },
    { id: 'client', label: 'Cliente' },
    { id: 'assignedTo', label: 'Responsável' },
  ]

  const isOpen = (task: Task) => task.status !== 'completed' && task.status !== 'cancelled'

  const countOpen = tasks.filter((task) => isOpen(task)).length

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h4">Tarefas</Typography>
          <Typography variant="body2" color="text.secondary">
            {total} tarefa(s) · {countOpen} abertas
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setModal({ open: true, editId: null })}>
          Nova Tarefa
        </Button>
      </Box>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap">
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
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {statusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          select
          label="Prioridade"
          value={priorityFilter}
          onChange={(e) => {
            setPriorityFilter(e.target.value)
            setPage(0)
          }}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {priorityOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
          ))}
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
            {tasks.map((task) => (
              <TableRow key={task.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{task.title}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={statusLabels[task.status] || task.status}
                    color={statusColors[task.status] || 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={priorityLabels[task.priority] || task.priority}
                    color={priorityColors[task.priority] || 'default'}
                  />
                </TableCell>
                <TableCell>{formatDateTime(task.dueAt)}</TableCell>
                <TableCell>{task.project || '-'}</TableCell>
                <TableCell>{task.client || '-'}</TableCell>
                <TableCell>{task.assignedTo || '-'}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <IconButton onClick={() => setModal({ open: true, editId: task.id })}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(task.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {tasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Nenhuma tarefa encontrada.
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

      <TaskModal
        open={modal.open}
        editId={modal.editId}
        onClose={() => setModal({ open: false, editId: null })}
        onSaved={() => fetchTasks()}
      />
    </Container>
  )
}
