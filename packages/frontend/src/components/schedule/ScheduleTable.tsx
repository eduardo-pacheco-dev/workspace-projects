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
import { ScheduleEvent, ScheduleSortBy, SortOrder, SCHEDULE_COLUMNS, formatDateTime } from '../../pages/schedule/scheduleTypes'
import ScheduleStatusChip from './ScheduleStatusChip'

interface ScheduleTableProps {
  events: ScheduleEvent[]
  sortBy: ScheduleSortBy
  sortOrder: SortOrder
  onSort: (col: ScheduleSortBy) => void
  onEdit: (event: ScheduleEvent) => void
  onDelete: (event: ScheduleEvent) => void
}

export default function ScheduleTable({ events, sortBy, sortOrder, onSort, onEdit, onDelete }: ScheduleTableProps) {
  return (
    <Paper elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden' }}>
      <TableContainer>
        <Table size="small" sx={{ minWidth: 800 }}>
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
              {SCHEDULE_COLUMNS.map((col) => (
                <TableCell key={col.id}>
                  {col.sortable === false ? (
                    col.label
                  ) : (
                    <TableSortLabel
                      active={sortBy === col.id}
                      direction={sortBy === col.id ? (sortOrder.toLowerCase() as 'asc' | 'desc') : 'asc'}
                      onClick={() => onSort(col.id as ScheduleSortBy)}
                    >
                      {col.label}
                    </TableSortLabel>
                  )}
                </TableCell>
              ))}
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => (
              <TableRow
                key={event.id}
                hover
                sx={{
                  '&:nth-of-type(even)': { bgcolor: 'rgba(0,0,0,0.015)' },
                  '&:hover': { bgcolor: 'rgba(0, 21, 68, 0.04) !important' },
                }}
              >
                <TableCell sx={{ fontWeight: 600 }}>{event.title}</TableCell>
                <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>{formatDateTime(event.startAt)}</TableCell>
                <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>{formatDateTime(event.endAt)}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{event.client || '-'}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{event.location || '-'}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{event.assignedTo || '-'}</TableCell>
                <TableCell><ScheduleStatusChip status={event.status} /></TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <IconButton size="small" color="primary" onClick={() => onEdit(event)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => onDelete(event)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {events.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                  Nenhum agendamento encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
