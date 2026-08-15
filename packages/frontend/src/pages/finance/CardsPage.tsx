import { useState, useEffect, useCallback } from 'react'
import { Alert, Box, Button, Container, Stack, TablePagination, Typography } from '@mui/material'
import { Add } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { normalizeList } from '../../utils/list'
import { formatCurrency } from '../../utils/format'
import ConfirmDialog from '../../components/ConfirmDialog'
import CardModal from './CardModal'
import CardsTable from '../../components/finance/CardsTable'
import SearchField from '../../components/finance/SearchField'
import { CreditCard, SortOrder } from './financeTypes'

type SortBy = 'id' | 'name' | 'bank' | 'brand' | 'limit' | 'closingDay' | 'dueDay'

export default function CardsPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [cards, setCards] = useState<CreditCard[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<SortBy>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })
  const [toDelete, setToDelete] = useState<CreditCard | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const params: any = { page: page + 1, limit: rowsPerPage, sortBy, sortOrder }
      if (search) params.search = search

      const res = await api.get('/finance/cards', { params })
      const { data, total: fetchedTotal } = normalizeList<CreditCard>(res.data)
      setCards(data)
      setTotal(fetchedTotal)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar os cartões.')
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
      await api.delete(`/finance/cards/${id}`)
      fetchData()
      showToast('Cartão excluído com sucesso.')
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

  const totalLimit = cards.reduce((sum, card) => sum + card.limit, 0)

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Cartões</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setModal({ open: true, editId: null })}>
          Novo Cartão
        </Button>
      </Box>

      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }} alignItems="center">
        <SearchField value={search} onChange={(value) => { setSearch(value); setPage(0) }} />
        <Typography variant="body1">
          Limite total: <strong>{formatCurrency(totalLimit)}</strong>
        </Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <CardsTable
        cards={cards}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onOpen={(card) => navigate(`/finance/cards/${card.id}`)}
        onEdit={(card) => setModal({ open: true, editId: card.id })}
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

      <CardModal
        open={modal.open}
        editId={modal.editId}
        onClose={() => setModal({ open: false, editId: null })}
        onSaved={() => fetchData()}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Excluir cartão"
        message={`Tem certeza que deseja excluir o cartão "${toDelete?.name}"?`}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && handleDelete(toDelete.id)}
      />
    </Container>
  )
}
