import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel } from '@mui/material'

export type SortOrder = 'ASC' | 'DESC'

export interface DataColumn {
  id: string
  label: string
  sortable?: boolean
  align?: 'left' | 'right' | 'center'
}

interface DataTableProps<T> {
  columns: DataColumn[]
  rows: T[]
  rowKey: (row: T) => string | number
  renderRow: (row: T) => React.ReactNode[]
  sortBy?: string
  sortOrder?: SortOrder
  onSort?: (col: string) => void
  onRowClick?: (row: T) => void
  emptyMessage?: string
}

export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  renderRow,
  sortBy,
  sortOrder,
  onSort,
  onRowClick,
  emptyMessage = 'Nenhum registro encontrado.',
}: DataTableProps<T>) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.id} align={col.align}>
                {col.sortable === false || !onSort ? (
                  col.label
                ) : (
                  <TableSortLabel
                    active={sortBy === col.id}
                    direction={sortBy === col.id ? (sortOrder?.toLowerCase() as 'asc' | 'desc') : 'asc'}
                    onClick={() => onSort(col.id)}
                  >
                    {col.label}
                  </TableSortLabel>
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={rowKey(row)} hover={Boolean(onRowClick)} onClick={() => onRowClick?.(row)} sx={onRowClick ? { cursor: 'pointer' } : undefined}>
              {renderRow(row).map((cell, index) => (
                <TableCell key={index} align={columns[index]?.align}>
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
