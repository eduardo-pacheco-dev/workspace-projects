import { Avatar, Box, Chip, Stack, Typography } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import { Collaborator, availMap, getCollaboratorName } from '../../pages/collaborators/collaboratorsTypes'
import CollaboratorStatusChip from './CollaboratorStatusChip'
import CollaboratorTypeChip from './CollaboratorTypeChip'

interface CollaboratorHeaderCardProps {
  collaborator: Collaborator
}

export default function CollaboratorHeaderCard({ collaborator }: CollaboratorHeaderCardProps) {
  const isFreelancer = collaborator.isFreelancer
  const name = getCollaboratorName(collaborator)
  const availInfo = availMap[collaborator.availability || ''] || { label: collaborator.availability || '-', color: 'warning' as const }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3, flexWrap: 'wrap' }}>
      <Avatar src={collaborator.foto || undefined} sx={{ width: 88, height: 88, bgcolor: 'primary.main', fontSize: 32 }}>
        <PersonIcon />
      </Avatar>
      <Box sx={{ flexGrow: 1, minWidth: 200 }}>
        <Typography variant="h4">{name}</Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
          <CollaboratorTypeChip isFreelancer={isFreelancer} />
          <CollaboratorStatusChip status={collaborator.status} />
          {isFreelancer && <Chip size="small" label={availInfo.label} color={availInfo.color} />}
        </Stack>
      </Box>
      <Box sx={{ textAlign: 'right' }}>
        {collaborator.codigo && (
          <Typography variant="subtitle2" color="text.secondary">Código</Typography>
        )}
        <Typography variant="body1" sx={{ fontWeight: 600 }}>{collaborator.codigo || '-'}</Typography>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>Empresa</Typography>
        <Typography variant="body1">{collaborator.company?.nome || '-'}</Typography>
      </Box>
    </Box>
  )
}
