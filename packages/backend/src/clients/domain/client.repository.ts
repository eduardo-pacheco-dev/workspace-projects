import { Client } from './client.entity';
import { Responsavel } from './responsavel.entity';

export const CLIENT_REPOSITORY = 'CLIENT_REPOSITORY';

export interface ClientQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  status?: string;
}

export interface PaginatedClients {
  data: Client[];
  total: number;
}

export interface ClientRepository {
  create(client: Client): Promise<Client>;
  save(client: Client): Promise<Client>;
  findAll(query: ClientQuery): Promise<PaginatedClients>;
  findById(id: number): Promise<Client | null>;
  delete(id: number): Promise<boolean>;
  findResponsaveisByClient(clientId: number): Promise<Responsavel[]>;
  createResponsavel(responsavel: Responsavel): Promise<Responsavel>;
  saveResponsavel(responsavel: Responsavel): Promise<Responsavel>;
  findResponsavelById(id: number): Promise<Responsavel | null>;
  deleteResponsavel(id: number): Promise<boolean>;
}
