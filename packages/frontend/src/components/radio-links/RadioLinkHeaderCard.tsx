import { Avatar, Box, Chip, Typography } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import Button from '../ui/Button'
import { RadioLink } from '../../pages/radio-links/radioLinksTypes'
import { getInitials } from '../../utils/format'

interface RadioLinkHeaderCardProps {
  radioLink: RadioLink
  onEdit: () => void
  onDelete: () => void
}

export default function RadioLinkHeaderCard({ radioLink, onEdit, onDelete }: RadioLinkHeaderCardProps) {
  const isActive = radioLink.status === 'ativo'

  return (
    <Box
      sx={{
        bgcolor: 'rgb(0, 21, 68)',
        borderRadius: 2,
        p: 3,
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
        <Avatar
          sx={{
            bgcolor: 'rgba(255,255,255,0.12)',
            color: 'white',
            width: 56,
            height: 56,
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          {getInitials(radioLink.nome)}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
            {radioLink.nome}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
            <Chip
              size="small"
              label={isActive ? 'Ativo' : 'Inativo'}
              sx={{ fontWeight: 600, bgcolor: isActive ? 'rgba(46, 160, 67, 0.9)' : 'rgba(255,255,255,0.85)' }}
            />
            <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {radioLink.frequencia || 'Sem frequência'}
              {radioLink.capacidade ? ` · ${radioLink.capacidade}` : ''}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<EditIcon />}
          onClick={onEdit}
          sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.12)', borderColor: 'white' } }}
        >
          Editar
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={onDelete}
          sx={{
            color: 'rgba(255,255,255,0.9)',
            borderColor: 'rgba(255,255,255,0.4)',
            '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.9)', color: 'white', borderColor: 'white' },
          }}
        >
          Excluir
        </Button>
      </Box>
    </Box>
  )
}
