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
import { ServiceOrder, ServiceOrderSortBy, SortOrder, SERVICE_ORDER_COLUMNS } from '../../pages/service-orders/serviceOrdersTypes'
import ServiceOrderStatusChip from './ServiceOrderStatusChip'

interface ServiceOrdersTableProps {
  orders: ServiceOrder[]
  sortBy: ServiceOrderSortBy
  sortOrder: SortOrder
  onSort: (col: ServiceOrderSortBy) => void
  onOpen: (order: ServiceOrder) => void
  onEdit: (order: ServiceOrder) => void
  onDelete: (order: ServiceOrder) => void
}

export default function ServiceOrdersTable({
  orders,
  sortBy,
  sortOrder,
  onSort,
  onOpen,
  onEdit,
  onDelete,
}: ServiceOrdersTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {SERVICE_ORDER_COLUMNS.map((col) => (
              <TableCell key={col.id}>
                {col.sortable === false ? (
                  col.label
                ) : (
                  <TableSortLabel
                    active={sortBy === col.id}
                    direction={sortBy === col.id ? (sortOrder.toLowerCase() as 'asc' | 'desc') : 'asc'}
                    onClick={() => onSort(col.id as ServiceOrderSortBy)}
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
          {orders.map((order) => (
            <TableRow key={order.id} hover sx={{ cursor: 'pointer' }} onClick={() => onOpen(order)}>
              <TableCell>{order.numero}</TableCell>
              <TableCell>{order.cliente}</TableCell>
              <TableCell>{order.descricao || '-'}</TableCell>
              <TableCell>{order.siteId || '-'}</TableCell>
              <TableCell>{order.operadora || '-'}</TableCell>
              <TableCell>{order.dataInicio || '-'}</TableCell>
              <TableCell>
                <ServiceOrderStatusChip status={order.status} />
              </TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                <IconButton onClick={(e) => { e.stopPropagation(); onEdit(order) }}>
                  <Edit />
                </IconButton>
                <IconButton onClick={(e) => { e.stopPropagation(); onDelete(order) }}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} align="center">
                Nenhuma ordem de serviço encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
