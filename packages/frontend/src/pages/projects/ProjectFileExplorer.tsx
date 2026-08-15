import { useState, useEffect, useCallback, useRef, Fragment } from 'react'
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
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material'
import FolderIcon from '@mui/icons-material/Folder'
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DownloadIcon from '@mui/icons-material/Download'
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import GridViewIcon from '@mui/icons-material/GridView'
import ViewListIcon from '@mui/icons-material/ViewList'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import FilePreviewDialog from '../../components/ui/FilePreviewDialog'
import NewFolderDialog from '../../components/projects/NewFolderDialog'
import RenameDialog from '../../components/projects/RenameDialog'
import MoveDialog from '../../components/projects/MoveDialog'
import DeleteExplorerDialog from '../../components/projects/DeleteExplorerDialog'
import ExplorerGridItem from '../../components/projects/ExplorerGridItem'
import ExplorerListItem from '../../components/projects/ExplorerListItem'
import { ExplorerItem, PathEntry } from './explorerTypes'

interface ProjectFileExplorerProps {
  projectId: number
}

export default function ProjectFileExplorer({ projectId }: ProjectFileExplorerProps) {
  const { showToast } = useToast()
  const [items, setItems] = useState<ExplorerItem[]>([])
  const [loading, setLoading] = useState(false)
  const [path, setPath] = useState<PathEntry[]>([{ id: null, nome: 'Anexos' }])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [folderModalOpen, setFolderModalOpen] = useState(false)
  const [creatingFolder, setCreatingFolder] = useState(false)

  const [renameTarget, setRenameTarget] = useState<ExplorerItem | null>(null)
  const [moveTarget, setMoveTarget] = useState<ExplorerItem | null>(null)
  const [allFolders, setAllFolders] = useState<ExplorerItem[]>([])

  const [deleteTarget, setDeleteTarget] = useState<ExplorerItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [preview, setPreview] = useState<{ url: string; type: string; name: string } | null>(null)
  const [menuFor, setMenuFor] = useState<ExplorerItem | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  function currentFolderId(): number | null {
    return path[path.length - 1]?.id ?? null
  }

  const fetchFolders = useCallback(() => {
    api
      .get(`/attachments/project/${projectId}`)
      .then((res) => setAllFolders((res.data ?? []).filter((a: ExplorerItem) => a.isFolder)))
      .catch(() => {})
  }, [projectId])

  const fetchItems = useCallback(
    async (folderId: number | null) => {
      setLoading(true)
      try {
        const res = await api.get(`/attachments/project/${projectId}`, {
          params: { folderId: folderId ?? 'root' },
        })
        setItems(res.data ?? [])
        fetchFolders()
      } catch (err: any) {
        showToast(err.response?.data?.message || 'Não foi possível carregar os anexos.', 'error')
      } finally {
        setLoading(false)
      }
    },
    [projectId, showToast, fetchFolders],
  )

  useEffect(() => {
    fetchItems(currentFolderId())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, fetchItems])

  useEffect(() => {
    fetchFolders()
  }, [fetchFolders])

  const navigateTo = (folder: PathEntry) => {
    const index = path.findIndex((p) => p.id === folder.id)
    if (index >= 0) {
      setPath(path.slice(0, index + 1))
    } else {
      setPath([...path, folder])
    }
  }

  const navigateToFolder = (folderId: number | null) => {
    const chain: PathEntry[] = []
    let current: ExplorerItem | undefined =
      folderId != null ? allFolders.find((f) => f.id === folderId) : undefined
    while (current) {
      chain.unshift({ id: current.id, nome: current.originalName })
      const parentId = current.folderId
      current = parentId != null ? allFolders.find((f) => f.id === parentId) : undefined
    }
    setPath([{ id: null, nome: 'Anexos' }, ...chain])
    setExpanded((prev) => {
      const next = new Set(prev)
      chain.forEach((p) => p.id != null && next.add(p.id))
      return next
    })
  }

  const toggleExpand = (folderId: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(folderId)) {
        next.delete(folderId)
      } else {
        next.add(folderId)
      }
      return next
    })
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

  const handleCreateFolder = async (name: string) => {
    setCreatingFolder(true)
    try {
      await api.post(`/attachments/project/${projectId}/folder`, {
        nome: name,
        folderId: currentFolderId(),
      })
      showToast('Pasta criada com sucesso.')
      setFolderModalOpen(false)
      fetchItems(currentFolderId())
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível criar a pasta.', 'error')
    } finally {
      setCreatingFolder(false)
    }
  }

  const handleRename = async (name: string) => {
    if (!renameTarget) return
    try {
      await api.patch(`/attachments/${renameTarget.id}`, { originalName: name })
      showToast('Item renomeado com sucesso.')
      setRenameTarget(null)
      fetchItems(currentFolderId())
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível renomear.', 'error')
    }
  }

  const handleMove = async (destination: number | 'root') => {
    if (!moveTarget) return
    try {
      await api.patch(`/attachments/${moveTarget.id}`, { folderId: destination === 'root' ? null : destination })
      showToast('Item movido com sucesso.')
      setMoveTarget(null)
      fetchItems(currentFolderId())
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível mover o item.', 'error')
    }
  }

  const handleDownloadFolder = async (item: ExplorerItem) => {
    setMenuFor(null)
    try {
      const res = await api.get(`/attachments/folder/${item.id}/download`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `pasta-${item.originalName}.zip`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      showToast('Download da pasta iniciado.')
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível baixar a pasta.', 'error')
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

  const renderTree = (parentId: number | null, depth: number) => {
    const children = allFolders.filter((f) => (f.folderId ?? null) === parentId)
    return children.map((folder) => {
      const hasChildren = allFolders.some((f) => (f.folderId ?? null) === folder.id)
      const isExpanded = expanded.has(folder.id)
      const isSelected = currentFolderId() === folder.id
      return (
        <Fragment key={folder.id}>
          <ListItemButton
            dense
            sx={{ pl: 2 + depth * 2 }}
            selected={isSelected}
            onClick={() => navigateToFolder(folder.id)}
          >
            {hasChildren ? (
              <IconButton
                size="small"
                edge="start"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleExpand(folder.id)
                }}
              >
                {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
              </IconButton>
            ) : (
              <Box sx={{ width: 32 }} />
            )}
            <FolderIcon fontSize="small" color="warning" sx={{ mr: 1 }} />
            <ListItemText primary={folder.originalName} primaryTypographyProps={{ noWrap: true }} />
          </ListItemButton>
          {isExpanded && renderTree(folder.id, depth + 1)}
        </Fragment>
      )
    })
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6">Anexos</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={viewMode}
            onChange={(_, v) => v && setViewMode(v)}
          >
            <ToggleButton value="grid" aria-label="Visualizar em grade">
              <GridViewIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="list" aria-label="Visualizar em lista">
              <ViewListIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
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

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'flex-start' }}>
        <Box
          sx={{
            width: { xs: '100%', md: 240 },
            flexShrink: 0,
            borderRight: { md: '1px solid' },
            borderColor: { md: 'divider' },
            pr: { md: 2 },
            mb: { xs: 2, md: 0 },
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Pastas
          </Typography>
          <List dense disablePadding>
            <ListItemButton
              dense
              selected={currentFolderId() === null}
              onClick={() => navigateToFolder(null)}
            >
              <FolderIcon fontSize="small" color="warning" sx={{ mr: 1 }} />
              <ListItemText primary="Anexos" primaryTypographyProps={{ noWrap: true }} />
            </ListItemButton>
            {renderTree(null, 0)}
          </List>
        </Box>

        <Box sx={{ flexGrow: 1, minWidth: 0, width: '100%' }}>
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
          ) : viewMode === 'grid' ? (
            <Grid container spacing={1.5}>
              {items.map((item) => (
                <ExplorerGridItem
                  key={item.id}
                  item={item}
                  onOpenMenu={handleOpenMenu}
                  onOpen={handleOpenFolder}
                  onPreview={handlePreview}
                />
              ))}
            </Grid>
          ) : (
            <List dense disablePadding>
              {items.map((item) => (
                <ExplorerListItem
                  key={item.id}
                  item={item}
                  onOpenMenu={handleOpenMenu}
                  onOpen={handleOpenFolder}
                  onPreview={handlePreview}
                />
              ))}
            </List>
          )}
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(menuFor)}
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
        {menuFor && menuFor.isFolder && (
          <MenuItem onClick={() => handleDownloadFolder(menuFor)}>
            <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Baixar Pasta (ZIP)</ListItemText>
          </MenuItem>
        )}
        {menuFor && (
          <MenuItem
            onClick={() => {
              setRenameTarget(menuFor)
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

      <NewFolderDialog
        open={folderModalOpen}
        creating={creatingFolder}
        onClose={() => setFolderModalOpen(false)}
        onCreate={handleCreateFolder}
      />

      <RenameDialog target={renameTarget} onClose={() => setRenameTarget(null)} onRename={handleRename} />

      <MoveDialog
        target={moveTarget}
        folders={allFolders}
        onClose={() => setMoveTarget(null)}
        onMove={handleMove}
      />

      <DeleteExplorerDialog
        target={deleteTarget}
        deleting={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <FilePreviewDialog preview={preview} onClose={() => setPreview(null)} />
    </Paper>
  )
}
