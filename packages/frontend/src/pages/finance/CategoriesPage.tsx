import { useState, useEffect, useCallback } from 'react'
import { Alert, Box, Button, Container, Stack, TablePagination, Typography } from '@mui/material'
import { Add } from '@mui/icons-material'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { normalizeList } from '../../utils/list'
import ConfirmDialog from '../../components/ConfirmDialog'
import CategoryModal from './CategoryModal'
import CategoriesTable from '../../components/finance/CategoriesTable'
import SearchField from '../../components/finance/SearchField'
import { Category, SortOrder } from './financeTypes'

type SortBy = 'id' | 'name'

export default function CategoriesPage() {
  const { showToast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<SortBy>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })
  const [toDelete, setToDelete] = useState<Category | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const params: any = { page: page + 1, limit: rowsPerPage, sortBy, sortOrder }
      if (search) params.search = search

      const res = await api.get('/finance/categories', { params })
      const { data, total: fetchedTotal } = normalizeList<Category>(res.data)
      setCategories(data)
      setTotal(fetchedTotal)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar as categorias.')
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

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/finance/categories/${id}`)
      fetchData()
      showToast('Categoria excluída com sucesso.')
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

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Categorias</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setModal({ open: true, editId: null })}>
          Nova Categoria
        </Button>
      </Box>

      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <SearchField value={search} onChange={(value) => { setSearch(value); setPage(0) }} />
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <CategoriesTable
        categories={categories}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onEdit={(category) => setModal({ open: true, editId: category.id })}
        onDelete={setToDelete}
      />

      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Linhas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />

      <CategoryModal
        open={modal.open}
        editId={modal.editId}
        onClose={() => setModal({ open: false, editId: null })}
        onSaved={() => fetchData()}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Excluir categoria"
        message={`Tem certeza que deseja excluir a categoria "${toDelete?.name}"?`}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && handleDelete(toDelete.id)}
      />
    </Container>
  )
}
