import { Collaborator } from './collaborator.entity';

export const COLLABORATOR_REPOSITORY = 'COLLABORATOR_REPOSITORY';

export interface CurrentUser {
  role: string;
  companyId: number | null;
}

export interface CollaboratorQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  isFreelancer?: boolean;
  companyId?: number;
}

export interface PaginatedCollaborators {
  data: Collaborator[];
  total: number;
}

export interface CollaboratorRepository {
  companyExists(companyId: number): Promise<boolean>;
  save(collaborator: Collaborator): Promise<Collaborator>;
  findAll(query: CollaboratorQuery): Promise<PaginatedCollaborators>;
  findById(id: number): Promise<Collaborator | null>;
  delete(id: number): Promise<boolean>;
}
