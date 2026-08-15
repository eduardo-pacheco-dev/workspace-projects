import { useState, useEffect, useCallback } from 'react'
import { Alert, Container, TablePagination, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { ListAlt, Map as MapIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { normalizeList } from '../../utils/list'
import DeleteModal from '../../components/modals/DeleteModal'
import RadioLinkModal from './RadioLinkModal'
import ImportRadioLinksModal from './ImportRadioLinksModal'
import RadioLinksMapTab from './RadioLinksMapTab'
import RadioLinksToolbar from '../../components/radio-links/RadioLinksToolbar'
import RadioLinksFilters, { RadioLinkViewMode } from '../../components/radio-links/RadioLinksFilters'
import RadioLinksTable from '../../components/radio-links/RadioLinksTable'
import RadioLinksCards from '../../components/radio-links/RadioLinksCards'
import { RadioLink, RadioLinkSortBy, SortOrder } from './radioLinksTypes'

const VIEW_MODE_KEY = 'radioLinksViewMode'

const getStoredViewMode = (): RadioLinkViewMode => {
  const stored = localStorage.getItem(VIEW_MODE_KEY)
  return stored === 'cards' ? 'cards' : 'table'
}

export default function RadioLinksPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [radioLinks, setRadioLinks] = useState<RadioLink[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<RadioLinkSortBy>('id')
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [operadoraFilter, setOperadoraFilter] = useState('')
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })
  const [linkToDelete, setLinkToDelete] = useState<RadioLink | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [tab, setTab] = useState(0)
  const [viewMode, setViewMode] = useState<RadioLinkViewMode>(getStoredViewMode)

  const fetchData = useCallback(async () => {
    try {
      const params: any = { page: page + 1, limit: rowsPerPage, sortBy, sortOrder }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      if (operadoraFilter) params.operadora = operadoraFilter

      const res = await api.get('/radio-links', { params })
      const { data, total: fetchedTotal } = normalizeList<RadioLink>(res.data)
      setRadioLinks(data)
      setTotal(fetchedTotal)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar a lista.')
    }
  }, [page, rowsPerPage, sortBy, sortOrder, search, statusFilter, operadoraFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSort = (col: RadioLinkSortBy) => {
    if (sortBy === col) {
      setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'))
    } else {
      setSortBy(col)
      setSortOrder('ASC')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/radio-links/${id}`)
      fetchData()
      showToast('Enlace de rádio excluído com sucesso.')
      setLinkToDelete(null)
    } catch (err: any) {
      const message = err.response?.data?.message || 'Não foi possível excluir. Tente novamente.'
      setError(message)
      showToast(message, 'error')
      setLinkToDelete(null)
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
  const openEdit = (link: RadioLink) => setModal({ open: true, editId: link.id })

  const handleViewModeChange = (mode: RadioLinkViewMode) => {
    setViewMode(mode)
    localStorage.setItem(VIEW_MODE_KEY, mode)
  }

  return (
    <Container sx={{ mt: 4 }}>
      <RadioLinksToolbar total={total} onImport={() => setImportOpen(true)} onNew={openCreate} />

      <RadioLinksFilters
        search={search}
        status={statusFilter}
        operadora={operadoraFilter}
        viewMode={viewMode}
        onSearchChange={resetFilterAndPage(setSearch)}
        onStatusChange={resetFilterAndPage(setStatusFilter)}
        onOperadoraChange={resetFilterAndPage(setOperadoraFilter)}
        onViewModeChange={handleViewModeChange}
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
        <RadioLinksMapTab search={search} status={statusFilter} operadora={operadoraFilter} />
      ) : (
        <>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {viewMode === 'table' ? (
            <RadioLinksTable
              radioLinks={radioLinks}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              onOpen={(link) => navigate(`/radio-links/${link.id}`)}
              onEdit={openEdit}
              onDelete={setLinkToDelete}
            />
          ) : (
            <RadioLinksCards
              radioLinks={radioLinks}
              onOpen={(link) => navigate(`/radio-links/${link.id}`)}
              onEdit={openEdit}
              onDelete={setLinkToDelete}
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

          <RadioLinkModal
            open={modal.open}
            editId={modal.editId}
            onClose={() => setModal({ open: false, editId: null })}
            onSaved={() => fetchData()}
          />

          <ImportRadioLinksModal
            open={importOpen}
            onClose={() => setImportOpen(false)}
            onImported={() => fetchData()}
          />

          <DeleteModal
            open={Boolean(linkToDelete)}
            title="Excluir enlace de rádio"
            message={`Tem certeza que deseja excluir o enlace "${linkToDelete?.nome}"? Esta ação não poderá ser desfeita.`}
            onClose={() => setLinkToDelete(null)}
            onConfirm={() => linkToDelete && handleDelete(linkToDelete.id)}
          />
        </>
      )}
    </Container>
  )
}
