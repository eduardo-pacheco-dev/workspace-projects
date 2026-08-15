import { Box, Button, Card, CardContent, Typography } from '@mui/material'
import CorporateFareIcon from '@mui/icons-material/CorporateFare'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { Company } from '../../pages/companies/companiesTypes'
import CompanyStatusChip from './CompanyStatusChip'

interface CompanyHeaderCardProps {
  company: Company
  onEdit: () => void
  onDelete: () => void
}

export default function CompanyHeaderCard({ company, onEdit, onDelete }: CompanyHeaderCardProps) {
  return (
    <Card sx={{ mb: 3, bgcolor: 'rgba(21, 101, 192, 0.08)' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CorporateFareIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4">{company.nome}</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {company.cidade || 'Sem cidade'}
                {company.uf ? `/${company.uf}` : ''}
              </Typography>
            </Box>
          </Box>
          <Box>
            <Button variant="outlined" startIcon={<EditIcon />} onClick={onEdit} sx={{ mr: 1 }}>
              Editar
            </Button>
            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={onDelete}>
              Excluir
            </Button>
          </Box>
        </Box>
        <Box sx={{ mt: 2 }}>
          <CompanyStatusChip ativa={company.ativa} />
        </Box>
      </CardContent>
    </Card>
  )
}
