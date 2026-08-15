import { Box, Button, Grid, Typography } from '@mui/material'

interface DocumentUploadCardProps {
  label: string
  arquivo: string
  file: File | null
  onFileChange: (file: File | null) => void
}

export default function DocumentUploadCard({ label, arquivo, file, onFileChange }: DocumentUploadCardProps) {
  return (
    <Grid item xs={12} sm={4}>
      <Box sx={{ border: '1px dashed rgba(0,0,0,0.2)', borderRadius: 2, p: 2, textAlign: 'center' }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>{label}</Typography>
        <Button size="small" variant="outlined" component="label">
          Anexar Arquivo
          <input type="file" hidden onChange={(e) => onFileChange(e.target.files?.[0] ?? null)} />
        </Button>
        {file && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {file.name}
          </Typography>
        )}
        {!file && arquivo && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            <a href={arquivo} target="_blank" rel="noreferrer">Ver anexo</a>
          </Typography>
        )}
      </Box>
    </Grid>
  )
}
