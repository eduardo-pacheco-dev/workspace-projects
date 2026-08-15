import { MenuItem, TextField } from '@mui/material'
import { FreelancerOption, freelancerFullName } from '../../pages/lpu/lpuTypes'

interface FreelancerPickerProps {
  value: string
  freelancers: FreelancerOption[]
  onChange: (value: string) => void
  disabled?: boolean
}

export default function FreelancerPicker({ value, freelancers, onChange, disabled }: FreelancerPickerProps) {
  return (
    <TextField
      select
      size="small"
      label="Selecionar Freelancer"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      sx={{ mb: 2, minWidth: 250 }}
    >
      <MenuItem value="">Selecione um freelancer</MenuItem>
      {freelancers.map((freelancer) => (
        <MenuItem key={freelancer.id} value={freelancer.id}>
          {freelancerFullName(freelancer)}
        </MenuItem>
      ))}
    </TextField>
  )
}
