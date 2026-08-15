import { Box, Chip, Typography } from '@mui/material'

interface SkillsChipsProps {
  skills: string[]
}

export default function SkillsChips({ skills }: SkillsChipsProps) {
  return (
    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
      {skills.length > 0
        ? skills.map((skill) => <Chip key={skill} label={skill} size="small" variant="outlined" color="primary" />)
        : <Typography variant="body2" color="text.secondary">Nenhuma habilidade cadastrada</Typography>
      }
    </Box>
  )
}
