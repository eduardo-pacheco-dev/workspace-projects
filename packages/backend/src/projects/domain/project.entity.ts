export interface ProjectRelationItem {
  id: number;
  nome?: string;
  siteId?: string;
}

export interface ProjectProps {
  id?: number;
  nome?: string;
  codigo?: string | null;
  descricao?: string | null;
  cliente?: string | null;
  operadora?: string | null;
  responsavel?: string | null;
  dataInicio?: string | null;
  dataFim?: string | null;
  observacoes?: string | null;
  status?: string;
  companies?: ProjectRelationItem[];
  stations?: ProjectRelationItem[];
  radioLinks?: ProjectRelationItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Project {
  id?: number;
  nome?: string;
  codigo?: string | null;
  descricao?: string | null;
  cliente?: string | null;
  operadora?: string | null;
  responsavel?: string | null;
  dataInicio?: string | null;
  dataFim?: string | null;
  observacoes?: string | null;
  status: string;
  companies?: ProjectRelationItem[];
  stations?: ProjectRelationItem[];
  radioLinks?: ProjectRelationItem[];
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: ProjectProps) {
    Object.assign(this, { status: 'ativo', ...props });
  }
}
