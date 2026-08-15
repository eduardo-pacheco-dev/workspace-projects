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
} from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'
import { Lpu, LpuSortBy, SortOrder, LPU_COLUMNS, formatValor } from '../../pages/lpu/lpuTypes'
import LpuStatusChip from './LpuStatusChip'

interface LpusTableProps {
  lpus: Lpu[]
  sortBy: LpuSortBy
  sortOrder: SortOrder
  onSort: (col: LpuSortBy) => void
  onEdit: (lpu: Lpu) => void
  onDelete: (lpu: Lpu) => void
}

export default function LpusTable({ lpus, sortBy, sortOrder, onSort, onEdit, onDelete }: LpusTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {LPU_COLUMNS.map((col) => (
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
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lpus.map((lpu) => (
            <TableRow key={lpu.id} hover>
              <TableCell>{lpu.freelancer?.nome || '-'}</TableCell>
              <TableCell>{lpu.nome}</TableCell>
              <TableCell>{formatValor(lpu.valor)}</TableCell>
              <TableCell>{lpu.data || '-'}</TableCell>
              <TableCell>
                <LpuStatusChip status={lpu.status} />
              </TableCell>
              <TableCell align="right">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5 }}>
                  <IconButton onClick={() => onEdit(lpu)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => onDelete(lpu)}>
                    <Delete />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
          {lpus.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center">
                Nenhuma LPU encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
