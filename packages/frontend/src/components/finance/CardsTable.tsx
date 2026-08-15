import {
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'
import { CreditCard, SortOrder, brandLabels } from '../../pages/finance/financeTypes'
import { formatCurrency } from '../../utils/format'

type SortBy = 'id' | 'name' | 'bank' | 'brand' | 'limit' | 'closingDay' | 'dueDay'

const COLUMNS: { id: SortBy; label: string }[] = [
  { id: 'name', label: 'Nome' },
  { id: 'bank', label: 'Banco' },
  { id: 'brand', label: 'Bandeira' },
  { id: 'limit', label: 'Limite' },
  { id: 'closingDay', label: 'Fechamento' },
  { id: 'dueDay', label: 'Vencimento' },
]

interface CardsTableProps {
  cards: CreditCard[]
  sortBy: SortBy
  sortOrder: SortOrder
  onSort: (col: SortBy) => void
  onOpen: (card: CreditCard) => void
  onEdit: (card: CreditCard) => void
  onDelete: (card: CreditCard) => void
}

export default function CardsTable({ cards, sortBy, sortOrder, onSort, onOpen, onEdit, onDelete }: CardsTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {COLUMNS.map((col) => (
              <TableCell key={col.id}>
                <TableSortLabel
                  active={sortBy === col.id}
                  direction={sortBy === col.id ? (sortOrder.toLowerCase() as 'asc' | 'desc') : 'asc'}
                  onClick={() => onSort(col.id)}
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
            <TableRow key={card.id} hover onClick={() => onOpen(card)} sx={{ cursor: 'pointer' }}>
              <TableCell>{card.name}</TableCell>
              <TableCell>{card.bank || '-'}</TableCell>
              <TableCell>
                {card.brand ? <Chip size="small" label={brandLabels[card.brand] || card.brand} /> : '-'}
              </TableCell>
              <TableCell>{formatCurrency(card.limit)}</TableCell>
              <TableCell>Dia {card.closingDay}</TableCell>
              <TableCell>Dia {card.dueDay}</TableCell>
              <TableCell>
                <IconButton onClick={(e) => { e.stopPropagation(); onEdit(card) }}>
                  <Edit />
                </IconButton>
                <IconButton onClick={(e) => { e.stopPropagation(); onDelete(card) }}>
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
  )
}
