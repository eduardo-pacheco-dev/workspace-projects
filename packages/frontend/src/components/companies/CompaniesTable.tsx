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
import { Company, CompanySortBy, SortOrder, COMPANY_COLUMNS } from '../../pages/companies/companiesTypes'
import CompanyStatusChip from './CompanyStatusChip'

interface CompaniesTableProps {
  companies: Company[]
  sortBy: CompanySortBy
  sortOrder: SortOrder
  onSort: (col: CompanySortBy) => void
  onOpen: (company: Company) => void
  onEdit: (company: Company) => void
  onDelete: (company: Company) => void
}

export default function CompaniesTable({
  companies,
  sortBy,
  sortOrder,
  onSort,
  onOpen,
  onEdit,
  onDelete,
}: CompaniesTableProps) {
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
              {COMPANY_COLUMNS.map((col) => (
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
            {companies.map((company) => (
              <TableRow
                key={company.id}
                hover
                onClick={() => onOpen(company)}
                sx={{
                  cursor: 'pointer',
                  '&:nth-of-type(even)': { bgcolor: 'rgba(0,0,0,0.015)' },
                  '&:hover': { bgcolor: 'rgba(0, 21, 68, 0.04) !important' },
                }}
              >
                <TableCell sx={{ fontWeight: 600 }}>{company.nome}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{company.cnpj || '-'}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{company.email || '-'}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{company.cidade || '-'}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{company.uf || '-'}</TableCell>
                <TableCell><CompanyStatusChip ativa={company.ativa} /></TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); onEdit(company) }}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onDelete(company) }}>
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {companies.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                  Nenhuma empresa encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
