export interface UserCompany {
  id: number;
  nome: string;
}

export interface UserProps {
  id?: number;
  name?: string;
  lastName?: string | null;
  phone?: string | null;
  status?: string;
  email?: string;
  password?: string;
  resetToken?: string | null;
  role?: string;
  tokenVersion?: number;
  companyId?: number | null;
  company?: UserCompany | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  id: number;
  name: string;
  lastName?: string | null;
  phone?: string | null;
  status: string;
  email: string;
  password: string;
  resetToken?: string | null;
  role: string;
  tokenVersion: number;
  companyId?: number | null;
  company?: UserCompany | null;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: UserProps) {
    Object.assign(this, { status: 'inactive', role: 'user', tokenVersion: 0, ...props });
  }
}
