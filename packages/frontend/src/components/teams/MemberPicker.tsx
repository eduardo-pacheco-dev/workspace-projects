import { useState } from 'react'
import { Box, Checkbox, Chip, FormControlLabel, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { CollaboratorOption, getMemberName } from '../../pages/teams/teamsTypes'

type TypeFilter = 'todos' | 'freelancer' | 'colaborador'

interface MemberPickerProps {
  collaborators: CollaboratorOption[]
  selectedIds: number[]
  onToggle: (id: number) => void
}

export default function MemberPicker({ collaborators, selectedIds, onToggle }: MemberPickerProps) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('todos')
  const [search, setSearch] = useState('')

  const filtered = collaborators.filter((collaborator) => {
    const name = getMemberName(collaborator).toLowerCase()
    if (search && !name.includes(search.toLowerCase())) return false
    if (typeFilter === 'freelancer' && !collaborator.isFreelancer) return false
    if (typeFilter === 'colaborador' && collaborator.isFreelancer) return false
    return true
  })

  return (
    <Box sx={{ mt: 2, mb: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        Membros ({selectedIds.length})
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
        <TextField
          size="small"
          fullWidth
          label="Buscar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <TextField
          size="small"
          select
          label="Tipo"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="todos">Todos</MenuItem>
          <MenuItem value="freelancer">Freelancers</MenuItem>
          <MenuItem value="colaborador">Colaboradores</MenuItem>
        </TextField>
      </Stack>
      <Box sx={{ maxHeight: 260, overflowY: 'auto', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 1, p: 1 }}>
        {filtered.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
            Nenhum colaborador encontrado.
          </Typography>
        ) : (
          filtered.map((collaborator) => (
            <FormControlLabel
              key={collaborator.id}
              control={
                <Checkbox
                  size="small"
                  checked={selectedIds.includes(collaborator.id)}
                  onChange={() => onToggle(collaborator.id)}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{getMemberName(collaborator)}</span>
                  <Chip
                    size="small"
                    label={collaborator.isFreelancer ? 'Freelancer' : 'Colaborador'}
                    color={collaborator.isFreelancer ? 'primary' : 'default'}
                  />
                </Box>
              }
              sx={{ width: '100%', mx: 0 }}
            />
          ))
        )}
      </Box>
    </Box>
  )
}
