export interface ClientProps {
  id?: number;
  nome: string;
  documento?: string | null;
  email?: string | null;
  telefone?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  uf?: string | null;
  observacoes?: string | null;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Client {
  id?: number;
  nome: string;
  documento?: string | null;
  email?: string | null;
  telefone?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  uf?: string | null;
  observacoes?: string | null;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: ClientProps) {
    Object.assign(this, { status: 'ativo', ...props });
  }
}
