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
import { RadioLink, RadioLinkSortBy, SortOrder, RADIO_LINK_COLUMNS } from '../../pages/radio-links/radioLinksTypes'
import LinkStatusChip from './LinkStatusChip'

interface RadioLinksTableProps {
  radioLinks: RadioLink[]
  sortBy: RadioLinkSortBy
  sortOrder: SortOrder
  onSort: (col: RadioLinkSortBy) => void
  onOpen: (link: RadioLink) => void
  onEdit: (link: RadioLink) => void
  onDelete: (link: RadioLink) => void
}

export default function RadioLinksTable({
  radioLinks,
  sortBy,
  sortOrder,
  onSort,
  onOpen,
  onEdit,
  onDelete,
}: RadioLinksTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {RADIO_LINK_COLUMNS.map((col) => (
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
          {radioLinks.map((link) => (
            <TableRow key={link.id} hover onClick={() => onOpen(link)} sx={{ cursor: 'pointer' }}>
              <TableCell>{link.nome}</TableCell>
              <TableCell>{link.frequencia || '-'}</TableCell>
              <TableCell>{link.capacidade || '-'}</TableCell>
              <TableCell>{link.siteIdA || '-'}</TableCell>
              <TableCell>{link.siteIdB || '-'}</TableCell>
              <TableCell>
                <LinkStatusChip status={link.status} />
              </TableCell>
              <TableCell>
                <IconButton onClick={(e) => { e.stopPropagation(); onEdit(link) }}>
                  <Edit />
                </IconButton>
                <IconButton onClick={(e) => { e.stopPropagation(); onDelete(link) }}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {radioLinks.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} align="center">
                Nenhum enlace de rádio encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
