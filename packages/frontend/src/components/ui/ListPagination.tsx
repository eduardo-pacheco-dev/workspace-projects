import { TablePagination } from '@mui/material'

interface ListPaginationProps {
  total: number
  page: number
  rowsPerPage: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void
}

export default function ListPagination({ total, page, rowsPerPage, onPageChange, onRowsPerPageChange }: ListPaginationProps) {
  return (
    <TablePagination
      component="div"
      count={total}
      page={page}
      onPageChange={(_, newPage) => onPageChange(newPage)}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
      labelRowsPerPage="Por página:"
      labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
    />
  )
}
