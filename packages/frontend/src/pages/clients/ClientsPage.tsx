import { useState, useEffect, useCallback } from 'react'
import { Alert, Container, TablePagination } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { normalizeList } from '../../utils/list'
import ClientModal from './ClientModal'
import ClientsToolbar from '../../components/clients/ClientsToolbar'
import ClientsFilters, { ClientViewMode } from '../../components/clients/ClientsFilters'
import ClientsTable from '../../components/clients/ClientsTable'
import ClientsCards from '../../components/clients/ClientsCards'
import DeleteClientDialog from '../../components/clients/DeleteClientDialog'
import { downloadClientsExcel } from './clientExport'
import { Client, SortBy, SortOrder } from './clientsTypes'

export default function ClientsPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<SortBy>('id')
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewMode, setViewMode] = useState<ClientViewMode>('table')
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })
  const [toDelete, setToDelete] = useState<Client | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const params: any = { page: page + 1, limit: rowsPerPage, sortBy, sortOrder }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter

      const res = await api.get('/clients', { params })
      const { data, total: fetchedTotal } = normalizeList<Client>(res.data)
      setClients(data)
      setTotal(fetchedTotal)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar a lista.')
    }
  }, [page, rowsPerPage, sortBy, sortOrder, search, statusFilter])

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
    try {
      await api.delete(`/clients/${id}`)
      fetchData()
      showToast('Cliente excluído com sucesso.')
      setToDelete(null)
    } catch (err: any) {
      const message = err.response?.data?.message || 'Não foi possível excluir. Tente novamente.'
      setError(message)
      showToast(message, 'error')
      setToDelete(null)
    }
  }

  const handleChangePage = (_: any, newPage: number) => setPage(newPage)

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleExport = async () => {
    try {
      const params: any = { page: 1, limit: 10000, sortBy, sortOrder }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter

      const res = await api.get('/clients', { params })
      downloadClientsExcel(normalizeList<Client>(res.data).data)
      showToast('Lista de clientes exportada com sucesso.')
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível exportar. Tente novamente.', 'error')
    }
  }

  const resetFilterAndPage = (setter: (value: string) => void) => (value: string) => {
    setter(value)
    setPage(0)
  }

  const openCreate = () => setModal({ open: true, editId: null })
  const openEdit = (client: Client) => setModal({ open: true, editId: client.id })

  return (
    <Container sx={{ mt: 4 }}>
      <ClientsToolbar onExport={handleExport} onNew={openCreate} />

      <ClientsFilters
        search={search}
        status={statusFilter}
        viewMode={viewMode}
        onSearchChange={resetFilterAndPage(setSearch)}
        onStatusChange={resetFilterAndPage(setStatusFilter)}
        onViewModeChange={setViewMode}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {viewMode === 'table' ? (
        <ClientsTable
          clients={clients}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onOpen={(client) => navigate(`/clients/${client.id}`)}
          onEdit={openEdit}
          onDelete={setToDelete}
        />
      ) : (
        <ClientsCards
          clients={clients}
          onOpen={(client) => navigate(`/clients/${client.id}`)}
          onEdit={openEdit}
          onDelete={setToDelete}
        />
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

      <ClientModal
        open={modal.open}
        editId={modal.editId}
        onClose={() => setModal({ open: false, editId: null })}
        onSaved={() => fetchData()}
      />

      <DeleteClientDialog
        client={toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && handleDelete(toDelete.id)}
      />
    </Container>
  )
}
