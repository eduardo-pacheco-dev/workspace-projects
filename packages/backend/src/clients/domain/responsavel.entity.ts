export interface ResponsavelProps {
  id?: number;
  clientId: number;
  nome: string;
  sobrenome: string;
  email?: string | null;
  telefone?: string | null;
  funcao?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Responsavel {
  id?: number;
  clientId: number;
  nome: string;
  sobrenome: string;
  email?: string | null;
  telefone?: string | null;
  funcao?: string | null;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: ResponsavelProps) {
    Object.assign(this, props);
  }
}
