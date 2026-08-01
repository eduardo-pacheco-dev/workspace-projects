import { useState, useEffect, useCallback } from 'react'
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  IconButton,
  Alert,
  Box,
  TextField,
  Stack,
  Chip,
} from '@mui/material'
import { Edit, Delete, Add } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { formatCurrency } from '../../utils/format'
import CardModal from './CardModal'

const brandLabels: Record<string, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  elo: 'Elo',
  amex: 'Amex',
  hipercard: 'Hipercard',
}

interface CreditCard {
  id: number
  name: string
  bank: string | null
  brand: string | null
  limit: number
  closingDay: number
  dueDay: number
}

type SortBy = 'id' | 'name' | 'bank' | 'brand' | 'limit' | 'closingDay' | 'dueDay'
type SortOrder = 'ASC' | 'DESC'

export default function CardsPage() {
  const navigate = useNavigate()
  const [cards, setCards] = useState<CreditCard[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<SortBy>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })

  const fetchData = useCallback(async () => {
    try {
      const params: any = {
        page: page + 1,
        limit: rowsPerPage,
        sortBy,
        sortOrder,
      }
      if (search) params.search = search

      const res = await api.get('/finance/cards', { params })
      if (Array.isArray(res.data)) {
        setCards(res.data)
        setTotal(res.data.length)
      } else {
        setCards(res.data.data ?? [])
        setTotal(res.data.total ?? 0)
      }
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
    if (!confirm('Tem certeza que deseja excluir este cartão?')) return
    try {
      await api.delete(`/finance/cards/${id}`)
      fetchData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir. Tente novamente.')
    }
  }

  const handleChangePage = (_: any, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const totalLimit = cards.reduce((sum, card) => sum + card.limit, 0)

  const columns: { id: SortBy; label: string }[] = [
    { id: 'name', label: 'Nome' },
    { id: 'bank', label: 'Banco' },
    { id: 'brand', label: 'Bandeira' },
    { id: 'limit', label: 'Limite' },
    { id: 'closingDay', label: 'Fechamento' },
    { id: 'dueDay', label: 'Vencimento' },
  ]

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Cartões</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setModal({ open: true, editId: null })}
        >
          Novo Cartão
        </Button>
      </Box>

      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }} alignItems="center">
        <TextField
          size="small"
          label="Buscar"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(0)
          }}
        />
        <Typography variant="body1">
          Limite total: <strong>{formatCurrency(totalLimit)}</strong>
        </Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.id}>
                  <TableSortLabel
                    active={sortBy === col.id}
                    direction={sortBy === col.id ? sortOrder.toLowerCase() as 'asc' | 'desc' : 'asc'}
                    onClick={() => handleSort(col.id)}
                  >
                    {col.label}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cards.map((card) => (
              <TableRow
                key={card.id}
                hover
                onClick={() => navigate(`/finance/cards/${card.id}`)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{card.name}</TableCell>
                <TableCell>{card.bank || '-'}</TableCell>
                <TableCell>
                  {card.brand ? <Chip size="small" label={brandLabels[card.brand] || card.brand} /> : '-'}
                </TableCell>
                <TableCell>{formatCurrency(card.limit)}</TableCell>
                <TableCell>Dia {card.closingDay}</TableCell>
                <TableCell>Dia {card.dueDay}</TableCell>
                <TableCell>
                  <IconButton onClick={(e) => { e.stopPropagation(); setModal({ open: true, editId: card.id }) }}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={(e) => { e.stopPropagation(); handleDelete(card.id) }}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {cards.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Nenhum cartão encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
    </Container>
  )
}
