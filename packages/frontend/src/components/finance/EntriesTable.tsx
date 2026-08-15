import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material'
import { AttachFile, Delete, Edit, CreditCard as CreditCardIcon, Repeat as RepeatIcon } from '@mui/icons-material'
import { FinanceEntry, SortOrder, entryTypeLabels } from '../../pages/finance/financeTypes'
import { formatCurrency, formatDate } from '../../utils/format'
import EntryTypeChip from './EntryTypeChip'
import EntryStatusChip from './EntryStatusChip'

type SortBy = 'id' | 'date' | 'type' | 'category' | 'amount' | 'status' | 'description'

const COLUMNS: { id: SortBy; label: string }[] = [
  { id: 'date', label: 'Data' },
  { id: 'type', label: 'Tipo' },
  { id: 'description', label: 'Descrição' },
  { id: 'category', label: 'Categoria' },
  { id: 'amount', label: 'Valor' },
  { id: 'status', label: 'Status' },
]

interface EntriesTableProps {
  entries: FinanceEntry[]
  sortBy: SortBy
  sortOrder: SortOrder
  onSort: (col: SortBy) => void
  onEdit: (entry: FinanceEntry) => void
  onDelete: (entry: FinanceEntry) => void
}

export default function EntriesTable({ entries, sortBy, sortOrder, onSort, onEdit, onDelete }: EntriesTableProps) {
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
            <TableCell>Conta / Cartão</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {formatDate(entry.date)}
                  {entry.recurrence && (
                    <RepeatIcon fontSize="small" color="primary" titleAccess={`Repete ${entryTypeLabels[entry.recurrence] || entry.recurrence}`} />
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <EntryTypeChip type={entry.type} />
              </TableCell>
              <TableCell>
                <Box>
                  <Box>{entry.description}</Box>
                  {entry.tags && (
                    <Typography variant="caption" color="text.secondary">
                      {entry.tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag) => `#${tag}`).join(' ')}
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell>{entry.category}</TableCell>
              <TableCell>{formatCurrency(entry.amount)}</TableCell>
              <TableCell>
                <EntryStatusChip status={entry.status} />
              </TableCell>
              <TableCell>
                <Box>
                  {entry.account?.name && <Box>{entry.account.name}</Box>}
                  {entry.card?.name && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CreditCardIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {entry.card.name}
                      </Typography>
                    </Box>
                  )}
                  {!entry.account?.name && !entry.card?.name && '-'}
                </Box>
              </TableCell>
              <TableCell align="right">
                {entry.attachment && (
                  <IconButton component="a" href={entry.attachment} target="_blank" rel="noreferrer" title="Abrir anexo">
                    <AttachFile />
                  </IconButton>
                )}
                <IconButton onClick={() => onEdit(entry)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => onDelete(entry)}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {entries.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} align="center">
                Nenhum lançamento encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
