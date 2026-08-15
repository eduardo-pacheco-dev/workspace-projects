import { Box, Grid, IconButton, Typography } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import FolderIcon from '@mui/icons-material/Folder'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import { ExplorerItem } from '../../pages/projects/explorerTypes'
import { formatSize } from '../../utils/format'

interface ExplorerGridItemProps {
  item: ExplorerItem
  onOpenMenu: (e: React.MouseEvent<HTMLElement>, item: ExplorerItem) => void
  onOpen: (item: ExplorerItem) => void
  onPreview: (item: ExplorerItem) => void
}

export default function ExplorerGridItem({ item, onOpenMenu, onOpen, onPreview }: ExplorerGridItemProps) {
  const isImage = item.mimetype.startsWith('image/')
  const isPdf = item.mimetype === 'application/pdf'
  const isPreviewable = isImage || isPdf

  return (
    <Grid item xs={6} sm={4} md={3} lg={2} key={item.id}>
      <Box
        onDoubleClick={() => (item.isFolder ? onOpen(item) : isPreviewable && onPreview(item))}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          p: 1.5,
          textAlign: 'center',
          position: 'relative',
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <IconButton
          size="small"
          onClick={(e) => onOpenMenu(e, item)}
          sx={{ position: 'absolute', top: 4, right: 4 }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
        {item.isFolder ? (
          <FolderIcon sx={{ fontSize: 56, color: '#fbc02d' }} />
        ) : isImage ? (
          <Box
            component="img"
            src={`/api/attachments/file/${item.id}`}
            sx={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 1 }}
          />
        ) : isPdf ? (
          <PictureAsPdfIcon sx={{ fontSize: 56, color: '#d32f2f' }} />
        ) : (
          <InsertDriveFileIcon sx={{ fontSize: 56, color: '#9e9e9e' }} />
        )}
        <Typography
          variant="body2"
          sx={{ mt: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}
          title={item.originalName}
        >
          {item.originalName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {item.isFolder ? 'Pasta' : formatSize(item.size)}
        </Typography>
      </Box>
    </Grid>
  )
}
