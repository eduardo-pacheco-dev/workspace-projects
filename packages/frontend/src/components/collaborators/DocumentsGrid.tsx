import { Box, Button, Grid, Typography } from '@mui/material'

interface DocumentsGridProps {
  items: { label: string; arquivo: string | null | undefined }[]
}

export default function DocumentsGrid({ items }: DocumentsGridProps) {
  return (
    <Grid container spacing={2}>
      {items.map((item) => (
        <Grid item xs={12} sm={4} md={3} key={item.label}>
          <Box sx={{ border: '1px dashed rgba(0,0,0,0.2)', borderRadius: 2, p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>{item.label}</Typography>
            {item.arquivo ? (
              <Button size="small" variant="outlined" component="a" href={item.arquivo} target="_blank" rel="noreferrer">
                Ver anexo
              </Button>
            ) : (
              <Typography variant="body2" color="text.secondary">Sem anexo</Typography>
            )}
          </Box>
        </Grid>
      ))}
    </Grid>
  )
}
