import { Box, Dialog, DialogContent, DialogTitle, Typography } from '@mui/material'

export interface FilePreview {
  url: string
  type: string
  name: string
}

interface FilePreviewDialogProps {
  preview: FilePreview | null
  onClose: () => void
}

export default function FilePreviewDialog({ preview, onClose }: FilePreviewDialogProps) {
  const isImage = preview?.type.startsWith('image/')
  const isPdf = preview?.type === 'application/pdf'

  return (
    <Dialog open={Boolean(preview)} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{preview?.name || 'Preview'}</DialogTitle>
      <DialogContent>
        {isImage ? (
          <Box
            component="img"
            src={preview?.url}
            sx={{ maxWidth: '100%', maxHeight: '80vh', display: 'block', mx: 'auto' }}
          />
        ) : isPdf ? (
          <Box
            component="iframe"
            src={preview?.url}
            sx={{ width: '100%', height: '80vh', border: 'none' }}
            title="PDF Preview"
          />
        ) : (
          <Typography variant="body1">
            Pré-visualização não disponível para este tipo de arquivo.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  )
}
