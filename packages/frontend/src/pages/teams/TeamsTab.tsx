import { useState, useEffect, useCallback } from 'react'
import { Alert, Container, TablePagination } from '@mui/material'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { normalizeList } from '../../utils/list'
import { Team, SortBy, SortOrder } from './teamsTypes'
import TeamModal from './TeamModal'
import TeamsToolbar from '../../components/teams/TeamsToolbar'
import TeamsFilters from '../../components/teams/TeamsFilters'
import TeamsTable from '../../components/teams/TeamsTable'
import DeleteTeamDialog from '../../components/teams/DeleteTeamDialog'

interface DeleteTarget {
  id: number
  nome: string
}

export default function TeamsTab() {
  const { showToast } = useToast()
  const [teams, setTeams] = useState<Team[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<SortBy>('nome')
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const params: any = { page: page + 1, limit: rowsPerPage, sortBy, sortOrder }
      if (search) params.search = search
      const res = await api.get('/teams', { params })
      const { data, total: fetchedTotal } = normalizeList<Team>(res.data)
      setTeams(data)
      setTotal(fetchedTotal)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar a lista.')
    }
  }, [page, rowsPerPage, sortBy, sortOrder, search])

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
      await api.delete(`/teams/${deleteTarget.id}`)
      showToast('Equipe excluída com sucesso.')
      fetchData()
      setDeleteTarget(null)
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível excluir. Tente novamente.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const handleChangePage = (_: any, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(0)
  }

  const openCreate = () => setModal({ open: true, editId: null })
  const openEdit = (team: Team) => setModal({ open: true, editId: team.id })
  const requestDelete = (team: Team) => setDeleteTarget({ id: team.id, nome: team.nome })

  return (
    <Container sx={{ mt: 4 }}>
      <TeamsToolbar onNew={openCreate} />

      <TeamsFilters search={search} onSearchChange={handleSearchChange} />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TeamsTable
        teams={teams}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onEdit={openEdit}
        onDelete={requestDelete}
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

      <TeamModal
        open={modal.open}
        editId={modal.editId}
        onClose={() => setModal({ open: false, editId: null })}
        onSaved={() => fetchData()}
      />

      <DeleteTeamDialog
        team={deleteTarget}
        deleting={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </Container>
  )
}
