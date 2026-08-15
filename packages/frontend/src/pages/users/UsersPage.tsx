import { useState, useEffect, useCallback } from 'react'
import { Alert, Container, TablePagination } from '@mui/material'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { User, SortBy, SortOrder, ViewMode } from './usersTypes'
import { downloadUsersExcel } from './userExport'
import UserModal from './UserModal'
import UsersToolbar from '../../components/users/UsersToolbar'
import UsersFilters from '../../components/users/UsersFilters'
import UsersTable from '../../components/users/UsersTable'
import UsersCards from '../../components/users/UsersCards'
import DeleteUserDialog from '../../components/users/DeleteUserDialog'

interface DeleteTarget {
  id: number
  name: string
}

function normalizeList(res: any): { data: User[]; total: number } {
  if (Array.isArray(res)) return { data: res, total: res.length }
  return { data: res?.data ?? [], total: res?.total ?? 0 }
}

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const { showToast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<SortBy>('id')
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const params: any = { page: page + 1, limit: rowsPerPage, sortBy, sortOrder }
      if (search) params.search = search
      const res = await api.get('/users', { params })
      const { data, total: fetchedTotal } = normalizeList(res.data)
      setUsers(data)
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
      await api.delete(`/users/${deleteTarget.id}`)
      showToast('Usuário excluído com sucesso.')
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

  const handleExport = async () => {
    try {
      const params: any = { page: 1, limit: 10000, sortBy, sortOrder }
      if (search) params.search = search
      const res = await api.get('/users', { params })
      downloadUsersExcel(normalizeList(res.data).data)
      showToast('Lista de usuários exportada com sucesso.')
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível exportar. Tente novamente.', 'error')
    }
  }

  const openCreate = () => setModal({ open: true, editId: null })
  const openEdit = (u: User) => setModal({ open: true, editId: u.id })
  const requestDelete = (u: User) => setDeleteTarget({ id: u.id, name: u.name })
  const isSelf = (u: User) => currentUser != null && String(currentUser.id) === String(u.id)

  return (
    <Container sx={{ mt: 4 }}>
      <UsersToolbar onExport={handleExport} onNew={openCreate} />

      <UsersFilters
        search={search}
        viewMode={viewMode}
        onSearchChange={handleSearchChange}
        onViewModeChange={setViewMode}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {viewMode === 'table' ? (
        <UsersTable
          users={users}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onEdit={openEdit}
          onDelete={requestDelete}
          isSelf={isSelf}
        />
      ) : (
        <UsersCards users={users} onEdit={openEdit} onDelete={requestDelete} isSelf={isSelf} />
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

      <UserModal
        open={modal.open}
        editId={modal.editId}
        onClose={() => setModal({ open: false, editId: null })}
        onSaved={() => fetchData()}
      />

      <DeleteUserDialog
        user={deleteTarget}
        deleting={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </Container>
  )
}
