import { Chip } from '@mui/material'

export type ChipColor = 'default' | 'info' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'

interface StatusChipProps {
  value: string
  labels?: Record<string, string>
  colors?: Record<string, ChipColor>
  variant?: 'filled' | 'outlined'
}

export default function StatusChip({ value, labels, colors, variant }: StatusChipProps) {
  return (
    <Chip
      size="small"
      variant={variant}
      label={labels?.[value] || value}
      color={colors?.[value] || 'default'}
    />
  )
}
