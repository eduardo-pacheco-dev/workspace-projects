import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Company } from '../../companies/company.entity';
import { User, UserProps } from '../domain/user.entity';
import {
  UserRepository,
  UserQuery,
  PaginatedUsers,
} from '../domain/user.repository';
import { UserEntity } from './user.entity';

const SCALAR_FIELDS = [
  'id',
  'name',
  'lastName',
  'phone',
  'status',
  'email',
  'password',
  'resetToken',
  'role',
  'tokenVersion',
  'companyId',
  'createdAt',
  'updatedAt',
] as const;

const SEARCH_CLAUSE =
  'u.name LIKE :search OR u.lastName LIKE :search OR u.email LIKE :search OR u.phone LIKE :search';

const ALLOWED_SORT_COLUMNS = ['id', 'name', 'lastName', 'email', 'phone', 'status', 'createdAt'];

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
  ) {}

  private toDomain(entity: UserEntity): User {
    const props: Record<string, unknown> = {};
    for (const field of SCALAR_FIELDS) {
      props[field] = (entity as unknown as Record<string, unknown>)[field];
    }
    if (entity.company) {
      props.company = { id: entity.company.id, nome: entity.company.nome };
    }
    return new User(props as UserProps);
  }

  private toPersistence(user: User): Partial<UserEntity> {
    const entity: Record<string, unknown> = {};
    for (const field of SCALAR_FIELDS) {
      if (field === 'createdAt' || field === 'updatedAt') continue;
      entity[field] = (user as unknown as Record<string, unknown>)[field] ?? null;
    }
    return entity as Partial<UserEntity>;
  }

  private toPartialPersistence(data: Partial<UserProps>): Partial<UserEntity> {
    const entity: Record<string, unknown> = {};
    for (const field of SCALAR_FIELDS) {
      if (field === 'createdAt' || field === 'updatedAt') continue;
      if (data[field as keyof UserProps] !== undefined) {
        entity[field] = data[field as keyof UserProps];
      }
    }
    return entity as Partial<UserEntity>;
  }

  private applyPermissionFilter(
    qb: SelectQueryBuilder<UserEntity>,
    isMasterUser: boolean,
    companyId: number | undefined,
  ): void {
    if (isMasterUser) return;
    qb.where('u.role != :role', { role: 'master' }).andWhere('u.companyId = :companyId', {
      companyId: companyId ?? -1,
    });
  }

  private applySearchFilter(
    qb: SelectQueryBuilder<UserEntity>,
    search: string | undefined,
    isMasterUser: boolean,
  ): void {
    if (!search) return;
    const clause = `(${SEARCH_CLAUSE})`;
    const parameters = { search: `%${search}%` };
    if (isMasterUser) {
      qb.where(clause, parameters);
    } else {
      qb.andWhere(clause, parameters);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repo.findOne({ where: { email }, relations: ['company'] });
    return entity ? this.toDomain(entity) : null;
  }

  async findById(id: number): Promise<User | null> {
    const entity = await this.repo.findOne({ where: { id }, relations: ['company'] });
    return entity ? this.toDomain(entity) : null;
  }

  async findByResetToken(token: string): Promise<User | null> {
    const entity = await this.repo.findOne({ where: { resetToken: token }, relations: ['company'] });
    return entity ? this.toDomain(entity) : null;
  }

  async create(user: User): Promise<User> {
    const entity = this.repo.create(this.toPersistence(user) as Partial<UserEntity>);
    return this.toDomain(await this.repo.save(entity));
  }

  async save(user: User): Promise<User> {
    return this.toDomain(await this.repo.save(this.toPersistence(user) as Partial<UserEntity>));
  }

  async update(id: number, data: Partial<UserProps>): Promise<void> {
    await this.repo.update(id, this.toPartialPersistence(data));
  }

  async findAll(query: UserQuery): Promise<PaginatedUsers> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'ASC' as 'ASC' | 'DESC',
      search,
      companyId,
      isMasterUser = true,
    } = query;

    const qb = this.repo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.company', 'company');

    this.applyPermissionFilter(qb, isMasterUser, companyId);
    this.applySearchFilter(qb, search, isMasterUser);

    const safeSort = ALLOWED_SORT_COLUMNS.includes(sortBy) ? sortBy : 'id';
    const safeOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const [data, total] = await qb
      .orderBy(`u.${safeSort}`, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: data.map((entity) => this.toDomain(entity)), total };
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    return result.affected !== 0;
  }

  async companyExists(companyId: number): Promise<boolean> {
    const company = await this.companiesRepository.findOne({ where: { id: companyId } });
    return Boolean(company);
  }
}
