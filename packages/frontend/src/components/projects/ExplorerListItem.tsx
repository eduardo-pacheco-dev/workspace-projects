import { Box, IconButton, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Typography } from '@mui/material'
import FolderIcon from '@mui/icons-material/Folder'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { ExplorerItem } from '../../pages/projects/explorerTypes'
import { formatSize } from '../../utils/format'

interface ExplorerListItemProps {
  item: ExplorerItem
  onOpenMenu: (e: React.MouseEvent<HTMLElement>, item: ExplorerItem) => void
  onOpen: (item: ExplorerItem) => void
  onPreview: (item: ExplorerItem) => void
}

export default function ExplorerListItem({ item, onOpenMenu, onOpen, onPreview }: ExplorerListItemProps) {
  const isImage = item.mimetype.startsWith('image/')
  const isPdf = item.mimetype === 'application/pdf'
  const isPreviewable = isImage || isPdf

  return (
    <ListItem
      sx={{
        px: 1,
        borderRadius: 1,
        cursor: 'pointer',
        '&:hover': { bgcolor: 'action.hover' },
      }}
      onDoubleClick={() => (item.isFolder ? onOpen(item) : isPreviewable && onPreview(item))}
    >
      <ListItemIcon sx={{ minWidth: 44 }}>
        {item.isFolder ? (
          <FolderIcon color="warning" />
        ) : isImage ? (
          <Box
            component="img"
            src={`/api/attachments/file/${item.id}`}
            sx={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 1 }}
          />
        ) : isPdf ? (
          <PictureAsPdfIcon color="error" />
        ) : (
          <InsertDriveFileIcon color="action" />
        )}
      </ListItemIcon>
      <ListItemText
        primary={item.originalName}
        secondary={item.isFolder ? 'Pasta' : formatSize(item.size)}
        primaryTypographyProps={{ noWrap: true }}
        secondaryTypographyProps={{ noWrap: true }}
      />
      <Box sx={{ display: { xs: 'none', sm: 'block' }, width: 180, textAlign: 'right', mr: 2 }}>
        <Typography variant="caption" color="text.secondary" noWrap>
          {item.isFolder ? '—' : new Date(item.createdAt).toLocaleDateString('pt-BR')}
        </Typography>
      </Box>
      <ListItemSecondaryAction>
        <IconButton size="small" onClick={(e) => onOpenMenu(e, item)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  )
}
