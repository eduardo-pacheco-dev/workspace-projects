import {
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
import { BankAccount, SortOrder } from '../../pages/finance/financeTypes'
import { formatCurrency } from '../../utils/format'

type SortBy = 'id' | 'name' | 'bank' | 'balance'

const COLUMNS: { id: SortBy; label: string }[] = [
  { id: 'name', label: 'Nome' },
  { id: 'bank', label: 'Banco' },
  { id: 'balance', label: 'Saldo' },
]

interface AccountsTableProps {
  accounts: BankAccount[]
  sortBy: SortBy
  sortOrder: SortOrder
  onSort: (col: SortBy) => void
  onOpen: (account: BankAccount) => void
  onEdit: (account: BankAccount) => void
  onDelete: (account: BankAccount) => void
}

export default function AccountsTable({
  accounts,
  sortBy,
  sortOrder,
  onSort,
  onOpen,
  onEdit,
  onDelete,
}: AccountsTableProps) {
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
          {accounts.map((account) => (
            <TableRow key={account.id} hover onClick={() => onOpen(account)} sx={{ cursor: 'pointer' }}>
              <TableCell>{account.name}</TableCell>
              <TableCell>{account.bank || '-'}</TableCell>
              <TableCell>{formatCurrency(account.balance)}</TableCell>
              <TableCell>
                <IconButton onClick={(e) => { e.stopPropagation(); onEdit(account) }}>
                  <Edit />
                </IconButton>
                <IconButton onClick={(e) => { e.stopPropagation(); onDelete(account) }}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {accounts.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center">
                Nenhuma conta encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
