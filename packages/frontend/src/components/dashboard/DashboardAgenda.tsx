import { useState, useEffect } from 'react'
import { Box, Divider, IconButton, List, ListItem, ListItemText, Paper, Typography } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { normalizeList } from '../../utils/list'

interface AgendaItem {
  id: number
  title: string
  startAt?: string | null
}

const toDateString = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const dayLabel = (value: string) => {
  const date = new Date(`${value}T00:00:00`)
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })
}

const timeLabel = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

const shiftDays = (date: Date, delta: number) => {
  const d = new Date(date)
  d.setDate(d.getDate() + delta)
  return d
}

export default function DashboardAgenda() {
  const navigate = useNavigate()
  const [items, setItems] = useState<AgendaItem[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())

  useEffect(() => {
    let cancelled = false
    api
      .get('/schedule', {
        params: {
          from: toDateString(shiftDays(new Date(), -7)),
          to: toDateString(shiftDays(new Date(), 30)),
          limit: 500,
          sortBy: 'startAt',
          sortOrder: 'ASC',
        },
      })
      .then((res) => {
        if (cancelled) return
        setItems(normalizeList<AgendaItem>(res.data).data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const selectedKey = toDateString(selectedDate)
  const dayItems = items.filter((item) => (item.startAt ? item.startAt.slice(0, 10) === selectedKey : false))
  const isToday = selectedKey === toDateString(new Date())

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 2,
        border: '1px solid rgba(0,0,0,0.08)',
        bgcolor: 'background.paper',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'rgb(0, 21, 68)' }}>
        Agenda
      </Typography>
      <Divider sx={{ my: 1.5 }} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
        <IconButton size="small" onClick={() => setSelectedDate((prev) => shiftDays(prev, -1))}>
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
        <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
            {dayLabel(selectedKey)}
          </Typography>
          {!isToday && (
            <Typography
              variant="caption"
              sx={{ color: 'rgb(0, 21, 68)', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              onClick={() => setSelectedDate(new Date())}
            >
              Ir para hoje
            </Typography>
          )}
        </Box>
        <IconButton size="small" onClick={() => setSelectedDate((prev) => shiftDays(prev, 1))}>
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </Box>

      {dayItems.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          Nenhum agendamento para este dia.
        </Typography>
      ) : (
        <List dense disablePadding>
          {dayItems.slice(0, 10).map((item) => (
            <ListItem
              key={item.id}
              sx={{ px: 0, py: 0.25, cursor: 'pointer', borderRadius: 1, '&:hover': { bgcolor: 'rgba(0, 21, 68, 0.04)' } }}
              onClick={() => navigate(`/schedule?edit=${item.id}`)}
            >
              <ListItemText
                primary={item.title}
                secondary={timeLabel(item.startAt) || undefined}
                primaryTypographyProps={{ sx: { fontSize: '0.875rem', fontWeight: 500 } }}
                secondaryTypographyProps={{ sx: { fontSize: '0.75rem' } }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  )
}
