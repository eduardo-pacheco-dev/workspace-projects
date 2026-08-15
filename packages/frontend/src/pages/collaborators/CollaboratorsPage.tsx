import { useState, useEffect, useCallback } from 'react'
import { Alert, Container, TablePagination } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { normalizeList } from '../../utils/list'
import CollaboratorsToolbar from '../../components/collaborators/CollaboratorsToolbar'
import CollaboratorsFilters from '../../components/collaborators/CollaboratorsFilters'
import CollaboratorsTable from '../../components/collaborators/CollaboratorsTable'
import DeleteCollaboratorDialog from '../../components/collaborators/DeleteCollaboratorDialog'
import { downloadCollaboratorsExcel } from './collaboratorExport'
import { Collaborator, SortBy, SortOrder } from './collaboratorsTypes'

interface Props {
  isFreelancer?: boolean
  onNew: () => void
  onEdit: (id: number) => void
}

export default function CollaboratorsPage({ isFreelancer, onNew, onEdit }: Props) {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const isFreelancerList = isFreelancer === true
  const isAllList = isFreelancer === undefined
  const entityLabel = isFreelancerList ? 'Freelancer' : 'Colaborador'
  const entityLabelPlural = isFreelancerList ? 'Freelancers' : (isAllList ? 'Pessoal' : 'Colaboradores')
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<SortBy>('nome')
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nome: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const params: any = { page: page + 1, limit: rowsPerPage, sortBy, sortOrder }
      if (search) params.search = search
      if (isFreelancer !== undefined) params.isFreelancer = isFreelancer

      const res = await api.get('/collaborators', { params })
      const { data, total: fetchedTotal } = normalizeList<Collaborator>(res.data)
      setCollaborators(data)
      setTotal(fetchedTotal)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar a lista.')
    }
  }, [page, rowsPerPage, sortBy, sortOrder, search, isFreelancer])

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

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/collaborators/${deleteTarget.id}`)
      showToast(`${entityLabel} excluído com sucesso.`)
      fetchData()
      setDeleteTarget(null)
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível excluir. Tente novamente.', 'error')
    } finally {
      setDeleting(false)
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
      if (isFreelancer !== undefined) params.isFreelancer = isFreelancer

      const res = await api.get('/collaborators', { params })
      downloadCollaboratorsExcel(normalizeList<Collaborator>(res.data).data)
      showToast(`${entityLabelPlural} exportados com sucesso.`)
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível exportar. Tente novamente.', 'error')
    }
  }

  return (
    <Container sx={{ mt: 4 }}>
      <CollaboratorsToolbar
        title={entityLabelPlural}
        entityLabel={entityLabel}
        onExport={handleExport}
        onNew={onNew}
      />

      <CollaboratorsFilters search={search} onSearchChange={(value) => { setSearch(value); setPage(0) }} />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <CollaboratorsTable
        collaborators={collaborators}
        sortBy={sortBy}
        sortOrder={sortOrder}
        isAllList={isAllList}
        showCompany
        onSort={handleSort}
        onOpen={(collaborator) => navigate(`/collaborators/${collaborator.id}`)}
        onEdit={(collaborator) => onEdit(collaborator.id)}
        onDelete={(collaborator) => setDeleteTarget({ id: collaborator.id, nome: collaborator.nome || '' })}
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

      <DeleteCollaboratorDialog
        target={deleteTarget}
        entityLabel={entityLabel}
        deleting={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </Container>
  )
}
