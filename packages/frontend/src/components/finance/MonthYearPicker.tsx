import { MenuItem, Stack, TextField } from '@mui/material'
import { monthNames } from '../../utils/format'

interface MonthYearPickerProps {
  month: number
  year: number
  onMonthChange: (month: number) => void
  onYearChange: (year: number) => void
}

export default function MonthYearPicker({ month, year, onMonthChange, onYearChange }: MonthYearPickerProps) {
  return (
    <Stack direction="row" spacing={2}>
      <TextField
        size="small"
        select
        label="Mês"
        value={month}
        onChange={(e) => onMonthChange(Number(e.target.value))}
        sx={{ minWidth: 130 }}
      >
        {monthNames.map((name, i) => (
          <MenuItem key={i + 1} value={i + 1}>{name}</MenuItem>
        ))}
      </TextField>
      <TextField
        size="small"
        label="Ano"
        type="number"
        value={year}
        onChange={(e) => onYearChange(Number(e.target.value))}
        sx={{ width: 90 }}
      />
    </Stack>
  )
}
