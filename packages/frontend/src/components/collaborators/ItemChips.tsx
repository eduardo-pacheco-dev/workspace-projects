import { Chip, Grid, Typography } from '@mui/material'

interface ItemChipsProps {
  items: { label: string }[]
  emptyMessage: string
}

export default function ItemChips({ items, emptyMessage }: ItemChipsProps) {
  if (items.length === 0) {
    return <Typography variant="body2" color="text.secondary">{emptyMessage}</Typography>
  }

  return (
    <Grid container spacing={1}>
      {items.map((item, index) => (
        <Grid item key={index} xs={12} sm={6} md={4}>
          <Chip size="small" variant="outlined" label={item.label} />
        </Grid>
      ))}
    </Grid>
  )
}
