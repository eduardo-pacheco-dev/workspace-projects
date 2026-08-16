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
import { Project, ProjectSortBy, SortOrder, PROJECT_COLUMNS, formatProjectDate, companyLabel, terminoLabel } from '../../pages/projects/projectsTypes'
import ProjectStatusChip from './ProjectStatusChip'

interface ProjectsTableProps {
  projects: Project[]
  sortBy: ProjectSortBy
  sortOrder: SortOrder
  onSort: (col: ProjectSortBy) => void
  onOpen: (project: Project) => void
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

export default function ProjectsTable({
  projects,
  sortBy,
  sortOrder,
  onSort,
  onOpen,
  onEdit,
  onDelete,
}: ProjectsTableProps) {
  return (
    <Paper elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden' }}>
      <TableContainer>
        <Table size="small" sx={{ minWidth: 900 }}>
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
              {PROJECT_COLUMNS.map((col) => (
                <TableCell key={col.id}>
                  {col.sortable === false ? (
                    col.label
                  ) : (
                    <TableSortLabel
                      active={sortBy === col.id}
                      direction={sortBy === col.id ? (sortOrder.toLowerCase() as 'asc' | 'desc') : 'asc'}
                      onClick={() => onSort(col.id as ProjectSortBy)}
                    >
                      {col.label}
                    </TableSortLabel>
                  )}
                </TableCell>
              ))}
              <TableCell>Empresa</TableCell>
              <TableCell>Responsável</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => (
              <TableRow
                key={project.id}
                hover
                onClick={() => onOpen(project)}
                sx={{
                  cursor: 'pointer',
                  '&:nth-of-type(even)': { bgcolor: 'rgba(0,0,0,0.015)' },
                  '&:hover': { bgcolor: 'rgba(0, 21, 68, 0.04) !important' },
                }}
              >
                <TableCell sx={{ fontWeight: 600 }}>{project.nome}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{project.codigo || '-'}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{project.cliente || '-'}</TableCell>
                <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>{formatProjectDate(project.dataInicio)}</TableCell>
                <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>{terminoLabel(project.dataFim)}</TableCell>
                <TableCell><ProjectStatusChip status={project.status} /></TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{companyLabel(project)}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{project.responsavel || '-'}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); onEdit(project) }}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onDelete(project) }}>
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {projects.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                  Nenhum projeto encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
