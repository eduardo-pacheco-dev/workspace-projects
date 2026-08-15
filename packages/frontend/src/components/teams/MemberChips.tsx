import { Chip, Stack, Typography } from '@mui/material'
import { TeamMember, getMemberName } from '../../pages/teams/teamsTypes'

const MAX_VISIBLE_MEMBERS = 4

export default function MemberChips({ members }: { members: TeamMember[] }) {
  if (!members?.length) {
    return <Typography variant="body2" color="text.secondary">Sem membros</Typography>
  }

  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {members.slice(0, MAX_VISIBLE_MEMBERS).map((member) => {
        const collaborator = member.collaborator
        return (
          <Chip
            key={member.id}
            size="small"
            label={getMemberName(collaborator, member.collaboratorId)}
            color={collaborator?.isFreelancer ? 'primary' : 'default'}
            variant="outlined"
          />
        )
      })}
      {members.length > MAX_VISIBLE_MEMBERS && (
        <Chip size="small" label={`+${members.length - MAX_VISIBLE_MEMBERS}`} variant="outlined" />
      )}
    </Stack>
  )
}
