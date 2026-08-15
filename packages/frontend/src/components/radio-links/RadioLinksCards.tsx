import { Avatar, Box, Button, Card, CardActions, CardContent, Grid, Paper, Typography } from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'
import { RadioLink } from '../../pages/radio-links/radioLinksTypes'
import { getInitials } from '../../utils/format'
import LinkStatusChip from './LinkStatusChip'

interface RadioLinksCardsProps {
  radioLinks: RadioLink[]
  onOpen: (link: RadioLink) => void
  onEdit: (link: RadioLink) => void
  onDelete: (link: RadioLink) => void
}

export default function RadioLinksCards({ radioLinks, onOpen, onEdit, onDelete }: RadioLinksCardsProps) {
  if (radioLinks.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
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
            sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
            onClick={() => onOpen(link)}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44, fontSize: 18 }}>
                  {getInitials(link.nome)}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
                    {link.nome}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {link.frequencia || 'Sem frequência'}
                    {link.capacidade ? ` · ${link.capacidade}` : ''}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mb: 1 }}>
                <LinkStatusChip status={link.status} />
              </Box>
              <Typography variant="body2" color="text.secondary" noWrap>
                Estação A: {link.siteIdA || '-'}
                {link.endIdA ? ` · ${link.endIdA}` : ''}
                {link.operadoraA ? ` (${link.operadoraA})` : ''}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                Estação B: {link.siteIdB || '-'}
                {link.endIdB ? ` · ${link.endIdB}` : ''}
                {link.operadoraB ? ` (${link.operadoraB})` : ''}
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2, justifyContent: 'flex-end' }}>
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
