import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Client, ClientProps } from '../domain/client.entity';
import { Responsavel, ResponsavelProps } from '../domain/responsavel.entity';
import {
  ClientRepository,
  ClientQuery,
  PaginatedClients,
} from '../domain/client.repository';
import { ClientEntity } from './client.entity';
import { ResponsavelEntity } from './responsavel.entity';

const CLIENT_FIELDS = [
  'id',
  'nome',
  'documento',
  'email',
  'telefone',
  'endereco',
  'cidade',
  'uf',
  'observacoes',
  'status',
  'createdAt',
  'updatedAt',
] as const;

const CLIENT_PERSISTENCE_FIELDS = CLIENT_FIELDS.filter(
  (field) => field !== 'createdAt' && field !== 'updatedAt',
);

const RESPONSAVEL_FIELDS = [
  'id',
  'clientId',
  'nome',
  'sobrenome',
  'email',
  'telefone',
  'funcao',
  'createdAt',
  'updatedAt',
] as const;

const RESPONSAVEL_PERSISTENCE_FIELDS = RESPONSAVEL_FIELDS.filter(
  (field) => field !== 'createdAt' && field !== 'updatedAt',
);

const SEARCH_CLAUSE =
  'c.nome LIKE :search OR c.documento LIKE :search OR c.email LIKE :search OR c.telefone LIKE :search OR c.cidade LIKE :search';

const ALLOWED_SORT_COLUMNS = [
  'id',
  'nome',
  'documento',
  'email',
  'telefone',
  'cidade',
  'status',
  'createdAt',
];

@Injectable()
export class TypeOrmClientRepository implements ClientRepository {
  constructor(
    @InjectRepository(ClientEntity)
    private readonly clientsRepo: Repository<ClientEntity>,
    @InjectRepository(ResponsavelEntity)
    private readonly responsaveisRepo: Repository<ResponsavelEntity>,
  ) {}

  private toClient(entity: ClientEntity): Client {
    const props: Record<string, unknown> = {};
    for (const field of CLIENT_FIELDS) {
      props[field] = (entity as unknown as Record<string, unknown>)[field];
    }
    return new Client(props as unknown as ClientProps);
  }

  private toClientPersistence(client: Client): Partial<ClientEntity> {
    const entity: Record<string, unknown> = {};
    for (const field of CLIENT_PERSISTENCE_FIELDS) {
      entity[field] = (client as unknown as Record<string, unknown>)[field] ?? null;
    }
    return entity as Partial<ClientEntity>;
  }

  private toResponsavel(entity: ResponsavelEntity): Responsavel {
    const props: Record<string, unknown> = {};
    for (const field of RESPONSAVEL_FIELDS) {
      props[field] = (entity as unknown as Record<string, unknown>)[field];
    }
    return new Responsavel(props as unknown as ResponsavelProps);
  }

  private toResponsavelPersistence(responsavel: Responsavel): Partial<ResponsavelEntity> {
    const entity: Record<string, unknown> = {};
    for (const field of RESPONSAVEL_PERSISTENCE_FIELDS) {
      entity[field] = (responsavel as unknown as Record<string, unknown>)[field] ?? null;
    }
    return entity as Partial<ResponsavelEntity>;
  }

  private applySearchFilter(
    qb: SelectQueryBuilder<ClientEntity>,
    search: string | undefined,
    status: string | undefined,
  ): void {
    if (!search) return;
    const clause = `(${SEARCH_CLAUSE})`;
    if (status) {
      qb.andWhere(clause, { search: `%${search}%` });
    } else {
      qb.where(clause, { search: `%${search}%` });
    }
  }

  private applyStatusFilter(
    qb: SelectQueryBuilder<ClientEntity>,
    status: string | undefined,
  ): void {
    if (!status) return;
    qb.andWhere('c.status = :status', { status });
  }

  async create(client: Client): Promise<Client> {
    const entity = this.clientsRepo.create(this.toClientPersistence(client) as Partial<ClientEntity>);
    return this.toClient(await this.clientsRepo.save(entity));
  }

  async save(client: Client): Promise<Client> {
    return this.toClient(await this.clientsRepo.save(this.toClientPersistence(client) as Partial<ClientEntity>));
  }

  async findAll(query: ClientQuery): Promise<PaginatedClients> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'ASC' as 'ASC' | 'DESC',
      search,
      status,
    } = query;

    const qb = this.clientsRepo.createQueryBuilder('c');

    this.applyStatusFilter(qb, status);
    this.applySearchFilter(qb, search, status);

    const safeSort = ALLOWED_SORT_COLUMNS.includes(sortBy) ? sortBy : 'id';
    const safeOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const [data, total] = await qb
      .orderBy(`c.${safeSort}`, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: data.map((entity) => this.toClient(entity)), total };
  }

  async findById(id: number): Promise<Client | null> {
    const entity = await this.clientsRepo.findOne({ where: { id } });
    return entity ? this.toClient(entity) : null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.clientsRepo.delete(id);
    return result.affected !== 0;
  }

  async findResponsaveisByClient(clientId: number): Promise<Responsavel[]> {
    const rows = await this.responsaveisRepo.find({
      where: { clientId },
      order: { nome: 'ASC' },
    });
    return rows.map((entity) => this.toResponsavel(entity));
  }

  async createResponsavel(responsavel: Responsavel): Promise<Responsavel> {
    const entity = this.responsaveisRepo.create(
      this.toResponsavelPersistence(responsavel) as Partial<ResponsavelEntity>,
    );
    return this.toResponsavel(await this.responsaveisRepo.save(entity));
  }

  async saveResponsavel(responsavel: Responsavel): Promise<Responsavel> {
    return this.toResponsavel(
      await this.responsaveisRepo.save(
        this.toResponsavelPersistence(responsavel) as Partial<ResponsavelEntity>,
      ),
    );
  }

  async findResponsavelById(id: number): Promise<Responsavel | null> {
    const entity = await this.responsaveisRepo.findOne({ where: { id } });
    return entity ? this.toResponsavel(entity) : null;
  }

  async deleteResponsavel(id: number): Promise<boolean> {
    const result = await this.responsaveisRepo.delete(id);
    return result.affected !== 0;
  }
}
