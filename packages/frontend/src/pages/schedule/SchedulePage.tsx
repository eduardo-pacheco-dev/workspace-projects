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
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import { Edit, Delete, Add, ViewList, CalendarMonth } from '@mui/icons-material'
import api from '../../services/api'
import ScheduleModal from './ScheduleModal'
import ScheduleCalendar from './ScheduleCalendar'
import {
  ScheduleEvent,
  statusOptions,
  statusLabels,
  statusColors,
  formatDateTime,
  toDateString,
  pad2,
} from './scheduleTypes'

type SortBy = 'id' | 'title' | 'startAt' | 'endAt' | 'status' | 'client' | 'location'
type SortOrder = 'ASC' | 'DESC'
type ViewMode = 'list' | 'calendar'

export default function SchedulePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const editParam = searchParams.get('edit')

  const [view, setView] = useState<ViewMode>('list')
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<SortBy>('startAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null, initialDate: null as string | null })
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  useEffect(() => {
    if (editParam) {
      setModal({ open: true, editId: Number(editParam), initialDate: null })
      setSearchParams({}, { replace: true })
    }
  }, [editParam, setSearchParams])

  const fetchEvents = useCallback(async () => {
    setError('')
    try {
      if (view === 'calendar') {
        const from = `${month.getFullYear()}-${pad2(month.getMonth() + 1)}-01`
        const to = `${month.getFullYear()}-${pad2(month.getMonth() + 1)}-${pad2(new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate())}`
        const params: any = { from, to, limit: 1000, sortBy: 'startAt', sortOrder: 'ASC' }
        if (statusFilter) params.status = statusFilter
        const res = await api.get('/schedule', { params })
        setEvents(Array.isArray(res.data) ? res.data : (res.data.data ?? []))
        setTotal(Array.isArray(res.data) ? res.data.length : (res.data.total ?? 0))
      } else {
        const params: any = {
          page: page + 1,
          limit: rowsPerPage,
          sortBy,
          sortOrder,
        }
        if (search) params.search = search
        if (statusFilter) params.status = statusFilter

        const res = await api.get('/schedule', { params })
        if (Array.isArray(res.data)) {
          setEvents(res.data)
          setTotal(res.data.length)
        } else {
          setEvents(res.data.data ?? [])
          setTotal(res.data.total ?? 0)
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar a agenda.')
    }
  }, [view, month, page, rowsPerPage, sortBy, sortOrder, search, statusFilter])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handleChangeView = (_: React.MouseEvent<HTMLElement>, nextView: ViewMode | null) => {
    if (nextView) setView(nextView)
  }

  const handlePrevMonth = () => setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  const handleNextMonth = () => setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  const handleToday = () => {
    const now = new Date()
    setMonth(new Date(now.getFullYear(), now.getMonth(), 1))
  }

  const handleSort = (col: SortBy) => {
    if (sortBy === col) {
      setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'))
    } else {
      setSortBy(col)
      setSortOrder('ASC')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return
    try {
      await api.delete(`/schedule/${id}`)
      fetchEvents()
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

  const columns: { id: SortBy | 'description'; label: string; sortable?: boolean }[] = [
    { id: 'title', label: 'Título' },
    { id: 'startAt', label: 'Início' },
    { id: 'endAt', label: 'Fim' },
    { id: 'client', label: 'Cliente' },
    { id: 'location', label: 'Local' },
    { id: 'assignedTo' as SortBy, label: 'Responsável' },
    { id: 'status', label: 'Status' },
  ]

  const isActive = (event: ScheduleEvent) =>
    event.status !== 'completed' && event.status !== 'cancelled'

  const countUpcoming = events.filter((event) => isActive(event) && (!event.startAt || event.startAt >= toDateString(new Date()))).length

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h4">Agenda</Typography>
          {view === 'list' && (
            <Typography variant="body2" color="text.secondary">
              {total} agendamento(s) · {countUpcoming} próximos
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ToggleButtonGroup value={view} exclusive onChange={handleChangeView} size="small">
            <ToggleButton value="list" aria-label="Lista">
              <ViewList fontSize="small" sx={{ mr: 0.5 }} />
              Lista
            </ToggleButton>
            <ToggleButton value="calendar" aria-label="Calendário">
              <CalendarMonth fontSize="small" sx={{ mr: 0.5 }} />
              Calendário
            </ToggleButton>
          </ToggleButtonGroup>
          <Button variant="contained" startIcon={<Add />} onClick={() => setModal({ open: true, editId: null, initialDate: null })}>
            Novo Agendamento
          </Button>
        </Box>
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
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {statusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
          ))}
        </TextField>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {view === 'calendar' ? (
        <ScheduleCalendar
          events={events}
          month={month}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
          onCreateEvent={(date) => setModal({ open: true, editId: null, initialDate: date ?? null })}
          onEditEvent={(id) => setModal({ open: true, editId: id, initialDate: null })}
        />
      ) : (
        <>
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
                {events.map((event) => (
                  <TableRow key={event.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{event.title}</TableCell>
                    <TableCell>{formatDateTime(event.startAt)}</TableCell>
                    <TableCell>{formatDateTime(event.endAt)}</TableCell>
                    <TableCell>{event.client || '-'}</TableCell>
                    <TableCell>{event.location || '-'}</TableCell>
                    <TableCell>{event.assignedTo || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={statusLabels[event.status] || event.status}
                        color={statusColors[event.status] || 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => setModal({ open: true, editId: event.id, initialDate: null })}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(event.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {events.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Nenhum agendamento encontrado.
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
        </>
      )}

      <ScheduleModal
        open={modal.open}
        editId={modal.editId}
        initialDate={modal.initialDate}
        onClose={() => setModal({ open: false, editId: null, initialDate: null })}
        onSaved={() => fetchEvents()}
      />
    </Container>
  )
}
