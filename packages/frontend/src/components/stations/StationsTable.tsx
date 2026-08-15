import {
  Chip,
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
import { Station, StationSortBy, SortOrder, STATION_COLUMNS } from '../../pages/stations/stationsTypes'

interface StationsTableProps {
  stations: Station[]
  sortBy: StationSortBy
  sortOrder: SortOrder
  onSort: (col: StationSortBy) => void
  onOpen: (station: Station) => void
  onEdit: (station: Station) => void
  onDelete: (station: Station) => void
}

export default function StationsTable({
  stations,
  sortBy,
  sortOrder,
  onSort,
  onOpen,
  onEdit,
  onDelete,
}: StationsTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {STATION_COLUMNS.map((col) => (
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
          {stations.map((station) => (
            <TableRow
              key={station.id}
              hover
              onClick={() => onOpen(station)}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell>{station.siteId}</TableCell>
              <TableCell>{station.mobileCarrier === 'TIM' ? station.endId : '-'}</TableCell>
              <TableCell>{station.mobileCarrier || '-'}</TableCell>
              <TableCell>{station.address || '-'}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={station.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  color={station.status === 'ativo' ? 'success' : 'default'}
                />
              </TableCell>
              <TableCell>
                <IconButton onClick={(e) => { e.stopPropagation(); onEdit(station) }}>
                  <Edit />
                </IconButton>
                <IconButton onClick={(e) => { e.stopPropagation(); onDelete(station) }}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {stations.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} align="center">
                Nenhuma estação encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
