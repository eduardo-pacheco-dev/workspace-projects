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
import { Category, SortOrder } from '../../pages/finance/financeTypes'

type SortBy = 'id' | 'name'

const COLUMNS: { id: SortBy; label: string }[] = [{ id: 'name', label: 'Nome' }]

interface CategoriesTableProps {
  categories: Category[]
  sortBy: SortBy
  sortOrder: SortOrder
  onSort: (col: SortBy) => void
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

export default function CategoriesTable({
  categories,
  sortBy,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
}: CategoriesTableProps) {
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
          {categories.map((category) => (
            <TableRow key={category.id} hover>
              <TableCell>{category.name}</TableCell>
              <TableCell>
                <IconButton onClick={() => onEdit(category)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => onDelete(category)}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {categories.length === 0 && (
            <TableRow>
              <TableCell colSpan={2} align="center">
                Nenhuma categoria encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
