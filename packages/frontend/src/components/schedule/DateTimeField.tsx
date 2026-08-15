import { Grid, TextField } from '@mui/material'

interface DateTimeFieldProps {
  date: string
  time: string
  dateLabel: string
  timeLabel: string
  onDateChange: (value: string) => void
  onTimeChange: (value: string) => void
  onClearError: () => void
}

export default function DateTimeField({
  date,
  time,
  dateLabel,
  timeLabel,
  onDateChange,
  onTimeChange,
  onClearError,
}: DateTimeFieldProps) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <TextField
          fullWidth
          label={dateLabel}
          type="date"
          value={date}
          onChange={(e) => {
            onDateChange(e.target.value)
            onClearError()
          }}
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          fullWidth
          label={timeLabel}
          type="time"
          value={time}
          onChange={(e) => {
            onTimeChange(e.target.value)
            onClearError()
          }}
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
    </Grid>
  )
}
