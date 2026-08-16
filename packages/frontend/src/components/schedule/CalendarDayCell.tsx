import { Box, Chip, Tooltip, Typography } from '@mui/material'
import { ScheduleEvent, statusCalendarColors, statusLabels, toDateString } from '../../pages/schedule/scheduleTypes'

interface CalendarDayCellProps {
  day: Date
  events: ScheduleEvent[]
  isToday: boolean
  onCreateEvent: (date: string) => void
  onEditEvent: (id: number) => void
}

const MAX_VISIBLE_EVENTS = 3

export default function CalendarDayCell({ day, events, isToday, onCreateEvent, onEditEvent }: CalendarDayCellProps) {
  const dateStr = toDateString(day)
  const visible = events.slice(0, MAX_VISIBLE_EVENTS)
  const extra = events.length - visible.length

  return (
    <Box
      onClick={() => onCreateEvent(dateStr)}
      sx={{
        minHeight: 110,
        border: '1px solid rgba(0,0,0,0.12)',
        borderRadius: 1,
        p: 0.5,
        cursor: 'pointer',
        bgcolor: isToday ? 'rgb(0, 21, 68)' : 'background.paper',
        color: isToday ? 'common.white' : 'text.primary',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.25,
        '&:hover': { bgcolor: isToday ? 'rgba(0, 21, 68, 0.88)' : 'action.hover' },
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        {day.getDate()}
      </Typography>
      {visible.map((event) => (
        <Tooltip key={event.id} title={statusLabels[event.status] || event.status}>
          <Chip
            size="small"
            label={event.title}
            onClick={(e) => {
              e.stopPropagation()
              onEditEvent(event.id)
            }}
            sx={{
              height: 20,
              fontSize: '0.7rem',
              color: '#fff',
              bgcolor: statusCalendarColors[event.status] || '#78909c',
              cursor: 'pointer',
              '& .MuiChip-label': { px: 1 },
            }}
          />
        </Tooltip>
      ))}
      {extra > 0 && (
        <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.8 }}>
          +{extra} mais
        </Typography>
      )}
    </Box>
  )
}
