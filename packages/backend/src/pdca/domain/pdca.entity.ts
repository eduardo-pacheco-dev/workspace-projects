import { PdcaAction } from './pdca-action.entity';

export interface PdcaProps {
  id?: number;
  projectId?: number | null;
  titulo?: string;
  problema?: string | null;
  impacto?: string | null;
  areaSetor?: string | null;
  responsavelCiclo?: string | null;
  tecnicaAnalise?: string | null;
  causaRaiz?: string | null;
  meta?: string | null;
  fase?: string;
  statusCiclo?: string;
  resultadoCheck?: string | null;
  kpi?: string | null;
  resultadoMedicao?: string | null;
  statusValidacao?: string | null;
  dataVerificacao?: string | null;
  responsavelValidacao?: string | null;
  decisoesAct?: string | null;
  pop?: string | null;
  licaoAprendida?: string | null;
  observacoes?: string | null;
  dataConclusao?: string | null;
  cicloPaiId?: number | null;
  actions?: PdcaAction[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Pdca {
  id?: number;
  projectId?: number | null;
  titulo: string;
  problema?: string | null;
  impacto?: string | null;
  areaSetor?: string | null;
  responsavelCiclo?: string | null;
  tecnicaAnalise?: string | null;
  causaRaiz?: string | null;
  meta?: string | null;
  fase: string;
  statusCiclo: string;
  resultadoCheck?: string | null;
  kpi?: string | null;
  resultadoMedicao?: string | null;
  statusValidacao?: string | null;
  dataVerificacao?: string | null;
  responsavelValidacao?: string | null;
  decisoesAct?: string | null;
  pop?: string | null;
  licaoAprendida?: string | null;
  observacoes?: string | null;
  dataConclusao?: string | null;
  cicloPaiId?: number | null;
  actions?: PdcaAction[];
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: PdcaProps) {
    Object.assign(this, { fase: 'plan', statusCiclo: 'aberto', ...props });
  }
}
