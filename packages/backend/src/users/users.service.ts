import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User, UserProps } from './domain/user.entity';
import {
  UserRepository,
  UserQuery,
  CurrentUser,
  USER_REPOSITORY,
} from './domain/user.repository';
import {
  isMaster,
  canSeeUser,
  roleRequiresCompany,
  MASTER_ROLE,
  ACTIVE_STATUS,
  INACTIVE_STATUS,
} from './domain/user-rules';
import {
  CreateUserInput,
  UpdateUserInput,
} from './schemas/user.schemas';

export type PublicUser = Omit<User, 'password' | 'resetToken' | 'company'> & {
  companyName: string | null;
};

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly usersRepository: UserRepository,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.usersRepository.findByResetToken(token);
  }

  async create(data: Partial<UserProps>): Promise<User> {
    return this.usersRepository.create(new User(data));
  }

  async update(id: number, data: Partial<UserProps>): Promise<void> {
    await this.usersRepository.update(id, data);
  }

  toPublicUser(user: User): PublicUser {
    const { password, resetToken, company, ...publicUser } = user;
    return { ...publicUser, companyName: company?.nome ?? null };
  }

  async getUserOrFail(id: number): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async getUserVisibleOrFail(id: number, currentUser?: CurrentUser): Promise<User> {
    const user = await this.getUserOrFail(id);
    if (!canSeeUser(user, currentUser)) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  private async assertEmailAvailable(email: string): Promise<void> {
    const existing = await this.usersRepository.findByEmail(email);
    if (existing) throw new ConflictException('Email já cadastrado');
  }

  private assertCanCreateUser(
    currentUser: CurrentUser | undefined,
    role: string,
    companyId: number | null,
  ): void {
    if (currentUser && !isMaster(currentUser)) {
      if (role === MASTER_ROLE) {
        throw new BadRequestException('Somente o administrador master pode criar usuários master.');
      }
      if (currentUser.companyId == null || companyId !== currentUser.companyId) {
        throw new BadRequestException(
          'Usuário não-master só pode criar usuários para a própria empresa.',
        );
      }
    }
  }

  private assertRoleCompany(role: string, companyId: number | null): void {
    if (role === MASTER_ROLE && companyId != null) {
      throw new BadRequestException('Usuário master não deve estar vinculado a uma empresa.');
    }
    if (roleRequiresCompany(role) && companyId == null) {
      throw new BadRequestException('Usuário não-master deve estar vinculado a uma empresa.');
    }
  }

  private async assertCompanyExists(companyId: number): Promise<void> {
    const exists = await this.usersRepository.companyExists(companyId);
    if (!exists) throw new NotFoundException('Empresa não encontrada');
  }

  private assertNotSelfDeactivation(
    id: number,
    currentUser: CurrentUser | undefined,
    status: string | undefined,
  ): void {
    if (currentUser && id === currentUser.id && status === INACTIVE_STATUS) {
      throw new BadRequestException('Não é possível desativar o próprio usuário.');
    }
  }

  private async applyPassword(user: User, password?: string): Promise<void> {
    if (!password) return;
    user.password = await bcrypt.hash(password, 10);
  }

  private applyStatus(user: User, status: string | undefined): void {
    if (status === undefined) return;
    if (user.role === MASTER_ROLE && status === INACTIVE_STATUS) {
      throw new BadRequestException('O administrador master não pode ser desativado.');
    }
    user.status = status;
  }

  private applyRole(user: User, role: string | undefined, currentUser?: CurrentUser): void {
    if (role === undefined) return;
    if (user.role !== MASTER_ROLE && role === MASTER_ROLE && !isMaster(currentUser)) {
      throw new BadRequestException('Somente o administrador master pode promover usuários a master.');
    }
    if (user.role === MASTER_ROLE && role !== MASTER_ROLE) {
      throw new BadRequestException('O perfil master não pode ser alterado para usuário.');
    }
    user.role = role;
  }

  async createUser(dto: CreateUserInput, currentUser?: CurrentUser): Promise<User> {
    await this.assertEmailAvailable(dto.email);

    const role = dto.role ?? 'user';
    const companyId = dto.companyId ?? null;

    this.assertCanCreateUser(currentUser, role, companyId);
    this.assertRoleCompany(role, companyId);
    if (companyId != null) {
      await this.assertCompanyExists(companyId);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.usersRepository.create(
      new User({
        name: dto.name,
        lastName: dto.lastName || null,
        phone: dto.phone || null,
        email: dto.email,
        password: hashedPassword,
        status: role === MASTER_ROLE ? ACTIVE_STATUS : INACTIVE_STATUS,
        role,
        companyId,
      }),
    );
  }

  async findAllPaged(
    query: UserQuery,
    currentUser?: CurrentUser,
  ): Promise<{ data: PublicUser[]; total: number }> {
    const isMasterUser = isMaster(currentUser);
    const companyId = isMasterUser ? undefined : (currentUser?.companyId ?? -1);
    const { data, total } = await this.usersRepository.findAll({
      ...query,
      companyId,
      isMasterUser,
    });
    return { data: data.map((user) => this.toPublicUser(user)), total };
  }

  async updateUser(
    id: number,
    dto: UpdateUserInput,
    currentUser?: CurrentUser,
  ): Promise<User> {
    const user = await this.getUserOrFail(id);
    this.assertNotSelfDeactivation(id, currentUser, dto.status);
    if (dto.email && dto.email !== user.email) {
      await this.assertEmailAvailable(dto.email);
    }

    await this.applyPassword(user, dto.password);
    if (dto.name !== undefined) user.name = dto.name;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.phone !== undefined) user.phone = dto.phone;
    this.applyStatus(user, dto.status);
    this.applyRole(user, dto.role, currentUser);
    if (dto.companyId !== undefined) user.companyId = dto.companyId;

    this.assertRoleCompany(user.role, user.companyId ?? null);
    if (user.companyId != null) {
      await this.assertCompanyExists(user.companyId);
    }

    return this.usersRepository.save(user);
  }

  async deleteUser(id: number): Promise<void> {
    const deleted = await this.usersRepository.delete(id);
    if (!deleted) throw new NotFoundException('Usuário não encontrado');
  }
}
