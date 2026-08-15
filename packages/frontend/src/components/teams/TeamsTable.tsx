import {
  Box,
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
import { Team, SortBy, SortOrder, TEAM_COLUMNS } from '../../pages/teams/teamsTypes'
import MemberChips from './MemberChips'

interface TeamsTableProps {
  teams: Team[]
  sortBy: SortBy
  sortOrder: SortOrder
  onSort: (col: SortBy) => void
  onEdit: (team: Team) => void
  onDelete: (team: Team) => void
}

export default function TeamsTable({ teams, sortBy, sortOrder, onSort, onEdit, onDelete }: TeamsTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {TEAM_COLUMNS.map((col) => (
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
            <TableCell>Membros</TableCell>
            <TableCell align="center">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {teams.map((team) => (
            <TableRow key={team.id} hover>
              <TableCell sx={{ fontWeight: 600 }}>{team.nome}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={team.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  color={team.status === 'ativo' ? 'success' : 'default'}
                />
              </TableCell>
              <TableCell>
                <MemberChips members={team.members} />
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
                  <IconButton onClick={() => onEdit(team)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => onDelete(team)}>
                    <Delete />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
          {teams.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center">
                Nenhuma equipe encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
