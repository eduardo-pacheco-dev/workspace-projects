import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { Company } from '../companies/company.entity';
import {
  CreateUserInput,
  UpdateUserInput,
} from './schemas/user.schemas';

export type PublicUser = Omit<User, 'password' | 'resetToken'>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
  ) {}

  private readonly generalAdminEmail = process.env.ADMIN_EMAIL || 'admin@admin.com';

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { resetToken: token } });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  async update(id: number, data: Partial<User>): Promise<void> {
    await this.usersRepository.update(id, data);
  }

  toPublicUser(user: User): PublicUser {
    const { password, resetToken, ...publicUser } = user;
    return publicUser;
  }

  async getUserOrFail(id: number): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async createUser(dto: CreateUserInput): Promise<User> {
    const existing = await this.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email já cadastrado');

    const role = dto.role ?? 'user';
    const companyId = dto.companyId ?? null;

    if (role === 'master' && dto.email !== this.generalAdminEmail) {
      throw new BadRequestException('O perfil master é exclusivo do administrador geral.');
    }
    if (role === 'user' && companyId == null) {
      throw new BadRequestException('Usuário não-master deve estar vinculado a uma empresa.');
    }
    if (companyId != null) {
      await this.ensureCompany(companyId);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepository.create({
      name: dto.name,
      lastName: dto.lastName || null,
      phone: dto.phone || null,
      email: dto.email,
      password: hashedPassword,
      status: 'inactive',
      role,
      companyId,
    });
    return this.usersRepository.save(user);
  }

  private async ensureCompany(companyId: number) {
    const company = await this.companiesRepository.findOne({ where: { id: companyId } });
    if (!company) throw new NotFoundException('Empresa não encontrada');
  }

  async findAllPaged(query: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    search?: string;
  }): Promise<{ data: PublicUser[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'ASC' as 'ASC' | 'DESC',
      search,
    } = query;

    const qb = this.usersRepository.createQueryBuilder('u');

    if (search) {
      qb.where(
        'u.name LIKE :search OR u.lastName LIKE :search OR u.email LIKE :search OR u.phone LIKE :search',
        { search: `%${search}%` },
      );
    }

    const allowedSort = ['id', 'name', 'lastName', 'email', 'phone', 'status', 'createdAt'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'id';
    const safeOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const [data, total] = await qb
      .orderBy(`u.${safeSort}`, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: data.map((u) => this.toPublicUser(u)), total };
  }

  async updateUser(id: number, dto: UpdateUserInput, currentUserId?: number): Promise<User> {
    const user = await this.getUserOrFail(id);

    if (currentUserId !== undefined && id === currentUserId && dto.status === 'inactive') {
      throw new BadRequestException('Não é possível desativar o próprio usuário.');
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.findByEmail(dto.email);
      if (existing) throw new ConflictException('Email já cadastrado');
    }

    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 10);
    }
    if (dto.name !== undefined) user.name = dto.name;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.status !== undefined) {
      if (user.role === 'master' && dto.status === 'inactive') {
        throw new BadRequestException('O administrador master não pode ser desativado.');
      }
      user.status = dto.status;
    }
    if (dto.role !== undefined) {
      if (user.role !== 'master' && dto.role === 'master' && user.email !== this.generalAdminEmail) {
        throw new BadRequestException('O perfil master é exclusivo do administrador geral.');
      }
      if (user.role === 'master' && dto.role !== 'master') {
        throw new BadRequestException('O perfil master não pode ser alterado para usuário.');
      }
      user.role = dto.role;
    }
    if (dto.companyId !== undefined) user.companyId = dto.companyId;

    if (user.role === 'user' && user.companyId == null) {
      throw new BadRequestException('Usuário não-master deve estar vinculado a uma empresa.');
    }
    if (user.companyId != null) {
      await this.ensureCompany(user.companyId);
    }

    return this.usersRepository.save(user);
  }

  async deleteUser(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Usuário não encontrado');
  }
}
