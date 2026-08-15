import { Box, IconButton } from '@mui/material'
import { Delete, Edit } from '@mui/icons-material'
import DataTable, { DataColumn } from '../ui/DataTable'
import { Category } from '../../pages/finance/financeTypes'

const COLUMNS: DataColumn[] = [
  { id: 'name', label: 'Nome' },
  { id: 'actions', label: 'Ações', sortable: false, align: 'right' },
]

interface CategoriesTableProps {
  categories: Category[]
  sortBy: 'id' | 'name'
  sortOrder: 'ASC' | 'DESC'
  onSort: (col: 'id' | 'name') => void
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

export default function CategoriesTable({ categories, sortBy, sortOrder, onSort, onEdit, onDelete }: CategoriesTableProps) {
  return (
    <DataTable
      columns={COLUMNS}
      rows={categories}
      rowKey={(category) => category.id}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={onSort as (col: string) => void}
      emptyMessage="Nenhuma categoria encontrada."
      renderRow={(category) => [
        category.name,
        <Box key="actions">
          <IconButton onClick={() => onEdit(category)}>
            <Edit />
          </IconButton>
          <IconButton onClick={() => onDelete(category)}>
            <Delete />
          </IconButton>
        </Box>,
      ]}
    />
  )
}
