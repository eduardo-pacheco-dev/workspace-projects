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
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
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
            <TableRow key={company.id} hover onClick={() => onOpen(company)} sx={{ cursor: 'pointer' }}>
              <TableCell sx={{ fontWeight: 600 }}>{company.nome}</TableCell>
              <TableCell>{company.cnpj || '-'}</TableCell>
              <TableCell>{company.email || '-'}</TableCell>
              <TableCell>{company.cidade || '-'}</TableCell>
              <TableCell>{company.uf || '-'}</TableCell>
              <TableCell>
                <CompanyStatusChip ativa={company.ativa} />
              </TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                <IconButton onClick={(e) => { e.stopPropagation(); onEdit(company) }}>
                  <Edit />
                </IconButton>
                <IconButton onClick={(e) => { e.stopPropagation(); onDelete(company) }}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {companies.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} align="center">
                Nenhuma empresa encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
