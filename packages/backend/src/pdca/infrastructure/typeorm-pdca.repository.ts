import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Pdca, PdcaProps } from '../domain/pdca.entity';
import { PdcaAction, PdcaActionProps } from '../domain/pdca-action.entity';
import {
  PdcaRepository,
  PdcaQuery,
  PaginatedPdcas,
} from '../domain/pdca.repository';
import { PdcaEntity } from './pdca.entity';
import { PdcaActionEntity } from './pdca-action.entity';

const PDCA_FIELDS = [
  'id',
  'projectId',
  'titulo',
  'problema',
  'impacto',
  'areaSetor',
  'responsavelCiclo',
  'tecnicaAnalise',
  'causaRaiz',
  'meta',
  'fase',
  'statusCiclo',
  'resultadoCheck',
  'kpi',
  'resultadoMedicao',
  'statusValidacao',
  'dataVerificacao',
  'responsavelValidacao',
  'decisoesAct',
  'pop',
  'licaoAprendida',
  'observacoes',
  'dataConclusao',
  'cicloPaiId',
  'createdAt',
  'updatedAt',
] as const;

const PDCA_PERSISTENCE_FIELDS = PDCA_FIELDS.filter(
  (field) => field !== 'createdAt' && field !== 'updatedAt',
);

const ACTION_FIELDS = [
  'id',
  'pdcaId',
  'what',
  'why',
  'ondeAplicacao',
  'whenInicio',
  'whenPrazo',
  'who',
  'how',
  'howMuch',
  'status',
  'progresso',
  'observacoes',
  'dataInicioReal',
  'dataConclusaoReal',
  'createdAt',
  'updatedAt',
] as const;

const ACTION_PERSISTENCE_FIELDS = ACTION_FIELDS.filter(
  (field) => field !== 'createdAt' && field !== 'updatedAt',
);

const SEARCH_CLAUSE = 'p.titulo LIKE :search OR p.problema LIKE :search';

const ALLOWED_SORT_COLUMNS = [
  'id',
  'titulo',
  'fase',
  'statusCiclo',
  'createdAt',
  'dataVerificacao',
];

@Injectable()
export class TypeOrmPdcaRepository implements PdcaRepository {
  constructor(
    @InjectRepository(PdcaEntity)
    private readonly pdcaRepo: Repository<PdcaEntity>,
    @InjectRepository(PdcaActionEntity)
    private readonly actionsRepo: Repository<PdcaActionEntity>,
  ) {}

  private toPdca(entity: PdcaEntity): Pdca {
    const props: Record<string, unknown> = {};
    for (const field of PDCA_FIELDS) {
      props[field] = (entity as unknown as Record<string, unknown>)[field];
    }
    return new Pdca(props as unknown as PdcaProps);
  }

  private toPdcaPersistence(pdca: Pdca): Partial<PdcaEntity> {
    const entity: Record<string, unknown> = {};
    for (const field of PDCA_PERSISTENCE_FIELDS) {
      entity[field] = (pdca as unknown as Record<string, unknown>)[field] ?? null;
    }
    return entity as Partial<PdcaEntity>;
  }

  private toAction(entity: PdcaActionEntity): PdcaAction {
    const props: Record<string, unknown> = {};
    for (const field of ACTION_FIELDS) {
      props[field] = (entity as unknown as Record<string, unknown>)[field];
    }
    return new PdcaAction(props as unknown as PdcaActionProps);
  }

  private toActionPersistence(action: PdcaAction): Partial<PdcaActionEntity> {
    const entity: Record<string, unknown> = {};
    for (const field of ACTION_PERSISTENCE_FIELDS) {
      entity[field] = (action as unknown as Record<string, unknown>)[field] ?? null;
    }
    return entity as Partial<PdcaActionEntity>;
  }

  private applyProjectFilter(
    qb: SelectQueryBuilder<PdcaEntity>,
    projectId: number | undefined,
  ): void {
    if (!projectId) return;
    qb.where('p.projectId = :projectId', { projectId });
  }

  private applyFilter(
    qb: SelectQueryBuilder<PdcaEntity>,
    clause: string,
    parameters: Record<string, unknown>,
    hasPriorWhere: boolean,
  ): void {
    if (hasPriorWhere) {
      qb.andWhere(clause, parameters);
    } else {
      qb.where(clause, parameters);
    }
  }

  async create(pdca: Pdca): Promise<Pdca> {
    const entity = this.pdcaRepo.create(this.toPdcaPersistence(pdca) as Partial<PdcaEntity>);
    return this.toPdca(await this.pdcaRepo.save(entity));
  }

  async save(pdca: Pdca): Promise<Pdca> {
    return this.toPdca(await this.pdcaRepo.save(this.toPdcaPersistence(pdca) as Partial<PdcaEntity>));
  }

  async findAll(query: PdcaQuery): Promise<PaginatedPdcas> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'ASC' as 'ASC' | 'DESC',
      search,
      projectId,
      fase,
      status,
    } = query;

    const qb = this.pdcaRepo.createQueryBuilder('p');

    this.applyProjectFilter(qb, projectId);

    let hasPriorWhere = !!projectId;
    if (search) {
      this.applyFilter(qb, `(${SEARCH_CLAUSE})`, { search: `%${search}%` }, hasPriorWhere);
      hasPriorWhere = true;
    }
    if (fase) {
      this.applyFilter(qb, 'p.fase = :fase', { fase }, hasPriorWhere);
      hasPriorWhere = true;
    }
    if (status) {
      this.applyFilter(qb, 'p.statusCiclo = :status', { status }, hasPriorWhere);
    }

    const safeSort = ALLOWED_SORT_COLUMNS.includes(sortBy) ? sortBy : 'id';
    const safeOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const [data, total] = await qb
      .orderBy(`p.${safeSort}`, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: data.map((entity) => this.toPdca(entity)), total };
  }

  async findById(id: number): Promise<Pdca | null> {
    const entity = await this.pdcaRepo.findOne({ where: { id } });
    return entity ? this.toPdca(entity) : null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.pdcaRepo.delete(id);
    return result.affected !== 0;
  }

  async countActions(pdcaId: number): Promise<number> {
    return this.actionsRepo.count({ where: { pdcaId } });
  }

  async countActionsByStatus(pdcaId: number, status: string): Promise<number> {
    return this.actionsRepo.count({ where: { pdcaId, status } });
  }

  async findActions(pdcaId: number): Promise<PdcaAction[]> {
    const rows = await this.actionsRepo.find({
      where: { pdcaId },
      order: { createdAt: 'ASC' },
    });
    return rows.map((entity) => this.toAction(entity));
  }

  async createAction(action: PdcaAction): Promise<PdcaAction> {
    const entity = this.actionsRepo.create(
      this.toActionPersistence(action) as Partial<PdcaActionEntity>,
    );
    return this.toAction(await this.actionsRepo.save(entity));
  }

  async saveAction(action: PdcaAction): Promise<PdcaAction> {
    return this.toAction(
      await this.actionsRepo.save(this.toActionPersistence(action) as Partial<PdcaActionEntity>),
    );
  }

  async findActionById(pdcaId: number, actionId: number): Promise<PdcaAction | null> {
    const entity = await this.actionsRepo.findOne({ where: { id: actionId, pdcaId } });
    return entity ? this.toAction(entity) : null;
  }

  async deleteAction(pdcaId: number, actionId: number): Promise<boolean> {
    const result = await this.actionsRepo.delete({ id: actionId, pdcaId });
    return result.affected !== 0;
  }
}
