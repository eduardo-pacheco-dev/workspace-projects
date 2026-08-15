import {
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material'
import { Delete } from '@mui/icons-material'
import { MsProjectSummary, formatDate } from '../../pages/ms-project/msProjectTypes'
import MsProjectStatusChip from './MsProjectStatusChip'

interface MsProjectTableProps {
  plans: MsProjectSummary[]
  onOpen: (plan: MsProjectSummary) => void
  onDelete: (plan: MsProjectSummary) => void
}

export default function MsProjectTable({ plans, onOpen, onDelete }: MsProjectTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Plano</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Início</TableCell>
            <TableCell>Término</TableCell>
            <TableCell>Duração (dias úteis)</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan.id} hover onClick={() => onOpen(plan)} sx={{ cursor: 'pointer' }}>
              <TableCell sx={{ fontWeight: 600 }}>
                {plan.name}
                {plan.status === 'behind' && (
                  <Chip size="small" color="error" label="atrasado" sx={{ ml: 1 }} />
                )}
              </TableCell>
              <TableCell>
                <MsProjectStatusChip status={plan.status} />
              </TableCell>
              <TableCell>{formatDate(plan.startDate)}</TableCell>
              <TableCell>{formatDate(plan.endDate)}</TableCell>
              <TableCell>{plan.durationDays ?? '-'}</TableCell>
              <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                <Tooltip title="Excluir plano">
                  <IconButton onClick={() => onDelete(plan)}>
                    <Delete />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
          {plans.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center">
                Nenhum plano encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
