import { Box, Button, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material'
import { ChevronLeft, ChevronRight, Today } from '@mui/icons-material'
import { ScheduleEvent, statusCalendarColors, statusLabels, toDateString, capitalize } from './scheduleTypes'
import CalendarDayCell from '../../components/schedule/CalendarDayCell'

interface ScheduleCalendarProps {
  events: ScheduleEvent[]
  month: Date
  onPrevMonth: () => void
  onNextMonth: () => void
  onToday: () => void
  onCreateEvent: (date?: string) => void
  onEditEvent: (id: number) => void
}

const weekdayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function ScheduleCalendar({
  events,
  month,
  onPrevMonth,
  onNextMonth,
  onToday,
  onCreateEvent,
  onEditEvent,
}: ScheduleCalendarProps) {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const today = toDateString(new Date())

  const firstWeekday = new Date(year, monthIndex, 1).getDay()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const trailingCount = (7 - ((firstWeekday + daysInMonth) % 7)) % 7
  const totalCells = firstWeekday + daysInMonth + trailingCount

  const cells: (Date | null)[] = []
  for (let i = 0; i < totalCells; i++) {
    const day = i - firstWeekday + 1
    cells.push(day >= 1 && day <= daysInMonth ? new Date(year, monthIndex, day) : null)
  }

  const eventsByDate = new Map<string, ScheduleEvent[]>()
  events.forEach((event) => {
    const key = event.startAt?.slice(0, 10)
    if (!key) return
    const list = eventsByDate.get(key) ?? []
    list.push(event)
    eventsByDate.set(key, list)
  })

  const monthLabel = capitalize(
    month.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
  )

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={onPrevMonth} size="small">
            <ChevronLeft />
          </IconButton>
          <Typography variant="h6" sx={{ minWidth: 200, textAlign: 'center' }}>
            {monthLabel}
          </Typography>
          <IconButton onClick={onNextMonth} size="small">
            <ChevronRight />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            {Object.entries(statusCalendarColors).map(([status, color]) => (
              <Tooltip key={status} title={statusLabels[status] || status}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: color }} />
              </Tooltip>
            ))}
          </Stack>
          <Button variant="outlined" size="small" startIcon={<Today />} onClick={onToday}>
            Hoje
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
        {weekdayLabels.map((label) => (
          <Box key={label} sx={{ textAlign: 'center', py: 0.5, fontWeight: 600, color: 'text.secondary' }}>
            <Typography variant="caption">{label}</Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
        {cells.map((day, index) => {
          if (!day) {
            return <Box key={`empty-${index}`} sx={{ minHeight: 110, borderRadius: 1 }} />
          }
          return (
            <CalendarDayCell
              key={toDateString(day)}
              day={day}
              events={eventsByDate.get(toDateString(day)) ?? []}
              isToday={toDateString(day) === today}
              onCreateEvent={(date) => onCreateEvent(date)}
              onEditEvent={onEditEvent}
            />
          )
        })}
      </Box>
    </Paper>
  )
}
