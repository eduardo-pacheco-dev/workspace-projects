export interface PdcaActionProps {
  id?: number;
  pdcaId: number;
  what: string;
  why?: string | null;
  ondeAplicacao?: string | null;
  whenInicio?: string | null;
  whenPrazo?: string | null;
  who?: string | null;
  how?: string | null;
  howMuch?: number | null;
  status?: string;
  progresso?: number;
  observacoes?: string | null;
  dataInicioReal?: string | null;
  dataConclusaoReal?: string | null;
  atrasado?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class PdcaAction {
  id?: number;
  pdcaId: number;
  what: string;
  why?: string | null;
  ondeAplicacao?: string | null;
  whenInicio?: string | null;
  whenPrazo?: string | null;
  who?: string | null;
  how?: string | null;
  howMuch?: number | null;
  status: string;
  progresso: number;
  observacoes?: string | null;
  dataInicioReal?: string | null;
  dataConclusaoReal?: string | null;
  atrasado?: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: PdcaActionProps) {
    Object.assign(this, { status: 'pendente', progresso: 0, ...props });
  }
}
