import { Pdca } from './pdca.entity';
import { PdcaAction } from './pdca-action.entity';

export const PDCA_REPOSITORY = 'PDCA_REPOSITORY';

export interface PdcaQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  projectId?: number;
  fase?: string;
  status?: string;
}

export interface PaginatedPdcas {
  data: Pdca[];
  total: number;
}

export interface PdcaRepository {
  create(pdca: Pdca): Promise<Pdca>;
  save(pdca: Pdca): Promise<Pdca>;
  findAll(query: PdcaQuery): Promise<PaginatedPdcas>;
  findById(id: number): Promise<Pdca | null>;
  delete(id: number): Promise<boolean>;
  countActions(pdcaId: number): Promise<number>;
  countActionsByStatus(pdcaId: number, status: string): Promise<number>;
  findActions(pdcaId: number): Promise<PdcaAction[]>;
  createAction(action: PdcaAction): Promise<PdcaAction>;
  saveAction(action: PdcaAction): Promise<PdcaAction>;
  findActionById(pdcaId: number, actionId: number): Promise<PdcaAction | null>;
  deleteAction(pdcaId: number, actionId: number): Promise<boolean>;
}
