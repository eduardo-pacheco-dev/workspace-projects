import { useState, useEffect, useCallback } from 'react'
import { Alert, Container, TablePagination } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { normalizeList } from '../../utils/list'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import ProjectModal from './ProjectModal'
import ProjectsToolbar from '../../components/projects/ProjectsToolbar'
import ProjectsFilters, { ProjectViewMode } from '../../components/projects/ProjectsFilters'
import ProjectsTable from '../../components/projects/ProjectsTable'
import ProjectsCards from '../../components/projects/ProjectsCards'
import { Project, ProjectSortBy, SortOrder } from './projectsTypes'

export default function ProjectsPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<ProjectSortBy>('id')
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewMode, setViewMode] = useState<ProjectViewMode>('table')
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })
  const [toDelete, setToDelete] = useState<Project | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const params: any = { page: page + 1, limit: rowsPerPage, sortBy, sortOrder }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter

      const res = await api.get('/projects', { params })
      const { data, total: fetchedTotal } = normalizeList<Project>(res.data)
      setProjects(data)
      setTotal(fetchedTotal)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar a lista.')
    }
  }, [page, rowsPerPage, sortBy, sortOrder, search, statusFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSort = (col: ProjectSortBy) => {
    if (sortBy === col) {
      setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'))
    } else {
      setSortBy(col)
      setSortOrder('ASC')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/projects/${id}`)
      fetchData()
      showToast('Projeto excluído com sucesso.')
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
  const openEdit = (project: Project) => setModal({ open: true, editId: project.id })

  return (
    <Container sx={{ mt: 4 }}>
      <ProjectsToolbar onNew={openCreate} />

      <ProjectsFilters
        search={search}
        status={statusFilter}
        viewMode={viewMode}
        onSearchChange={resetFilterAndPage(setSearch)}
        onStatusChange={resetFilterAndPage(setStatusFilter)}
        onViewModeChange={setViewMode}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {viewMode === 'table' ? (
        <ProjectsTable
          projects={projects}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onOpen={(project) => navigate(`/projects/${project.id}`)}
          onEdit={openEdit}
          onDelete={setToDelete}
        />
      ) : (
        <ProjectsCards
          projects={projects}
          onOpen={(project) => navigate(`/projects/${project.id}`)}
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

      <ProjectModal
        open={modal.open}
        editId={modal.editId}
        onClose={() => setModal({ open: false, editId: null })}
        onSaved={() => fetchData()}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Excluir projeto"
        message={`Tem certeza que deseja excluir o projeto "${toDelete?.nome}"?`}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && handleDelete(toDelete.id)}
      />
    </Container>
  )
}
