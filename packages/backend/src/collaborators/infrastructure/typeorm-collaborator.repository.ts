import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Company } from '../../companies/company.entity';
import { Collaborator, CollaboratorProps } from '../domain/collaborator.entity';
import {
  CollaboratorRepository,
  CollaboratorQuery,
  PaginatedCollaborators,
} from '../domain/collaborator.repository';
import { CollaboratorEntity } from './collaborator.entity';

const SCALAR_FIELDS = [
  'id',
  'isFreelancer',
  'codigo',
  'nome',
  'cpf',
  'cargo',
  'email',
  'telefone',
  'endereco',
  'cidade',
  'uf',
  'dataAdmissao',
  'status',
  'companyId',
  'userId',
  'razaoSocial',
  'tipoContrato',
  'regional',
  'funcao',
  'foto',
  'firstName',
  'lastName',
  'birthDate',
  'rg',
  'orgaoEmissor',
  'naturalidade',
  'sexo',
  'cnpj',
  'tituloEleitor',
  'rgArquivo',
  'carteiraArquivo',
  'habilitacaoArquivo',
  'nr10Arquivo',
  'nr35Arquivo',
  'asoArquivo',
  'epiArquivo',
  'ordemServicoArquivo',
  'contratoArquivo',
  'cnh',
  'cnhValidade',
  'pis',
  'phone',
  'whatsapp',
  'contatoEmergenciaNome',
  'contatoEmergenciaTelefone',
  'contatoEmergenciaParentesco',
  'cep',
  'banco',
  'agencia',
  'conta',
  'tipoConta',
  'pix',
  'titular',
  'trainings',
  'dataAso',
  'dataNr06',
  'dataNr35',
  'dataNr10',
  'dataNr75',
  'dataNr01',
  'dataIntegracao',
  'dataListaFerramental',
  'cracha',
  'dataHs',
  'dataLtw',
  'dataCadastroNokia',
  'dataCadastroEricsson',
  'dataCadastroTelebit',
  'vencimentoAso',
  'vencimentoNr35',
  'vencimentoNr10',
  'uniforms',
  'epis',
  'bio',
  'hourlyRate',
  'skills',
  'portfolio',
  'experienceLevel',
  'availability',
  'createdAt',
  'updatedAt',
] as const;

const PERSISTENCE_FIELDS = SCALAR_FIELDS.filter(
  (field) => field !== 'createdAt' && field !== 'updatedAt',
);

const SEARCH_CLAUSE =
  'c.nome LIKE :search OR c.firstName LIKE :search OR c.lastName LIKE :search OR c.cpf LIKE :search OR c.email LIKE :search OR c.telefone LIKE :search OR c.cargo LIKE :search';

const ALLOWED_SORT_COLUMNS = [
  'id',
  'nome',
  'cpf',
  'cargo',
  'email',
  'telefone',
  'status',
  'createdAt',
  'firstName',
  'lastName',
  'hourlyRate',
  'experienceLevel',
  'availability',
];

@Injectable()
export class TypeOrmCollaboratorRepository implements CollaboratorRepository {
  constructor(
    @InjectRepository(CollaboratorEntity)
    private readonly repo: Repository<CollaboratorEntity>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
  ) {}

  private toDomain(entity: CollaboratorEntity): Collaborator {
    const props: Record<string, unknown> = {};
    for (const field of SCALAR_FIELDS) {
      props[field] = (entity as unknown as Record<string, unknown>)[field];
    }
    if (entity.company) {
      props.company = { id: entity.company.id, nome: entity.company.nome };
    }
    return new Collaborator(props as CollaboratorProps);
  }

  private toPersistence(collaborator: Collaborator): Partial<CollaboratorEntity> {
    const entity: Record<string, unknown> = {};
    for (const field of PERSISTENCE_FIELDS) {
      entity[field] = (collaborator as unknown as Record<string, unknown>)[field] ?? null;
    }
    return entity as Partial<CollaboratorEntity>;
  }

  async companyExists(companyId: number): Promise<boolean> {
    const company = await this.companiesRepository.findOne({ where: { id: companyId } });
    return Boolean(company);
  }

  async save(collaborator: Collaborator): Promise<Collaborator> {
    const saved = await this.repo.save(this.toPersistence(collaborator) as CollaboratorEntity);
    return this.toDomain(saved);
  }

  private applyCompanyFilter(
    qb: SelectQueryBuilder<CollaboratorEntity>,
    companyId: number | undefined,
  ): void {
    if (companyId !== undefined) {
      qb.where('c.companyId = :companyId', { companyId });
    }
  }

  private applyFreelancerFilter(
    qb: SelectQueryBuilder<CollaboratorEntity>,
    isFreelancer: boolean | undefined,
    companyId: number | undefined,
  ): void {
    if (isFreelancer === undefined) return;
    const clause = 'c.isFreelancer = :isFreelancer';
    const parameters = { isFreelancer };
    if (companyId !== undefined) {
      qb.andWhere(clause, parameters);
    } else {
      qb.where(clause, parameters);
    }
  }

  private applySearchFilter(
    qb: SelectQueryBuilder<CollaboratorEntity>,
    search: string | undefined,
    companyId: number | undefined,
    isFreelancer: boolean | undefined,
  ): void {
    if (!search) return;
    const clause = `(${SEARCH_CLAUSE})`;
    const parameters = { search: `%${search}%` };
    const hasPriorWhere = companyId !== undefined || isFreelancer !== undefined;
    if (hasPriorWhere) {
      qb.andWhere(clause, parameters);
    } else {
      qb.where(clause, parameters);
    }
  }

  async findAll(query: CollaboratorQuery): Promise<PaginatedCollaborators> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'ASC' as 'ASC' | 'DESC',
      search,
      isFreelancer,
      companyId,
    } = query;

    const qb = this.repo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.company', 'company');

    this.applyCompanyFilter(qb, companyId);
    this.applyFreelancerFilter(qb, isFreelancer, companyId);
    this.applySearchFilter(qb, search, companyId, isFreelancer);

    const safeSort = ALLOWED_SORT_COLUMNS.includes(sortBy) ? sortBy : 'id';
    const safeOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const [data, total] = await qb
      .orderBy(`c.${safeSort}`, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: data.map((entity) => this.toDomain(entity)), total };
  }

  async findById(id: number): Promise<Collaborator | null> {
    const entity = await this.repo.findOne({ where: { id }, relations: ['company'] });
    return entity ? this.toDomain(entity) : null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    return result.affected !== 0;
  }
}
