import { useState, useEffect, useCallback } from 'react'
import { Alert, Container, TablePagination } from '@mui/material'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { normalizeList } from '../../utils/list'
import LpuModal from './LpuModal'
import LpusToolbar from '../../components/lpu/LpusToolbar'
import LpusFilters, { LpuViewMode } from '../../components/lpu/LpusFilters'
import LpusTable from '../../components/lpu/LpusTable'
import LpusCards from '../../components/lpu/LpusCards'
import DeleteLpuDialog from '../../components/lpu/DeleteLpuDialog'
import { downloadLpusExcel } from './lpuExport'
import { Lpu, LpuSortBy, SortOrder, FreelancerOption } from './lpuTypes'

export default function LpuPage() {
  const { showToast } = useToast()
  const [lpus, setLpus] = useState<Lpu[]>([])
  const [freelancers, setFreelancers] = useState<FreelancerOption[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<LpuSortBy>('nome')
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewMode, setViewMode] = useState<LpuViewMode>('table')
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })
  const [deleteTarget, setDeleteTarget] = useState<Lpu | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const params: any = { page: page + 1, limit: rowsPerPage, sortBy, sortOrder }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter

      const res = await api.get('/lpus', { params })
      const { data, total: fetchedTotal } = normalizeList<Lpu>(res.data)
      setLpus(data)
      setTotal(fetchedTotal)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar a lista.')
    }
  }, [page, rowsPerPage, sortBy, sortOrder, search, statusFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    api.get('/collaborators', { params: { limit: 100, isFreelancer: true } })
      .then((res) => setFreelancers(normalizeList<FreelancerOption>(res.data).data))
      .catch(() => {})
  }, [])

  const handleSort = (col: LpuSortBy) => {
    if (sortBy === col) {
      setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'))
    } else {
      setSortBy(col)
      setSortOrder('ASC')
    }
  }

  const handleChangePage = (_: any, newPage: number) => setPage(newPage)

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/lpus/${deleteTarget.id}`)
      showToast('LPU excluída com sucesso.')
      fetchData()
      setDeleteTarget(null)
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível excluir. Tente novamente.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const handleExport = async () => {
    try {
      const params: any = { page: 1, limit: 10000, sortBy, sortOrder }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter

      const res = await api.get('/lpus', { params })
      downloadLpusExcel(normalizeList<Lpu>(res.data).data)
      showToast('LPUs exportadas com sucesso.')
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível exportar. Tente novamente.', 'error')
    }
  }

  const resetFilterAndPage = (setter: (value: string) => void) => (value: string) => {
    setter(value)
    setPage(0)
  }

  const openCreate = () => setModal({ open: true, editId: null })
  const openEdit = (lpu: Lpu) => setModal({ open: true, editId: lpu.id })

  return (
    <Container sx={{ mt: 4 }}>
      <LpusToolbar onExport={handleExport} onNew={openCreate} />

      <LpusFilters
        search={search}
        status={statusFilter}
        viewMode={viewMode}
        onSearchChange={resetFilterAndPage(setSearch)}
        onStatusChange={resetFilterAndPage(setStatusFilter)}
        onViewModeChange={setViewMode}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {viewMode === 'table' ? (
        <LpusTable
          lpus={lpus}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
        />
      ) : (
        <LpusCards lpus={lpus} onEdit={openEdit} onDelete={setDeleteTarget} />
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

      <LpuModal
        open={modal.open}
        editId={modal.editId}
        freelancers={freelancers}
        onClose={() => setModal({ open: false, editId: null })}
        onSaved={() => fetchData()}
      />

      <DeleteLpuDialog
        lpu={deleteTarget}
        deleting={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </Container>
  )
}
