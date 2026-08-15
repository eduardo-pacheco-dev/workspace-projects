import { Avatar, Box, Button, Card, CardActions, CardContent, Grid, Paper, Typography } from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'
import { User } from '../../pages/users/usersTypes'
import { getInitials } from '../../utils/format'
import UserStatusChip from './UserStatusChip'
import RoleChip from './RoleChip'

interface UsersCardsProps {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  isSelf: (user: User) => boolean
}

export default function UsersCards({ users, onEdit, onDelete, isSelf }: UsersCardsProps) {
  if (users.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">Nenhum usuário encontrado.</Typography>
      </Paper>
    )
  }

  return (
    <Grid container spacing={2}>
      {users.map((user) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={user.id}>
          <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44, fontSize: 18 }}>
                  {getInitials(user.name)}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
                    {user.name} {user.lastName || ''}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {user.email}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                <RoleChip role={user.role} />
                <UserStatusChip status={user.status} />
              </Box>
              <Typography variant="body2" color="text.secondary" noWrap>
                Telefone: {user.phone || '-'}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                Empresa: {user.role === 'master' ? '-' : (user.companyName || '-')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Criado em: {new Date(user.createdAt).toLocaleDateString('pt-BR')}
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2, justifyContent: 'flex-end' }}>
              <Button size="small" startIcon={<Edit />} onClick={() => onEdit(user)}>
                Editar
              </Button>
              <Button
                size="small"
                color="error"
                startIcon={<Delete />}
                onClick={() => onDelete(user)}
                disabled={isSelf(user)}
              >
                Excluir
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}
