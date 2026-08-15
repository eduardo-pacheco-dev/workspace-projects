import { useState } from 'react'
import { Paper, Tab, Tabs, TextField } from '@mui/material'
import Markdown from '../Markdown'

interface MarkdownFieldProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export default function MarkdownField({ value, onChange, error }: MarkdownFieldProps) {
  const [previewMode, setPreviewMode] = useState(false)

  return (
    <>
      <Tabs
        value={previewMode ? 1 : 0}
        onChange={(_, v) => setPreviewMode(v === 1)}
        sx={{ mt: 1, mb: 0.5, minHeight: 32 }}
      >
        <Tab label="Editar" sx={{ minHeight: 32, p: 0.5 }} />
        <Tab label="Preview" sx={{ minHeight: 32, p: 0.5 }} />
      </Tabs>
      {previewMode ? (
        <Paper variant="outlined" sx={{ p: 2, minHeight: 100, bgcolor: 'background.default' }}>
          <Markdown>{value}</Markdown>
        </Paper>
      ) : (
        <TextField
          fullWidth
          label="Descrição"
          multiline
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          margin="normal"
          error={Boolean(error)}
          helperText={error || 'Suporta Markdown'}
        />
      )}
    </>
  )
}
