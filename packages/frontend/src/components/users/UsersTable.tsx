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
import { User, SortBy, SortOrder, USER_COLUMNS } from '../../pages/users/usersTypes'
import UserStatusChip from './UserStatusChip'
import RoleChip from './RoleChip'

interface UsersTableProps {
  users: User[]
  sortBy: SortBy
  sortOrder: SortOrder
  onSort: (col: SortBy) => void
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  isSelf: (user: User) => boolean
}

export default function UsersTable({ users, sortBy, sortOrder, onSort, onEdit, onDelete, isSelf }: UsersTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {USER_COLUMNS.map((col) => (
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
            <TableCell>Perfil</TableCell>
            <TableCell>Empresa</TableCell>
            <TableCell align="center">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} hover>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.lastName || '-'}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone || '-'}</TableCell>
              <TableCell>
                <UserStatusChip status={user.status} />
              </TableCell>
              <TableCell>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</TableCell>
              <TableCell>
                <RoleChip role={user.role} />
              </TableCell>
              <TableCell>{user.role === 'master' ? '-' : (user.companyName || '-')}</TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
                  <IconButton onClick={() => onEdit(user)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => onDelete(user)} disabled={isSelf(user)}>
                    <Delete />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} align="center">
                Nenhum usuário encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
