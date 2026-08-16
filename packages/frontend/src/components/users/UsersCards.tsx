import { Avatar, Box, Card, CardActions, CardContent, Divider, Grid, Paper, Typography } from '@mui/material'
import { Edit, Delete, Phone, Business, DateRange, Badge } from '@mui/icons-material'
import { User } from '../../pages/users/usersTypes'
import { getInitials } from '../../utils/format'
import Button from '../ui/Button'
import UserStatusChip from './UserStatusChip'
import RoleChip from './RoleChip'

interface UsersCardsProps {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  isSelf: (user: User) => boolean
}

interface FieldProps {
  icon: React.ReactNode
  label: string
  value: string
}

function Field({ icon, label, value }: FieldProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.75 }}>
      <Box sx={{ color: 'rgb(0, 21, 68)', display: 'flex', fontSize: 18 }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            display: 'block',
            lineHeight: 1.2,
            fontSize: '0.65rem',
            textTransform: 'uppercase',
            letterSpacing: 0.6,
          }}
        >
          {label}
        </Typography>
        <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  )
}

export default function UsersCards({ users, onEdit, onDelete, isSelf }: UsersCardsProps) {
  if (users.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 5, textAlign: 'center', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2 }}>
        <Typography color="text.secondary">Nenhum usuário encontrado.</Typography>
      </Paper>
    )
  }

  return (
    <Grid container spacing={2}>
      {users.map((user) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={user.id}>
          <Card
            variant="outlined"
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              overflow: 'hidden',
              transition: 'border-color 0.15s ease',
              '&:hover': { borderColor: 'rgba(0, 21, 68, 0.35)' },
            }}
          >
            <Box sx={{ bgcolor: 'rgb(0, 21, 68)', px: 2, py: 1.75, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  bgcolor: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  width: 42,
                  height: 42,
                  fontSize: 16,
                  fontWeight: 700,
                }}
              >
                {getInitials(user.name)}
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography noWrap sx={{ fontWeight: 700, color: 'white', fontSize: '1rem' }}>
                  {user.name} {user.lastName || ''}
                </Typography>
                <Typography noWrap variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  {user.email}
                </Typography>
              </Box>
              <UserStatusChip status={user.status} />
            </Box>

            <CardContent sx={{ flexGrow: 1, pt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.75 }}>
                <Box sx={{ color: 'rgb(0, 21, 68)', display: 'flex', fontSize: 18 }}>
                  <Badge fontSize="inherit" />
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      display: 'block',
                      lineHeight: 1.2,
                      fontSize: '0.65rem',
                      textTransform: 'uppercase',
                      letterSpacing: 0.6,
                    }}
                  >
                    Perfil
                  </Typography>
                  <RoleChip role={user.role} />
                </Box>
              </Box>
              <Divider sx={{ my: 0.5 }} />
              <Field icon={<Phone fontSize="inherit" />} label="Telefone" value={user.phone || '-'} />
              <Divider sx={{ my: 0.5 }} />
              <Field
                icon={<Business fontSize="inherit" />}
                label="Empresa"
                value={user.role === 'master' ? '-' : (user.companyName || '-')}
              />
              <Divider sx={{ my: 0.5 }} />
              <Field
                icon={<DateRange fontSize="inherit" />}
                label="Criado em"
                value={new Date(user.createdAt).toLocaleDateString('pt-BR')}
              />
            </CardContent>

            <CardActions sx={{ px: 2, pb: 2, justifyContent: 'flex-end', borderTop: '1px solid rgba(0,0,0,0.06)', pt: 1.5 }}>
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
