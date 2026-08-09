import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Paper,
  Box,
  Typography,
  Button,
  Grid,
  Breadcrumbs,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Select,
  InputLabel,
  FormControl,
  Alert,
} from '@mui/material'
import FolderIcon from '@mui/icons-material/Folder'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import DownloadIcon from '@mui/icons-material/Download'
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'

export interface ExplorerItem {
  id: number
  projectId: number | null
  folderId: number | null
  filename: string
  originalName: string
  mimetype: string
  size: number
  isFolder: boolean
  createdAt: string
}

interface PathEntry {
  id: number | null
  nome: string
}

interface ProjectFileExplorerProps {
  projectId: number
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ProjectFileExplorer({ projectId }: ProjectFileExplorerProps) {
  const { showToast } = useToast()
  const [items, setItems] = useState<ExplorerItem[]>([])
  const [loading, setLoading] = useState(false)
  const [path, setPath] = useState<PathEntry[]>([{ id: null, nome: 'Anexos' }])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [folderModalOpen, setFolderModalOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [creatingFolder, setCreatingFolder] = useState(false)

  const [renameTarget, setRenameTarget] = useState<ExplorerItem | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const [moveTarget, setMoveTarget] = useState<ExplorerItem | null>(null)
  const [moveDest, setMoveDest] = useState<number | 'root'>(() => currentFolderId() ?? 'root')
  const [allFolders, setAllFolders] = useState<ExplorerItem[]>([])

  const [deleteTarget, setDeleteTarget] = useState<ExplorerItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [preview, setPreview] = useState<{ url: string; type: string; name: string } | null>(null)
  const [menuFor, setMenuFor] = useState<ExplorerItem | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  function currentFolderId(): number | null {
    return path[path.length - 1]?.id ?? null
  }

  const fetchItems = useCallback(
    async (folderId: number | null) => {
      setLoading(true)
      try {
        const res = await api.get(`/attachments/project/${projectId}`, {
          params: { folderId: folderId ?? 'root' },
        })
        setItems(res.data ?? [])
      } catch (err: any) {
        showToast(err.response?.data?.message || 'Não foi possível carregar os anexos.', 'error')
      } finally {
        setLoading(false)
      }
    },
    [projectId, showToast],
  )

  useEffect(() => {
    fetchItems(currentFolderId())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, fetchItems])

  useEffect(() => {
    api
      .get(`/attachments/project/${projectId}`)
      .then((res) => setAllFolders((res.data ?? []).filter((a: ExplorerItem) => a.isFolder)))
      .catch(() => {})
  }, [projectId])

  const navigateTo = (folder: PathEntry) => {
    const index = path.findIndex((p) => p.id === folder.id)
    if (index >= 0) {
      setPath(path.slice(0, index + 1))
    } else {
      setPath([...path, folder])
    }
  }

  const handleOpenFolder = (item: ExplorerItem) => {
    setMenuFor(null)
    navigateTo({ id: item.id, nome: item.originalName })
  }

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>, item: ExplorerItem) => {
    e.stopPropagation()
    setAnchorEl(e.currentTarget)
    setMenuFor(item)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
    setMenuFor(null)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    const folderId = currentFolderId()
    try {
      for (const file of Array.from(files)) {
        const form = new FormData()
        form.append('file', file)
        await api.post(`/attachments/upload/project/${projectId}`, form, {
          params: { folderId: folderId ?? 'root' },
        })
      }
      showToast(files.length > 1 ? 'Arquivos enviados com sucesso.' : 'Arquivo enviado com sucesso.')
      fetchItems(folderId)
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível enviar o arquivo.', 'error')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return
    setCreatingFolder(true)
    try {
      await api.post(`/attachments/project/${projectId}/folder`, {
        nome: newFolderName.trim(),
        folderId: currentFolderId(),
      })
      showToast('Pasta criada com sucesso.')
      setFolderModalOpen(false)
      setNewFolderName('')
      fetchItems(currentFolderId())
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível criar a pasta.', 'error')
    } finally {
      setCreatingFolder(false)
    }
  }

  const handleRename = async () => {
    if (!renameTarget || !renameValue.trim()) return
    try {
      await api.patch(`/attachments/${renameTarget.id}`, { originalName: renameValue.trim() })
      showToast('Item renomeado com sucesso.')
      setRenameTarget(null)
      fetchItems(currentFolderId())
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível renomear.', 'error')
    }
  }

  const handleMove = async () => {
    if (!moveTarget) return
    try {
      await api.patch(`/attachments/${moveTarget.id}`, { folderId: moveDest === 'root' ? null : moveDest })
      showToast('Item movido com sucesso.')
      setMoveTarget(null)
      fetchItems(currentFolderId())
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível mover o item.', 'error')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/attachments/${deleteTarget.id}`)
      showToast(deleteTarget.isFolder ? 'Pasta excluída com sucesso.' : 'Arquivo excluído com sucesso.')
      const stillInside = path.some((p) => p.id === deleteTarget.id)
      setDeleteTarget(null)
      if (stillInside) {
        setPath([{ id: null, nome: 'Anexos' }])
      } else {
        fetchItems(currentFolderId())
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível excluir.', 'error')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const handlePreview = (item: ExplorerItem) => {
    setMenuFor(null)
    setPreview({ url: `/api/attachments/file/${item.id}`, type: item.mimetype, name: item.originalName })
  }

  const renderItem = (item: ExplorerItem) => {
    const isImage = item.mimetype.startsWith('image/')
    const isPdf = item.mimetype === 'application/pdf'
    const isPreviewable = isImage || isPdf

    return (
      <Grid item xs={6} sm={4} md={3} lg={2} key={item.id}>
        <Box
          onDoubleClick={() => (item.isFolder ? handleOpenFolder(item) : isPreviewable && handlePreview(item))}
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
            onClick={(e) => handleOpenMenu(e, item)}
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

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6">Anexos</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<CreateNewFolderIcon />}
            onClick={() => setFolderModalOpen(true)}
          >
            Nova Pasta
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<UploadFileIcon />}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Enviando...' : 'Enviar'}
          </Button>
          <input ref={fileInputRef} type="file" multiple hidden onChange={handleUpload} />
        </Box>
      </Box>

      <Breadcrumbs separator={<ChevronRightIcon fontSize="small" />} sx={{ mb: 2 }}>
        {path.map((p) => (
          <Button
            key={p.id ?? 'root'}
            size="small"
            variant={p.id === currentFolderId() ? 'contained' : 'text'}
            onClick={() => navigateTo(p)}
            startIcon={p.id === null ? <FolderIcon fontSize="small" /> : undefined}
          >
            {p.nome}
          </Button>
        ))}
      </Breadcrumbs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          Nenhum item nesta pasta. Use "Nova Pasta" ou "Enviar" para adicionar conteúdo.
        </Alert>
      ) : (
        <Grid container spacing={1.5}>
          {items.map(renderItem)}
        </Grid>
      )}

      <Menu
        anchorEl={anchorEl}
        open={!!menuFor}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {menuFor && !menuFor.isFolder && (menuFor.mimetype.startsWith('image/') || menuFor.mimetype === 'application/pdf') && (
          <MenuItem onClick={() => handlePreview(menuFor)}>
            <ListItemIcon><InsertDriveFileIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Visualizar</ListItemText>
          </MenuItem>
        )}
        {menuFor && !menuFor.isFolder && (
          <MenuItem component="a" href={`/api/attachments/download/${menuFor.id}`} target="_blank">
            <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Baixar</ListItemText>
          </MenuItem>
        )}
        {menuFor && (
          <MenuItem
            onClick={() => {
              setRenameTarget(menuFor)
              setRenameValue(menuFor.originalName)
              handleCloseMenu()
            }}
          >
            <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Renomear</ListItemText>
          </MenuItem>
        )}
        {menuFor && (
          <MenuItem
            onClick={() => {
              setMoveTarget(menuFor)
              setMoveDest(menuFor.folderId ?? 'root')
              handleCloseMenu()
            }}
          >
            <ListItemIcon><DriveFileMoveIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Mover para</ListItemText>
          </MenuItem>
        )}
        {menuFor && (
          <MenuItem
            onClick={() => {
              setDeleteTarget(menuFor)
              handleCloseMenu()
            }}
          >
            <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Excluir</ListItemText>
          </MenuItem>
        )}
      </Menu>

      <Dialog open={folderModalOpen} onClose={() => setFolderModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Nova Pasta</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            autoFocus
            label="Nome da pasta"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder() }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFolderModalOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateFolder} disabled={creatingFolder || !newFolderName.trim()}>
            {creatingFolder ? <CircularProgress size={20} color="inherit" /> : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!renameTarget} onClose={() => setRenameTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Renomear</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            autoFocus
            label="Nome"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleRename() }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameTarget(null)}>Cancelar</Button>
          <Button variant="contained" onClick={handleRename} disabled={!renameValue.trim()}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!moveTarget} onClose={() => setMoveTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Mover para</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Escolha a pasta de destino para "{moveTarget?.originalName}".
          </DialogContentText>
          <FormControl fullWidth>
            <InputLabel>Destino</InputLabel>
            <Select
              value={moveDest}
              onChange={(e) => setMoveDest(e.target.value as number | 'root')}
              label="Destino"
            >
              <MenuItem value="root">Raiz (Anexos)</MenuItem>
              {allFolders
                .filter((f) => f.id !== moveTarget?.id)
                .map((f) => (
                  <MenuItem key={f.id} value={f.id}>
                    {f.originalName}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoveTarget(null)}>Cancelar</Button>
          <Button variant="contained" onClick={handleMove}>
            Mover
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Excluir {deleteTarget?.isFolder ? 'pasta' : 'arquivo'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir "{deleteTarget?.originalName}"?
            {deleteTarget?.isFolder ? ' Todos os itens dentro dela também serão excluídos.' : ''}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting}>
            {deleting ? <CircularProgress size={20} color="inherit" /> : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!preview} onClose={() => setPreview(null)} maxWidth="lg" fullWidth>
        <DialogTitle>{preview?.name || 'Preview'}</DialogTitle>
        <DialogContent>
          {preview?.type.startsWith('image/') ? (
            <Box
              component="img"
              src={preview?.url}
              sx={{ maxWidth: '100%', maxHeight: '80vh', display: 'block', mx: 'auto' }}
            />
          ) : preview?.type === 'application/pdf' ? (
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
    </Paper>
  )
}
