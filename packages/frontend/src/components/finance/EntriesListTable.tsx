import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { FinanceEntry } from '../../pages/finance/financeTypes'
import { formatCurrency, formatDate } from '../../utils/format'

interface EntriesListTableProps {
  title: string
  entries: FinanceEntry[]
  emptyMessage: string
  onViewAll: () => void
}

export default function EntriesListTable({ title, entries, emptyMessage, onViewAll }: EntriesListTableProps) {
  const total = entries.reduce((sum, entry) => sum + entry.amount, 0)

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6">{title}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Total: {formatCurrency(total)}
          </Typography>
          <Button size="small" onClick={onViewAll}>
            Ver todos
          </Button>
        </Box>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell align="right">Valor</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id} hover>
                <TableCell>{formatDate(entry.date)}</TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell>{entry.category}</TableCell>
                <TableCell align="right">{formatCurrency(entry.amount)}</TableCell>
              </TableRow>
            ))}
            {entries.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
