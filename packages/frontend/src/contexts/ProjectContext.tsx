import { createContext, useContext, useState, ReactNode } from 'react'

interface ProjectContextType {
  projectId: number | null
  setProjectId: (id: number | null) => void
}

const ProjectContext = createContext<ProjectContextType | null>(null)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projectId, setProjectId] = useState<number | null>(null)

  return (
    <ProjectContext.Provider value={{ projectId, setProjectId }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProject must be used within ProjectProvider')
  return ctx
}
