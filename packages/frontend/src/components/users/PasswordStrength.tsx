import { Box, LinearProgress, Typography } from '@mui/material'
import { PasswordStrength as Strength, getStrengthColor } from '../../utils/password'

interface PasswordStrengthProps {
  strength: Strength
}

export default function PasswordStrength({ strength }: PasswordStrengthProps) {
  const color = getStrengthColor(strength.score)

  return (
    <Box sx={{ mt: 0.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          Nível de segurança
        </Typography>
        <Typography variant="caption" fontWeight={600} sx={{ color }}>
          {strength.label}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={strength.score}
        color={color.replace('.main', '') as any}
        sx={{ height: 6, borderRadius: 3 }}
      />
      <Box component="ul" sx={{ m: 0, mt: 1, p: 0, listStyle: 'none' }}>
        {strength.criteria.map((criterion) => (
          <Box
            component="li"
            key={criterion.label}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              py: 0.25,
              color: criterion.met ? 'success.main' : 'text.disabled',
            }}
          >
            <Typography variant="caption" sx={{ fontSize: 14 }}>
              {criterion.met ? '✓' : '•'}
            </Typography>
            <Typography variant="caption" sx={{ textDecoration: criterion.met ? 'line-through' : 'none' }}>
              {criterion.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
