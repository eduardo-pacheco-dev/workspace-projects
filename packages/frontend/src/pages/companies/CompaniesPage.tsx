import { useState, useEffect, useCallback } from 'react'
import { Alert, Container, TablePagination } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { normalizeList } from '../../utils/list'
import ConfirmDialog from '../../components/ConfirmDialog'
import CompanyModal from './CompanyModal'
import CompaniesToolbar from '../../components/companies/CompaniesToolbar'
import CompaniesFilters from '../../components/companies/CompaniesFilters'
import CompaniesTable from '../../components/companies/CompaniesTable'
import { Company, CompanySortBy, SortOrder } from './companiesTypes'

export default function CompaniesPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [companies, setCompanies] = useState<Company[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<CompanySortBy>('nome')
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })
  const [toDelete, setToDelete] = useState<Company | null>(null)

  const fetchCompanies = useCallback(async () => {
    setError('')
    try {
      const params: any = { page: page + 1, limit: rowsPerPage, sortBy, sortOrder }
      if (search) params.search = search

      const res = await api.get('/companies', { params })
      const { data, total: fetchedTotal } = normalizeList<Company>(res.data)
      setCompanies(data)
      setTotal(fetchedTotal)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar as empresas.')
    }
  }, [page, rowsPerPage, sortBy, sortOrder, search])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  const handleSort = (col: CompanySortBy) => {
    if (sortBy === col) {
      setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'))
    } else {
      setSortBy(col)
      setSortOrder('ASC')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/companies/${id}`)
      fetchCompanies()
      showToast('Empresa excluída com sucesso.')
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

  const activeCount = companies.filter((c) => c.ativa).length

  return (
    <Container sx={{ mt: 4 }}>
      <CompaniesToolbar total={total} activeCount={activeCount} onNew={() => setModal({ open: true, editId: null })} />

      <CompaniesFilters search={search} onSearchChange={(value) => { setSearch(value); setPage(0) }} />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <CompaniesTable
        companies={companies}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onOpen={(company) => navigate(`/companies/${company.id}`)}
        onEdit={(company) => setModal({ open: true, editId: company.id })}
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

      <CompanyModal
        open={modal.open}
        editId={modal.editId}
        onClose={() => setModal({ open: false, editId: null })}
        onSaved={() => fetchCompanies()}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Excluir empresa"
        message={`Tem certeza que deseja excluir a empresa "${toDelete?.nome}"?`}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && handleDelete(toDelete.id)}
      />
    </Container>
  )
}
