import { create } from 'zustand'

interface ProjectState {
  projectId: number | null
  setProjectId: (id: number | null) => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  projectId: null,
  setProjectId: (projectId) => set({ projectId }),
}))
