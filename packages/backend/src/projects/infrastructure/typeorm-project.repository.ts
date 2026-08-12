import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Project, ProjectProps, ProjectRelationItem } from '../domain/project.entity';
import { ProjectDocument, ProjectDocumentProps } from '../domain/project-document.entity';
import {
  ProjectRepository,
  ProjectQuery,
  PaginatedProjects,
  ProjectRelation,
  RelatedEntityKind,
} from '../domain/project.repository';
import { StationEntity } from '../../stations/infrastructure/station.entity';
import { RadioLinkEntity } from '../../radio-links/infrastructure/radio-link.entity';
import { Company } from '../../companies/company.entity';
import { ProjectEntity } from './project.entity';
import { ProjectDocumentEntity } from './project-document.entity';

const PROJECT_FIELDS = [
  'id',
  'nome',
  'codigo',
  'descricao',
  'cliente',
  'operadora',
  'responsavel',
  'dataInicio',
  'dataFim',
  'observacoes',
  'status',
  'createdAt',
  'updatedAt',
] as const;

const PROJECT_PERSISTENCE_FIELDS = PROJECT_FIELDS.filter(
  (field) => field !== 'createdAt' && field !== 'updatedAt',
);

const DOCUMENT_FIELDS = [
  'id',
  'projectId',
  'nome',
  'tipo',
  'quantidade',
  'observacoes',
  'createdAt',
  'updatedAt',
] as const;

const DOCUMENT_PERSISTENCE_FIELDS = DOCUMENT_FIELDS.filter(
  (field) => field !== 'createdAt' && field !== 'updatedAt',
);

const SEARCH_CLAUSE =
  'p.nome LIKE :search OR p.codigo LIKE :search OR p.cliente LIKE :search OR p.responsavel LIKE :search OR p.descricao LIKE :search';

const ALLOWED_SORT_COLUMNS = [
  'id',
  'nome',
  'codigo',
  'cliente',
  'status',
  'dataInicio',
  'createdAt',
];

