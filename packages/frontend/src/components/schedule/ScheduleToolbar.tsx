import { Box, Button, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { Add, CalendarMonth, ViewList } from '@mui/icons-material'

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
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
      <Box>
        <Typography variant="h4">Agenda</Typography>
        {view === 'list' && (
          <Typography variant="body2" color="text.secondary">
            {total} agendamento(s) · {upcomingCount} próximos
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <ToggleButtonGroup value={view} exclusive onChange={(_, v) => v && onViewChange(v)} size="small">
          <ToggleButton value="list" aria-label="Lista">
            <ViewList fontSize="small" sx={{ mr: 0.5 }} />
            Lista
          </ToggleButton>
          <ToggleButton value="calendar" aria-label="Calendário">
            <CalendarMonth fontSize="small" sx={{ mr: 0.5 }} />
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
