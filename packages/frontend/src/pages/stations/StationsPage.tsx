import { useState, useEffect, useCallback } from 'react'
import { Alert, Container, TablePagination, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { ListAlt, Map as MapIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { normalizeList } from '../../utils/list'
import DeleteModal from '../../components/modals/DeleteModal'
import StationModal from './StationModal'
import ImportStationsModal from './ImportStationsModal'
import StationsMapTab from './StationsMapTab'
import StationsToolbar from '../../components/stations/StationsToolbar'
import StationsFilters, { StationViewMode } from '../../components/stations/StationsFilters'
import StationsTable from '../../components/stations/StationsTable'
import StationsCards from '../../components/stations/StationsCards'
import { Station, StationSortBy, SortOrder } from './stationsTypes'

export default function StationsPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [stations, setStations] = useState<Station[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<StationSortBy>('id')
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [mobileCarrierFilter, setMobileCarrierFilter] = useState('')
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })
  const [stationToDelete, setStationToDelete] = useState<Station | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [tab, setTab] = useState(0)
  const [viewMode, setViewMode] = useState<StationViewMode>('table')

  const fetchData = useCallback(async () => {
    try {
      const params: any = { page: page + 1, limit: rowsPerPage, sortBy, sortOrder }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      if (mobileCarrierFilter) params.mobileCarrier = mobileCarrierFilter

      const res = await api.get('/stations', { params })
      const { data, total: fetchedTotal } = normalizeList<Station>(res.data)
      setStations(data)
      setTotal(fetchedTotal)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar a lista.')
    }
  }, [page, rowsPerPage, sortBy, sortOrder, search, statusFilter, mobileCarrierFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSort = (col: StationSortBy) => {
    if (sortBy === col) {
      setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'))
    } else {
      setSortBy(col)
      setSortOrder('ASC')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/stations/${id}`)
      fetchData()
      showToast('Estação excluída com sucesso.')
      setStationToDelete(null)
    } catch (err: any) {
      const message = err.response?.data?.message || 'Não foi possível excluir. Tente novamente.'
      setError(message)
      showToast(message, 'error')
      setStationToDelete(null)
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
  const openEdit = (station: Station) => setModal({ open: true, editId: station.id })

  return (
    <Container sx={{ mt: 4 }}>
      <StationsToolbar total={total} onImport={() => setImportOpen(true)} onNew={openCreate} />

      <StationsFilters
        search={search}
        status={statusFilter}
        mobileCarrier={mobileCarrierFilter}
        viewMode={viewMode}
        onSearchChange={resetFilterAndPage(setSearch)}
        onStatusChange={resetFilterAndPage(setStatusFilter)}
        onMobileCarrierChange={resetFilterAndPage(setMobileCarrierFilter)}
        onViewModeChange={setViewMode}
        showViewToggle={tab === 0}
      />

      <ToggleButtonGroup
        value={tab}
        exclusive
        size="small"
        onChange={(_, value) => value != null && setTab(value)}
        sx={{ mb: 2 }}
      >
        <ToggleButton value={0} sx={{ textTransform: 'none', px: 2.5 }}>
          <ListAlt fontSize="small" sx={{ mr: 0.75 }} />
          Lista
        </ToggleButton>
        <ToggleButton value={1} sx={{ textTransform: 'none', px: 2.5 }}>
          <MapIcon fontSize="small" sx={{ mr: 0.75 }} />
          Mapa
        </ToggleButton>
      </ToggleButtonGroup>

      {tab === 1 ? (
        <StationsMapTab search={search} status={statusFilter} mobileCarrier={mobileCarrierFilter} />
      ) : (
        <>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {viewMode === 'table' ? (
            <StationsTable
              stations={stations}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              onOpen={(station) => navigate(`/stations/${station.id}`)}
              onEdit={openEdit}
              onDelete={setStationToDelete}
            />
          ) : (
            <StationsCards
              stations={stations}
              onOpen={(station) => navigate(`/stations/${station.id}`)}
              onEdit={openEdit}
              onDelete={setStationToDelete}
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

          <StationModal
            open={modal.open}
            editId={modal.editId}
            onClose={() => setModal({ open: false, editId: null })}
            onSaved={() => fetchData()}
          />

          <DeleteModal
            open={Boolean(stationToDelete)}
            title="Excluir estação"
            message={`Tem certeza que deseja excluir a estação "${stationToDelete?.siteId}"? Esta ação não poderá ser desfeita.`}
            onClose={() => setStationToDelete(null)}
            onConfirm={() => stationToDelete && handleDelete(stationToDelete.id)}
          />

          <ImportStationsModal
            open={importOpen}
            onClose={() => setImportOpen(false)}
            onImported={() => fetchData()}
          />
        </>
      )}
    </Container>
  )
}
