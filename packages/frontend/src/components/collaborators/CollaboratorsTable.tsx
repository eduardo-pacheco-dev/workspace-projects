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
import { Collaborator, SortBy, SortOrder, COLLABORATOR_COLUMNS } from '../../pages/collaborators/collaboratorsTypes'
import CollaboratorStatusChip from './CollaboratorStatusChip'
import CollaboratorTypeChip from './CollaboratorTypeChip'

interface CollaboratorsTableProps {
  collaborators: Collaborator[]
  sortBy: SortBy
  sortOrder: SortOrder
  isAllList: boolean
  showCompany: boolean
  onSort: (col: SortBy) => void
  onOpen: (collaborator: Collaborator) => void
  onEdit: (collaborator: Collaborator) => void
  onDelete: (collaborator: Collaborator) => void
}

export default function CollaboratorsTable({
  collaborators,
  sortBy,
  sortOrder,
  isAllList,
  showCompany,
  onSort,
  onOpen,
  onEdit,
  onDelete,
}: CollaboratorsTableProps) {
  const colSpan = COLLABORATOR_COLUMNS.length + (showCompany ? 1 : 0) + (isAllList ? 1 : 0) + 1

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {COLLABORATOR_COLUMNS.map((col) => (
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
            {isAllList && <TableCell>Tipo</TableCell>}
            {showCompany && <TableCell>Empresa</TableCell>}
            <TableCell align="center">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {collaborators.map((collaborator) => (
            <TableRow key={collaborator.id} hover sx={{ cursor: 'pointer' }} onClick={() => onOpen(collaborator)}>
              <TableCell>{collaborator.codigo || '-'}</TableCell>
              <TableCell>{collaborator.nome}</TableCell>
              <TableCell>{collaborator.cpf || '-'}</TableCell>
              <TableCell>{collaborator.cargo || '-'}</TableCell>
              <TableCell>{collaborator.email || '-'}</TableCell>
              <TableCell>{collaborator.telefone || '-'}</TableCell>
              <TableCell>
                <CollaboratorStatusChip status={collaborator.status} />
              </TableCell>
              {isAllList && (
                <TableCell>
                  <CollaboratorTypeChip isFreelancer={collaborator.isFreelancer} />
                </TableCell>
              )}
              {showCompany && <TableCell>{collaborator.company?.nome || '-'}</TableCell>}
              <TableCell align="center">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
                  <IconButton onClick={(e) => { e.stopPropagation(); onEdit(collaborator) }}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={(e) => { e.stopPropagation(); onDelete(collaborator) }}>
                    <Delete />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
          {collaborators.length === 0 && (
            <TableRow>
              <TableCell colSpan={colSpan} align="center">
                Nenhum registro encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
