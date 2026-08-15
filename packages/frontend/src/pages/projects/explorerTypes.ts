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

export interface PathEntry {
  id: number | null
  nome: string
}
