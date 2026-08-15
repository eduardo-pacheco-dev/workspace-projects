import { Checkbox, FormControlLabel, FormLabel, Stack } from '@mui/material'
import { weekdayOptions } from '../../pages/ms-project/msProjectTypes'

interface WeekdayPickerProps {
  selected: number[]
  onToggle: (day: number) => void
}

export default function WeekdayPicker({ selected, onToggle }: WeekdayPickerProps) {
  return (
    <>
      <FormLabel sx={{ display: 'block', mb: 1, mt: 2 }}>Dias úteis</FormLabel>
      <Stack direction="row" flexWrap="wrap" useFlexGap>
        {weekdayOptions.map((option) => (
          <FormControlLabel
            key={option.value}
            control={
              <Checkbox
                size="small"
                checked={selected.includes(option.value)}
                onChange={() => onToggle(option.value)}
              />
            }
            label={option.label}
            sx={{ mr: 0.5, minWidth: 90 }}
          />
        ))}
      </Stack>
    </>
  )
}
