import { Avatar, Box, Card, CardActions, CardContent, Chip, Divider, Grid, Paper, Typography } from '@mui/material'
import { Edit, Delete, SettingsInputAntenna, CallMade, CallReceived } from '@mui/icons-material'
import { RadioLink, operadoraColors } from '../../pages/radio-links/radioLinksTypes'
import { getInitials } from '../../utils/format'
import Button from '../ui/Button'

interface RadioLinksCardsProps {
  radioLinks: RadioLink[]
  onOpen: (link: RadioLink) => void
  onEdit: (link: RadioLink) => void
  onDelete: (link: RadioLink) => void
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

function StationField({ icon, label, link, side }: { icon: React.ReactNode; label: string; link: RadioLink; side: 'A' | 'B' }) {
  const siteId = side === 'A' ? link.siteIdA : link.siteIdB
  const endId = side === 'A' ? link.endIdA : link.endIdB
  const operadora = side === 'A' ? link.operadoraA : link.operadoraB

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.75 }}>
      <Box sx={{ color: 'rgb(0, 21, 68)', display: 'flex', fontSize: 18 }}>{icon}</Box>
      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
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
          {siteId || '-'}
          {endId ? ` · ${endId}` : ''}
        </Typography>
      </Box>
      {operadora && (
        <Chip
          size="small"
          variant="outlined"
          label={operadora}
          color={operadoraColors[operadora] ?? 'default'}
          sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }}
        />
      )}
    </Box>
  )
}

export default function RadioLinksCards({ radioLinks, onOpen, onEdit, onDelete }: RadioLinksCardsProps) {
  if (radioLinks.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 5, textAlign: 'center', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2 }}>
        <Typography color="text.secondary">Nenhum enlace de rádio encontrado.</Typography>
      </Paper>
    )
  }

  return (
    <Grid container spacing={2}>
      {radioLinks.map((link) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={link.id}>
          <Card
            variant="outlined"
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              borderRadius: 2,
              overflow: 'hidden',
              transition: 'border-color 0.15s ease',
              '&:hover': { borderColor: 'rgba(0, 21, 68, 0.35)' },
            }}
            onClick={() => onOpen(link)}
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
                {getInitials(link.nome)}
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography noWrap sx={{ fontWeight: 700, color: 'white', fontSize: '1rem' }}>
                  {link.nome}
                </Typography>
                <Typography noWrap variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  {link.frequencia || 'Sem frequência'}
                  {link.capacidade ? ` · ${link.capacidade}` : ''}
                </Typography>
              </Box>
              <Chip
                size="small"
                label={link.status === 'ativo' ? 'Ativo' : 'Inativo'}
                color={link.status === 'ativo' ? 'success' : 'default'}
                sx={{ fontWeight: 600, bgcolor: link.status === 'ativo' ? undefined : 'rgba(255,255,255,0.85)' }}
              />
            </Box>

            <CardContent sx={{ flexGrow: 1, pt: 2 }}>
              <Field
                icon={<SettingsInputAntenna fontSize="inherit" />}
                label="Capacidade"
                value={link.capacidade || 'Não informada'}
              />
              <Divider sx={{ my: 0.5 }} />
              <StationField icon={<CallMade fontSize="inherit" />} label="Estação A" link={link} side="A" />
              <Divider sx={{ my: 0.5 }} />
              <StationField icon={<CallReceived fontSize="inherit" />} label="Estação B" link={link} side="B" />
            </CardContent>

            <CardActions sx={{ px: 2, pb: 2, justifyContent: 'flex-end', borderTop: '1px solid rgba(0,0,0,0.06)', pt: 1.5 }}>
              <Button
                size="small"
                startIcon={<Edit />}
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(link)
                }}
              >
                Editar
              </Button>
              <Button
                size="small"
                color="error"
                startIcon={<Delete />}
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(link)
                }}
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
