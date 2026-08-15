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
import {
  Station,
  StationSortBy,
  SortOrder,
  STATION_COLUMNS,
  mobileCarrierColors,
} from '../../pages/stations/stationsTypes'

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
    <Paper elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden' }}>
      <TableContainer>
        <Table size="small" sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow
              sx={{
                '& th': {
                  bgcolor: 'rgba(0, 21, 68, 0.05)',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  borderBottom: '1px solid rgba(0,0,0,0.08)',
                },
              }}
            >
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
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stations.map((station) => (
              <TableRow
                key={station.id}
                hover
                onClick={() => onOpen(station)}
                sx={{
                  cursor: 'pointer',
                  '&:nth-of-type(even)': { bgcolor: 'rgba(0,0,0,0.015)' },
                  '&:hover': { bgcolor: 'rgba(0, 21, 68, 0.04) !important' },
                }}
              >
                <TableCell sx={{ fontWeight: 600 }}>{station.siteId}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>
                  {station.mobileCarrier === 'TIM' ? station.endId : '-'}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    variant="outlined"
                    label={station.mobileCarrier || '-'}
                    color={mobileCarrierColors[station.mobileCarrier || 'Outras']}
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell
                  sx={{
                    color: 'text.secondary',
                    maxWidth: 280,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {station.address || '-'}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={station.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    color={station.status === 'ativo' ? 'success' : 'default'}
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); onEdit(station) }}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onDelete(station) }}>
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {stations.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                  Nenhuma estação encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
