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
import { Client, SortBy, SortOrder, CLIENT_COLUMNS } from '../../pages/clients/clientsTypes'
import ClientStatusChip from './ClientStatusChip'

interface ClientsTableProps {
  clients: Client[]
  sortBy: SortBy
  sortOrder: SortOrder
  onSort: (col: SortBy) => void
  onOpen: (client: Client) => void
  onEdit: (client: Client) => void
  onDelete: (client: Client) => void
}

export default function ClientsTable({ clients, sortBy, sortOrder, onSort, onOpen, onEdit, onDelete }: ClientsTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {CLIENT_COLUMNS.map((col) => (
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
          {clients.map((client) => (
            <TableRow key={client.id} hover onClick={() => onOpen(client)} sx={{ cursor: 'pointer' }}>
              <TableCell>{client.nome}</TableCell>
              <TableCell>{client.documento || '-'}</TableCell>
              <TableCell>{client.email || '-'}</TableCell>
              <TableCell>{client.telefone || '-'}</TableCell>
              <TableCell>
                {client.cidade || '-'}
                {client.uf ? `/${client.uf}` : ''}
              </TableCell>
              <TableCell>
                <ClientStatusChip status={client.status} />
              </TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                <IconButton onClick={(e) => { e.stopPropagation(); onEdit(client) }}>
                  <Edit />
                </IconButton>
                <IconButton onClick={(e) => { e.stopPropagation(); onDelete(client) }}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {clients.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} align="center">
                Nenhum cliente encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
