import { useState, useEffect, useCallback } from 'react'
import { Alert, Box, Container, TablePagination } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { normalizeList } from '../../utils/list'
import ConfirmDialog from '../../components/ConfirmDialog'
import PdcaModal from './PdcaModal'
import PdcaToolbar from '../../components/pdca/PdcaToolbar'
import PdcaFilters from '../../components/pdca/PdcaFilters'
import PdcaTable from '../../components/pdca/PdcaTable'
import { Pdca, PdcaSortBy, SortOrder, ProjectOption } from './pdcaTypes'

interface PdcaPageProps {
  projectId?: number | null
  embedded?: boolean
}

export default function PdcaPage({ projectId, embedded }: PdcaPageProps) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [items, setItems] = useState<Pdca[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<PdcaSortBy>('id')
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC')
  const [search, setSearch] = useState('')
  const [projectFilter, setProjectFilter] = useState('')
  const [faseFilter, setFaseFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })
  const [toDelete, setToDelete] = useState<Pdca | null>(null)
  const [projects, setProjects] = useState<ProjectOption[]>([])

  const fetchData = useCallback(async () => {
    try {
      const params: any = { page: page + 1, limit: rowsPerPage, sortBy, sortOrder }
      if (search) params.search = search
      if (embedded && projectId) params.projectId = projectId
      else if (projectFilter) params.projectId = projectFilter
      if (faseFilter) params.fase = faseFilter
      if (statusFilter) params.status = statusFilter

      const res = await api.get('/pdca', { params })
      const { data, total: fetchedTotal } = normalizeList<Pdca>(res.data)
      setItems(data)
      setTotal(fetchedTotal)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar os ciclos PDCA.')
    }
  }, [page, rowsPerPage, sortBy, sortOrder, search, projectFilter, faseFilter, statusFilter, embedded, projectId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    api.get('/projects', { params: { limit: 1000, sortBy: 'nome', sortOrder: 'ASC' } })
      .then((res) => {
        const data = normalizeList<{ id: number; nome: string }>(res.data).data
        setProjects(data.map((p) => ({ id: p.id, nome: p.nome })))
      })
      .catch(() => {})
  }, [])

  const handleSort = (col: PdcaSortBy) => {
    if (sortBy === col) {
      setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'))
    } else {
      setSortBy(col)
      setSortOrder('ASC')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/pdca/${id}`)
      fetchData()
      showToast('Ciclo PDCA excluído com sucesso.')
      setToDelete(null)
    } catch (err: any) {
      const message = err.response?.data?.message || 'Não foi possível excluir.'
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

  const resetFilterAndPage = (setter: (value: string) => void) => (value: string) => {
    setter(value)
    setPage(0)
  }

  const openCreate = () => setModal({ open: true, editId: null })
  const openEdit = (pdca: Pdca) => setModal({ open: true, editId: pdca.id })

  const content = (
    <>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {!embedded && (
        <PdcaFilters
          search={search}
          projectFilter={projectFilter}
          faseFilter={faseFilter}
          statusFilter={statusFilter}
          projects={projects}
          onSearchChange={resetFilterAndPage(setSearch)}
          onProjectChange={resetFilterAndPage(setProjectFilter)}
          onFaseChange={resetFilterAndPage(setFaseFilter)}
          onStatusChange={resetFilterAndPage(setStatusFilter)}
        />
      )}
      <PdcaTable
        items={items}
        projects={projects}
        sortBy={sortBy}
        sortOrder={sortOrder}
        embedded={embedded}
        onSort={handleSort}
        onOpen={(pdca) => navigate(`/pdca/${pdca.id}`)}
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
      <PdcaModal
        open={modal.open}
        editId={modal.editId}
        defaultProjectId={embedded ? projectId : null}
        onClose={() => setModal({ open: false, editId: null })}
        onSaved={() => fetchData()}
      />
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Excluir ciclo PDCA"
        message={`Tem certeza que deseja excluir o ciclo "${toDelete?.titulo}"?`}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && handleDelete(toDelete.id)}
      />
    </>
  )

  if (embedded) {
    return (
      <Box>
        <PdcaToolbar embedded onNew={openCreate} />
        {content}
      </Box>
    )
  }

  return (
    <Container sx={{ mt: 4 }}>
      <PdcaToolbar onNew={openCreate} />
      {content}
    </Container>
  )
}