@Injectable()
export class TypeOrmProjectRepository implements ProjectRepository {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectsRepo: Repository<ProjectEntity>,
    @InjectRepository(ProjectDocumentEntity)
    private readonly documentsRepo: Repository<ProjectDocumentEntity>,
    @InjectRepository(StationEntity)
    private readonly stationsRepo: Repository<StationEntity>,
    @InjectRepository(RadioLinkEntity)
    private readonly radioLinksRepo: Repository<RadioLinkEntity>,
    @InjectRepository(Company)
    private readonly companiesRepo: Repository<Company>,
  ) {}

  private toRelationItem(entity: { id: number; nome?: string; siteId?: string }): ProjectRelationItem {
    return { id: entity.id, nome: entity.nome, siteId: entity.siteId };
  }

  private toProject(entity: ProjectEntity): Project {
    const props: Record<string, unknown> = {};
    for (const field of PROJECT_FIELDS) {
      props[field] = (entity as unknown as Record<string, unknown>)[field];
    }
    if (entity.companies) {
      props.companies = entity.companies.map((c) => this.toRelationItem(c));
    }
    if (entity.stations) {
      props.stations = entity.stations.map((s) => this.toRelationItem(s));
    }
    if (entity.radioLinks) {
      props.radioLinks = entity.radioLinks.map((r) => this.toRelationItem(r));
    }
    return new Project(props as unknown as ProjectProps);
  }

  private toProjectPersistence(project: Project): Partial<ProjectEntity> {
    const entity: Record<string, unknown> = {};
    for (const field of PROJECT_PERSISTENCE_FIELDS) {
      entity[field] = (project as unknown as Record<string, unknown>)[field] ?? null;
    }
    if (project.companies) {
      entity.companies = project.companies.map((c) => ({ id: c.id }) as Company);
    }
    if (project.stations) {
      entity.stations = project.stations.map((s) => ({ id: s.id }) as StationEntity);
    }
    if (project.radioLinks) {
      entity.radioLinks = project.radioLinks.map((r) => ({ id: r.id }) as RadioLinkEntity);
    }
    return entity as Partial<ProjectEntity>;
  }

  private toDocument(entity: ProjectDocumentEntity): ProjectDocument {
    const props: Record<string, unknown> = {};
    for (const field of DOCUMENT_FIELDS) {
      props[field] = (entity as unknown as Record<string, unknown>)[field];
    }
    return new ProjectDocument(props as unknown as ProjectDocumentProps);
  }

  private toDocumentPersistence(document: ProjectDocument): Partial<ProjectDocumentEntity> {
    const entity: Record<string, unknown> = {};
    for (const field of DOCUMENT_PERSISTENCE_FIELDS) {
      entity[field] = (document as unknown as Record<string, unknown>)[field] ?? null;
    }
    return entity as Partial<ProjectDocumentEntity>;
  }

  private applyCompanyFilter(
    qb: SelectQueryBuilder<ProjectEntity>,
    companyId: number | undefined,
  ): void {
    if (companyId === undefined) return;
    qb.innerJoin('p.companies', 'userCompany').andWhere('userCompany.id = :companyId', {
      companyId,
    });
  }

  private applyProjectListFilters(
    qb: SelectQueryBuilder<ProjectEntity>,
    search: string | undefined,
    status: string | undefined,
    cliente: string | undefined,
  ): void {
    if (search) {
      qb.andWhere(`(${SEARCH_CLAUSE})`, { search: `%${search}%` });
    }
    if (status) {
      qb.andWhere('p.status = :status', { status });
    }
    if (cliente) {
      qb.andWhere('p.cliente = :cliente', { cliente });
    }
  }

  private async runPaged(
    qb: SelectQueryBuilder<ProjectEntity>,
    query: ProjectQuery,
  ): Promise<PaginatedProjects> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'ASC' as 'ASC' | 'DESC',
    } = query;

    const safeSort = ALLOWED_SORT_COLUMNS.includes(sortBy) ? sortBy : 'id';
    const safeOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const [data, total] = await qb
      .orderBy(`p.${safeSort}`, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: data.map((entity) => this.toProject(entity)), total };
  }

  async create(project: Project): Promise<Project> {
    const entity = this.projectsRepo.create(this.toProjectPersistence(project) as Partial<ProjectEntity>);
    return this.toProject(await this.projectsRepo.save(entity));
  }

  async save(project: Project): Promise<Project> {
    const saved = await this.projectsRepo.save(
      this.toProjectPersistence(project) as Partial<ProjectEntity>,
    );
    const result = this.toProject(saved);
    result.companies = project.companies;
    result.stations = project.stations;
    result.radioLinks = project.radioLinks;
    return result;
  }

  async findAll(query: ProjectQuery): Promise<PaginatedProjects> {
    const qb = this.projectsRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.companies', 'companies');

    this.applyCompanyFilter(qb, query.companyId);
    this.applyProjectListFilters(qb, query.search, query.status, query.cliente);
    return this.runPaged(qb, query);
  }

  async findByCompany(companyId: number, query: ProjectQuery): Promise<PaginatedProjects> {
    const qb = this.projectsRepo
      .createQueryBuilder('p')
      .innerJoin('p.companies', 'c')
      .where('c.id = :companyId', { companyId });

    if (query.search) {
      qb.andWhere('p.nome LIKE :search OR p.codigo LIKE :search OR p.cliente LIKE :search', {
        search: `%${query.search}%`,
      });
    }
    if (query.status) {
      qb.andWhere('p.status = :status', { status: query.status });
    }
    return this.runPaged(qb, query);
  }

  async findById(id: number): Promise<Project | null> {
    const entity = await this.projectsRepo.findOne({ where: { id } });
    return entity ? this.toProject(entity) : null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.projectsRepo.delete(id);
    return result.affected !== 0;
  }

  async findRelation(projectId: number, relation: ProjectRelation): Promise<ProjectRelationItem[]> {
    const project = await this.projectsRepo.findOne({
      where: { id: projectId },
      relations: [relation],
    });
    const rows = (project?.[relation] ?? []) as { id: number; nome?: string; siteId?: string }[];
    return rows.map((item) => this.toRelationItem(item));
  }

  async findRelatedEntity(kind: RelatedEntityKind, id: number): Promise<ProjectRelationItem | null> {
    if (kind === 'company') {
      const company = await this.companiesRepo.findOne({ where: { id } });
      return company ? { id: company.id, nome: company.nome } : null;
    }
    if (kind === 'station') {
      const station = await this.stationsRepo.findOne({ where: { id } });
      return station ? { id: station.id, siteId: station.siteId } : null;
    }
    const radioLink = await this.radioLinksRepo.findOne({ where: { id } });
    return radioLink ? { id: radioLink.id, nome: radioLink.nome } : null;
  }

  async findDocuments(projectId: number): Promise<ProjectDocument[]> {
    const rows = await this.documentsRepo.find({
      where: { projectId },
      order: { createdAt: 'ASC' },
    });
    return rows.map((entity) => this.toDocument(entity));
  }

  async createDocument(document: ProjectDocument): Promise<ProjectDocument> {
    const entity = this.documentsRepo.create(
      this.toDocumentPersistence(document) as Partial<ProjectDocumentEntity>,
    );
    return this.toDocument(await this.documentsRepo.save(entity));
  }

  async findDocumentById(projectId: number, documentId: number): Promise<ProjectDocument | null> {
    const entity = await this.documentsRepo.findOne({
      where: { id: documentId, projectId },
    });
    return entity ? this.toDocument(entity) : null;
  }

  async saveDocument(document: ProjectDocument): Promise<ProjectDocument> {
    return this.toDocument(
      await this.documentsRepo.save(this.toDocumentPersistence(document) as Partial<ProjectDocumentEntity>),
    );
  }

  async deleteDocument(projectId: number, documentId: number): Promise<boolean> {
    const result = await this.documentsRepo.delete({ id: documentId, projectId });
    return result.affected !== 0;
  }
}
