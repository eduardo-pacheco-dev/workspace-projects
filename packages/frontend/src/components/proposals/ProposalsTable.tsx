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
import { Proposal, formatRate } from '../../pages/proposals/proposalsTypes'
import ProposalStatusChip from './ProposalStatusChip'

interface ProposalsTableProps {
  proposals: Proposal[]
  onOpen: (proposal: Proposal) => void
  onEdit: (proposal: Proposal) => void
  onDelete: (proposal: Proposal) => void
}

export default function ProposalsTable({ proposals, onOpen, onEdit, onDelete }: ProposalsTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID do Job</TableCell>
            <TableCell>ID do Freelancer</TableCell>
            <TableCell>Taxa Proposta</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {proposals.map((proposal) => (
            <TableRow key={proposal.id} hover sx={{ cursor: 'pointer' }} onClick={() => onOpen(proposal)}>
              <TableCell>{proposal.jobId}</TableCell>
              <TableCell>{proposal.freelancerId}</TableCell>
              <TableCell>{formatRate(proposal.proposedRate)}</TableCell>
              <TableCell>
                <ProposalStatusChip status={proposal.status} />
              </TableCell>
              <TableCell align="right">
                <IconButton onClick={(e) => { e.stopPropagation(); onEdit(proposal) }}>
                  <Edit />
                </IconButton>
                <IconButton onClick={(e) => { e.stopPropagation(); onDelete(proposal) }}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {proposals.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                Nenhuma proposta encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
