import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { Add, CalendarMonth, ViewList } from '@mui/icons-material'
import Button from '../ui/Button'

export type ScheduleViewMode = 'list' | 'calendar'

interface ScheduleToolbarProps {
  view: ScheduleViewMode
  total: number
  upcomingCount: number
  onViewChange: (view: ScheduleViewMode) => void
  onNew: () => void
}

export default function ScheduleToolbar({ view, total, upcomingCount, onViewChange, onNew }: ScheduleToolbarProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3, flexWrap: 'wrap', gap: 2 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Agenda</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {view === 'list'
            ? `${total} agendamento(s) · ${upcomingCount} próximo(s)`
            : `Calendário · ${total} agendamento(s)`}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <ToggleButtonGroup value={view} exclusive onChange={(_, v) => v && onViewChange(v)} size="small">
          <ToggleButton value="list" sx={{ textTransform: 'none', px: 2 }}>
            <ViewList fontSize="small" sx={{ mr: 0.75 }} />
            Lista
          </ToggleButton>
          <ToggleButton value="calendar" sx={{ textTransform: 'none', px: 2 }}>
            <CalendarMonth fontSize="small" sx={{ mr: 0.75 }} />
            Calendário
          </ToggleButton>
        </ToggleButtonGroup>
        <Button variant="contained" startIcon={<Add />} onClick={onNew}>
          Novo Agendamento
        </Button>
      </Box>
    </Box>
  )
}
