import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Alert, Container, TablePagination } from '@mui/material'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { normalizeList } from '../../utils/list'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import ServiceOrderModal from './ServiceOrderModal'
import ServiceOrdersToolbar from '../../components/service-orders/ServiceOrdersToolbar'
import ServiceOrdersFilters from '../../components/service-orders/ServiceOrdersFilters'
import ServiceOrdersTable from '../../components/service-orders/ServiceOrdersTable'
import { ServiceOrder, ServiceOrderSortBy, SortOrder } from './serviceOrdersTypes'

export default function ServiceOrdersPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const editParam = searchParams.get('edit')
  const { showToast } = useToast()
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<ServiceOrderSortBy>('id')
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })
  const [toDelete, setToDelete] = useState<ServiceOrder | null>(null)

  useEffect(() => {
    if (editParam) {
      setModal({ open: true, editId: Number(editParam) })
      setSearchParams({}, { replace: true })
    }
  }, [editParam, setSearchParams])

  const fetchData = useCallback(async () => {
    try {
      const params: any = { page: page + 1, limit: rowsPerPage, sortBy, sortOrder }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter

      const res = await api.get('/service-orders', { params })
      const { data, total: fetchedTotal } = normalizeList<ServiceOrder>(res.data)
      setOrders(data)
      setTotal(fetchedTotal)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar a lista.')
    }
  }, [page, rowsPerPage, sortBy, sortOrder, search, statusFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSort = (col: ServiceOrderSortBy) => {
    if (sortBy === col) {
      setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'))
    } else {
      setSortBy(col)
      setSortOrder('ASC')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/service-orders/${id}`)
      fetchData()
      showToast('Ordem de serviço excluída com sucesso.')
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

  const openCreate = () => setModal({ open: true, editId: null })
  const openEdit = (order: ServiceOrder) => setModal({ open: true, editId: order.id })

  return (
    <Container sx={{ mt: 4 }}>
      <ServiceOrdersToolbar onNew={openCreate} />

      <ServiceOrdersFilters
        search={search}
        status={statusFilter}
        onSearchChange={resetFilterAndPage(setSearch)}
        onStatusChange={resetFilterAndPage(setStatusFilter)}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <ServiceOrdersTable
        orders={orders}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onOpen={(order) => navigate(`/service-orders/${order.id}`)}
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

      <ServiceOrderModal
        open={modal.open}
        editId={modal.editId}
        onClose={() => setModal({ open: false, editId: null })}
        onSaved={() => fetchData()}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Excluir ordem de serviço"
        message={`Tem certeza que deseja excluir a ordem de serviço "${toDelete?.numero}"?`}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && handleDelete(toDelete.id)}
      />
    </Container>
  )
}
