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
  Typography,
} from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'
import {
  RadioLink,
  RadioLinkSortBy,
  SortOrder,
  RADIO_LINK_COLUMNS,
  operadoraColors,
} from '../../pages/radio-links/radioLinksTypes'
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

function SiteCell({ siteId, operadora }: { siteId: string | null; operadora: string | null }) {
  return (
    <Box sx={{ lineHeight: 1.3 }}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>{siteId || '-'}</Typography>
      {operadora && (
        <Chip
          size="small"
          variant="outlined"
          label={operadora}
          color={operadoraColors[operadora] ?? 'default'}
          sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600, mt: 0.25 }}
        />
      )}
    </Box>
  )
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
    <Paper elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden' }}>
      <TableContainer>
        <Table size="small" sx={{ minWidth: 760 }}>
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
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {radioLinks.map((link) => (
              <TableRow
                key={link.id}
                hover
                onClick={() => onOpen(link)}
                sx={{
                  cursor: 'pointer',
                  '&:nth-of-type(even)': { bgcolor: 'rgba(0,0,0,0.015)' },
                  '&:hover': { bgcolor: 'rgba(0, 21, 68, 0.04) !important' },
                }}
              >
                <TableCell sx={{ fontWeight: 600 }}>{link.nome}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{link.frequencia || '-'}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{link.capacidade || '-'}</TableCell>
                <TableCell><SiteCell siteId={link.siteIdA} operadora={link.operadoraA} /></TableCell>
                <TableCell><SiteCell siteId={link.siteIdB} operadora={link.operadoraB} /></TableCell>
                <TableCell><LinkStatusChip status={link.status} /></TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); onEdit(link) }}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onDelete(link) }}>
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {radioLinks.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                  Nenhum enlace de rádio encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
