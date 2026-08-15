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
import { Pdca, PdcaSortBy, SortOrder, PDCA_COLUMNS, ProjectOption } from '../../pages/pdca/pdcaTypes'
import PdcaChip from './PdcaChip'

interface PdcaTableProps {
  items: Pdca[]
  projects: ProjectOption[]
  sortBy: PdcaSortBy
  sortOrder: SortOrder
  embedded?: boolean
  onSort: (col: PdcaSortBy) => void
  onOpen: (pdca: Pdca) => void
  onEdit: (pdca: Pdca) => void
  onDelete: (pdca: Pdca) => void
}

export default function PdcaTable({
  items,
  projects,
  sortBy,
  sortOrder,
  embedded,
  onSort,
  onOpen,
  onEdit,
  onDelete,
}: PdcaTableProps) {
  const projectName = (projectId: number | null) =>
    projects.find((p) => p.id === projectId)?.nome || '-'

  return (
    <TableContainer component={Paper} sx={embedded ? { boxShadow: 'none' } : undefined}>
      <Table>
        <TableHead>
          <TableRow>
            {PDCA_COLUMNS.map((col) => (
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
            <TableCell>Projeto</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((pdca) => (
            <TableRow key={pdca.id} hover onClick={() => onOpen(pdca)} sx={{ cursor: 'pointer' }}>
              <TableCell>{pdca.titulo}</TableCell>
              <TableCell>
                <PdcaChip kind="fase" value={pdca.fase} />
              </TableCell>
              <TableCell>
                <PdcaChip kind="statusCiclo" value={pdca.statusCiclo} />
              </TableCell>
              <TableCell>{projectName(pdca.projectId)}</TableCell>
              <TableCell align="right">
                <IconButton onClick={(e) => { e.stopPropagation(); onEdit(pdca) }}>
                  <Edit />
                </IconButton>
                <IconButton onClick={(e) => { e.stopPropagation(); onDelete(pdca) }}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                Nenhum ciclo PDCA encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
