import { useShallow } from 'zustand/react/shallow'
import { useProjectStore } from '../stores/projectStore'

export function useProject() {
  return useProjectStore(useShallow((s) => ({ projectId: s.projectId, setProjectId: s.setProjectId })))
}
