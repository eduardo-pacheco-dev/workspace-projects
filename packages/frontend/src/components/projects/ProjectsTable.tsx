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
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
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
            <TableRow key={project.id} hover onClick={() => onOpen(project)} sx={{ cursor: 'pointer' }}>
              <TableCell>{project.nome}</TableCell>
              <TableCell>{project.codigo || '-'}</TableCell>
              <TableCell>{project.cliente || '-'}</TableCell>
              <TableCell>{formatProjectDate(project.dataInicio)}</TableCell>
              <TableCell>{terminoLabel(project.dataFim)}</TableCell>
              <TableCell>
                <ProjectStatusChip status={project.status} />
              </TableCell>
              <TableCell>{companyLabel(project)}</TableCell>
              <TableCell>{project.responsavel || '-'}</TableCell>
              <TableCell align="right">
                <IconButton onClick={(e) => { e.stopPropagation(); onEdit(project) }}>
                  <Edit />
                </IconButton>
                <IconButton onClick={(e) => { e.stopPropagation(); onDelete(project) }}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {projects.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} align="center">
                Nenhum projeto encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
