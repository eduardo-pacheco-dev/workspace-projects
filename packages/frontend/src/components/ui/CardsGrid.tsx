import { Grid } from '@mui/material'
import EmptyState from './EmptyState'

interface CardsGridProps {
  empty?: boolean
  emptyMessage?: string
  children: React.ReactNode
}

export default function CardsGrid({ empty, emptyMessage = 'Nenhum registro encontrado.', children }: CardsGridProps) {
  if (empty) {
    return <EmptyState message={emptyMessage} />
  }
  return <Grid container spacing={2}>{children}</Grid>
}
