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
import { Task, TaskSortBy, SortOrder, TASK_COLUMNS, formatDateTime } from '../../pages/tasks/tasksTypes'
import TaskStatusChip from './TaskStatusChip'
import TaskPriorityChip from './TaskPriorityChip'

interface TasksTableProps {
  tasks: Task[]
  sortBy: TaskSortBy
  sortOrder: SortOrder
  onSort: (col: TaskSortBy) => void
  onOpen: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export default function TasksTable({ tasks, sortBy, sortOrder, onSort, onOpen, onEdit, onDelete }: TasksTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {TASK_COLUMNS.map((col) => (
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
          {tasks.map((task) => (
            <TableRow key={task.id} hover sx={{ cursor: 'pointer' }} onClick={() => onOpen(task)}>
              <TableCell sx={{ fontWeight: 600 }}>{task.title}</TableCell>
              <TableCell>
                <TaskStatusChip status={task.status} />
              </TableCell>
              <TableCell>
                <TaskPriorityChip priority={task.priority} />
              </TableCell>
              <TableCell>{formatDateTime(task.dueAt)}</TableCell>
              <TableCell>{task.project || '-'}</TableCell>
              <TableCell>{task.client || '-'}</TableCell>
              <TableCell>{task.assignedTo || '-'}</TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                <IconButton onClick={(e) => { e.stopPropagation(); onEdit(task) }}>
                  <Edit />
                </IconButton>
                <IconButton onClick={(e) => { e.stopPropagation(); onDelete(task) }}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {tasks.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} align="center">
                Nenhuma tarefa encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
