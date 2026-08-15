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
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
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
            <TableRow key={event.id} hover>
              <TableCell sx={{ fontWeight: 600 }}>{event.title}</TableCell>
              <TableCell>{formatDateTime(event.startAt)}</TableCell>
              <TableCell>{formatDateTime(event.endAt)}</TableCell>
              <TableCell>{event.client || '-'}</TableCell>
              <TableCell>{event.location || '-'}</TableCell>
              <TableCell>{event.assignedTo || '-'}</TableCell>
              <TableCell>
                <ScheduleStatusChip status={event.status} />
              </TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                <IconButton onClick={() => onEdit(event)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => onDelete(event)}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {events.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} align="center">
                Nenhum agendamento encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
