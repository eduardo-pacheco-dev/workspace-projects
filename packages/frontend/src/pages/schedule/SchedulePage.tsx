import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Alert, Container, TablePagination } from '@mui/material'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { normalizeList } from '../../utils/list'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import ScheduleModal from './ScheduleModal'
import ScheduleCalendar from './ScheduleCalendar'
import ScheduleToolbar, { ScheduleViewMode } from '../../components/schedule/ScheduleToolbar'
import ScheduleFilters from '../../components/schedule/ScheduleFilters'
import ScheduleTable from '../../components/schedule/ScheduleTable'
import { ScheduleEvent, ScheduleSortBy, SortOrder, toDateString, pad2 } from './scheduleTypes'

export default function SchedulePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const editParam = searchParams.get('edit')
  const { showToast } = useToast()

  const [view, setView] = useState<ScheduleViewMode>('list')
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<ScheduleSortBy>('startAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null, initialDate: null as string | null })
  const [toDelete, setToDelete] = useState<ScheduleEvent | null>(null)
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
        const year = month.getFullYear()
        const monthIndex = month.getMonth()
        const from = `${year}-${pad2(monthIndex + 1)}-01`
        const to = `${year}-${pad2(monthIndex + 1)}-${pad2(new Date(year, monthIndex + 1, 0).getDate())}`
        const params: any = { from, to, limit: 1000, sortBy: 'startAt', sortOrder: 'ASC' }
        if (statusFilter) params.status = statusFilter
        const res = await api.get('/schedule', { params })
        const { data, total: fetchedTotal } = normalizeList<ScheduleEvent>(res.data)
        setEvents(data)
        setTotal(fetchedTotal)
      } else {
        const params: any = { page: page + 1, limit: rowsPerPage, sortBy, sortOrder }
        if (search) params.search = search
        if (statusFilter) params.status = statusFilter

        const res = await api.get('/schedule', { params })
        const { data, total: fetchedTotal } = normalizeList<ScheduleEvent>(res.data)
        setEvents(data)
        setTotal(fetchedTotal)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar a agenda.')
    }
  }, [view, month, page, rowsPerPage, sortBy, sortOrder, search, statusFilter])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handlePrevMonth = () => setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  const handleNextMonth = () => setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  const handleToday = () => {
    const now = new Date()
    setMonth(new Date(now.getFullYear(), now.getMonth(), 1))
  }

  const handleSort = (col: ScheduleSortBy) => {
    if (sortBy === col) {
      setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'))
    } else {
      setSortBy(col)
      setSortOrder('ASC')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/schedule/${id}`)
      fetchEvents()
      showToast('Agendamento excluído com sucesso.')
      setToDelete(null)
    } catch (err: any) {
      const message = err.response?.data?.message || 'Não foi possível excluir. Tente novamente.'
      setError(message)
      showToast(message, 'error')
      setToDelete(null)
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

  const isActive = (event: ScheduleEvent) => event.status !== 'completed' && event.status !== 'cancelled'
  const countUpcoming = events.filter((event) => isActive(event) && (!event.startAt || event.startAt >= toDateString(new Date()))).length

  const openCreate = () => setModal({ open: true, editId: null, initialDate: null })
  const openCreateOn = (date?: string) => setModal({ open: true, editId: null, initialDate: date ?? null })
  const openEdit = (event: ScheduleEvent) => setModal({ open: true, editId: event.id, initialDate: null })

  return (
    <Container sx={{ mt: 4 }}>
      <ScheduleToolbar
        view={view}
        total={total}
        upcomingCount={countUpcoming}
        onViewChange={setView}
        onNew={openCreate}
      />

      <ScheduleFilters
        search={search}
        status={statusFilter}
        onSearchChange={resetFilterAndPage(setSearch)}
        onStatusChange={resetFilterAndPage(setStatusFilter)}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {view === 'calendar' ? (
        <ScheduleCalendar
          events={events}
          month={month}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
          onCreateEvent={openCreateOn}
          onEditEvent={(id) => setModal({ open: true, editId: id, initialDate: null })}
        />
      ) : (
        <>
          <ScheduleTable
            events={events}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onEdit={openEdit}
            onDelete={setToDelete}
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
        </>
      )}

      <ScheduleModal
        open={modal.open}
        editId={modal.editId}
        initialDate={modal.initialDate}
        onClose={() => setModal({ open: false, editId: null, initialDate: null })}
        onSaved={() => fetchEvents()}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Excluir agendamento"
        message={`Tem certeza que deseja excluir o agendamento "${toDelete?.title}"?`}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && handleDelete(toDelete.id)}
      />
    </Container>
  )
}
