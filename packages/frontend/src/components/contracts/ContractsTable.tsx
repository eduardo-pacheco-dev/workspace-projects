import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'
import { Contract, formatBudget, formatContractDate } from '../../pages/contracts/contractsTypes'
import ContractStatusChip from './ContractStatusChip'

interface ContractsTableProps {
  contracts: Contract[]
  onOpen: (contract: Contract) => void
  onEdit: (contract: Contract) => void
  onDelete: (contract: Contract) => void
}

export default function ContractsTable({ contracts, onOpen, onEdit, onDelete }: ContractsTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID do Job</TableCell>
            <TableCell>ID do Freelancer</TableCell>
            <TableCell>ID do Cliente</TableCell>
            <TableCell>Orçamento Total</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Data de Início</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {contracts.map((contract) => (
            <TableRow key={contract.id} hover sx={{ cursor: 'pointer' }} onClick={() => onOpen(contract)}>
              <TableCell>{contract.jobId}</TableCell>
              <TableCell>{contract.freelancerId}</TableCell>
              <TableCell>{contract.clientId}</TableCell>
              <TableCell>{formatBudget(contract.totalBudget)}</TableCell>
              <TableCell>
                <ContractStatusChip status={contract.status} />
              </TableCell>
              <TableCell>{formatContractDate(contract.startDate)}</TableCell>
              <TableCell align="right">
                <IconButton onClick={(e) => { e.stopPropagation(); onEdit(contract) }}>
                  <Edit />
                </IconButton>
                <IconButton onClick={(e) => { e.stopPropagation(); onDelete(contract) }}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {contracts.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} align="center">
                Nenhum contrato encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
