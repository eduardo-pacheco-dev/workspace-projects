import { Box, Chip, IconButton, LinearProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'
import { LimitReportItem, progressColor } from '../../pages/finance/financeTypes'
import { formatCurrency, monthNames } from '../../utils/format'

interface LimitsTableProps {
  limits: LimitReportItem[]
  onEdit: (limit: LimitReportItem) => void
  onDelete: (limit: LimitReportItem) => void
}

export default function LimitsTable({ limits, onEdit, onDelete }: LimitsTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Categoria</TableCell>
            <TableCell>Período</TableCell>
            <TableCell align="right">Limite</TableCell>
            <TableCell align="right">Gasto</TableCell>
            <TableCell align="right">Restante</TableCell>
            <TableCell sx={{ minWidth: 180 }}>Progresso</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {limits.map((limit) => (
            <TableRow key={limit.id} hover>
              <TableCell>{limit.category}</TableCell>
              <TableCell>{monthNames[limit.month - 1]} / {limit.year}</TableCell>
              <TableCell align="right">{formatCurrency(limit.amount)}</TableCell>
              <TableCell align="right">{formatCurrency(limit.spent)}</TableCell>
              <TableCell align="right">
                {limit.remaining >= 0 ? (
                  formatCurrency(limit.remaining)
                ) : (
                  <Chip size="small" label="Acima do limite" color="error" />
                )}
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(limit.percentage, 100)}
                      color={progressColor(limit.percentage)}
                    />
                  </Box>
                  <Typography variant="caption">{limit.percentage.toFixed(0)}%</Typography>
                </Box>
              </TableCell>
              <TableCell>
                <IconButton onClick={() => onEdit(limit)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => onDelete(limit)}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {limits.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} align="center">
                Nenhum limite de gastos encontrado para este período.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
