import { Avatar, Box, Chip, Typography } from '@mui/material'
import { UserProfile } from '../../pages/users/usersTypes'
import { getInitials } from '../../utils/format'

interface ProfileHeaderProps {
  user: UserProfile | null
  fullName: string
}

export default function ProfileHeader({ user, fullName }: ProfileHeaderProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
      <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main', fontSize: 26 }}>
        {getInitials(fullName)}
      </Avatar>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>{fullName}</Typography>
        <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
        {user && (
          <Chip
            size="small"
            sx={{ mt: 0.5 }}
            label={user.status === 'active' ? 'Ativo' : 'Inativo'}
            color={user.status === 'active' ? 'success' : 'default'}
          />
        )}
      </Box>
    </Box>
  )
}
