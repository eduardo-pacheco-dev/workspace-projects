import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Alert, Container, TablePagination } from '@mui/material'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { normalizeList } from '../../utils/list'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import TaskModal from './TaskModal'
import TasksToolbar from '../../components/tasks/TasksToolbar'
import TasksFilters from '../../components/tasks/TasksFilters'
import TasksTable from '../../components/tasks/TasksTable'
import { Task, TaskSortBy, SortOrder } from './tasksTypes'

export default function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const editParam = searchParams.get('edit')
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [tasks, setTasks] = useState<Task[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<TaskSortBy>('dueAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)

  useEffect(() => {
    if (editParam) {
      setModal({ open: true, editId: Number(editParam) })
      setSearchParams({}, { replace: true })
    }
  }, [editParam, setSearchParams])

  const fetchTasks = useCallback(async () => {
    setError('')
    try {
      const params: any = { page: page + 1, limit: rowsPerPage, sortBy, sortOrder }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      if (priorityFilter) params.priority = priorityFilter

      const res = await api.get('/tasks', { params })
      const { data, total: fetchedTotal } = normalizeList<Task>(res.data)
      setTasks(data)
      setTotal(fetchedTotal)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar as tarefas.')
    }
  }, [page, rowsPerPage, sortBy, sortOrder, search, statusFilter, priorityFilter])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleSort = (col: TaskSortBy) => {
    if (sortBy === col) {
      setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'))
    } else {
      setSortBy(col)
      setSortOrder('ASC')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/tasks/${id}`)
      fetchTasks()
      showToast('Tarefa excluída com sucesso.')
      setTaskToDelete(null)
    } catch (err: any) {
      const message = err.response?.data?.message || 'Não foi possível excluir. Tente novamente.'
      setError(message)
      showToast(message, 'error')
      setTaskToDelete(null)
    }
  }

  const handleChangePage = (_: any, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const resetFilterAndPage = (setter: (value: string) => void) => (value: string) => {
    setter(value)
    setPage(0)
  }

  const isOpen = (task: Task) => task.status !== 'completed' && task.status !== 'cancelled'
  const openCount = tasks.filter(isOpen).length

  const openCreate = () => setModal({ open: true, editId: null })
  const openEdit = (task: Task) => setModal({ open: true, editId: task.id })

  return (
    <Container sx={{ mt: 4 }}>
      <TasksToolbar total={total} openCount={openCount} onNew={openCreate} />

      <TasksFilters
        search={search}
        status={statusFilter}
        priority={priorityFilter}
        onSearchChange={resetFilterAndPage(setSearch)}
        onStatusChange={resetFilterAndPage(setStatusFilter)}
        onPriorityChange={resetFilterAndPage(setPriorityFilter)}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TasksTable
        tasks={tasks}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onOpen={(task) => navigate(`/tasks/${task.id}`)}
        onEdit={openEdit}
        onDelete={setTaskToDelete}
      />

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

      <ConfirmDialog
        open={Boolean(taskToDelete)}
        title="Excluir tarefa"
        message={`Tem certeza que deseja excluir a tarefa "${taskToDelete?.title}"?`}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => taskToDelete && handleDelete(taskToDelete.id)}
      />
    </Container>
  )
}
