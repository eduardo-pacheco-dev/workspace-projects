import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import { GridView, TableView } from '@mui/icons-material'

export type ViewMode = 'table' | 'cards'

interface ViewToggleProps {
  value: ViewMode
  onChange: (mode: ViewMode) => void
}

export default function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <ToggleButtonGroup size="small" exclusive value={value} onChange={(_, v) => v && onChange(v)}>
      <ToggleButton value="table" aria-label="Visualizar em tabela">
        <TableView fontSize="small" />
      </ToggleButton>
      <ToggleButton value="cards" aria-label="Visualizar em cartões">
        <GridView fontSize="small" />
      </ToggleButton>
    </ToggleButtonGroup>
  )
}
