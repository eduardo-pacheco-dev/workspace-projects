export interface ProjectDocumentProps {
  id?: number;
  projectId: number;
  nome: string;
  tipo?: string | null;
  quantidade?: number;
  observacoes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ProjectDocument {
  id?: number;
  projectId: number;
  nome: string;
  tipo?: string | null;
  quantidade: number;
  observacoes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: ProjectDocumentProps) {
    Object.assign(this, { quantidade: 1, ...props });
  }
}
