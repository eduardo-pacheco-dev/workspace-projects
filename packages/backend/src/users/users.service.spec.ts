import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './domain/user.entity';
import { USER_REPOSITORY } from './domain/user.repository';
import { CreateUserInput } from './schemas/user.schemas';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;

  const repo = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    findByResetToken: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    findAll: jest.fn(),
    delete: jest.fn(),
    companyExists: jest.fn(),
  };

  const master = { id: 1, role: 'master', companyId: null };
  const regular = { id: 2, role: 'user', companyId: 5 };

  beforeEach(async () => {
    jest.clearAllMocks();
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    repo.companyExists.mockResolvedValue(true);

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: USER_REPOSITORY, useValue: repo },
      ],
    }).compile();

    service = moduleRef.get(UsersService);
  });

  describe('findByEmail', () => {
    it('should return the user for the email', async () => {
      const user = new User({ id: 1, email: 'admin@admin.com' });
      repo.findByEmail.mockResolvedValue(user);

      const result = await service.findByEmail('admin@admin.com');

      expect(repo.findByEmail).toHaveBeenCalledWith('admin@admin.com');
      expect(result).toEqual(user);
    });

    it('should return null when email does not exist', async () => {
      repo.findByEmail.mockResolvedValue(null);
      await expect(service.findByEmail('x@email.com')).resolves.toBeNull();
    });
  });

  describe('findById', () => {
    it('should return the user', async () => {
      const user = new User({ id: 1 });
      repo.findById.mockResolvedValue(user);

      const result = await service.findById(1);

      expect(repo.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(user);
    });
  });

  describe('findByResetToken', () => {
    it('should return the user by reset token', async () => {
      const user = new User({ id: 1, resetToken: 'abc' });
      repo.findByResetToken.mockResolvedValue(user);

      const result = await service.findByResetToken('abc');

      expect(repo.findByResetToken).toHaveBeenCalledWith('abc');
      expect(result).toEqual(user);
    });
  });

  describe('create', () => {
    it('should delegate to the repository', async () => {
      const created = new User({ id: 1, name: 'Admin', email: 'a@admin.com' });
      repo.create.mockResolvedValue(created);

      const result = await service.create({ name: 'Admin', email: 'a@admin.com', password: 'x' });

      expect(repo.create).toHaveBeenCalledWith(expect.any(User));
      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('should delegate to the repository', async () => {
      await service.update(1, { resetToken: 'abc' });

      expect(repo.update).toHaveBeenCalledWith(1, { resetToken: 'abc' });
    });
  });

  describe('toPublicUser', () => {
    it('should strip password and resetToken', () => {
      const user = new User({
        id: 1,
        name: 'Admin',
        email: 'admin@admin.com',
        password: 'secret',
        resetToken: 'token',
      });

      const result = service.toPublicUser(user);

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('resetToken');
      expect(result.email).toBe('admin@admin.com');
    });

    it('should map the company name', () => {
      const user = new User({
        id: 1,
        name: 'Admin',
        email: 'admin@admin.com',
        company: { id: 5, nome: 'Empresa A' },
      });

      expect(service.toPublicUser(user).companyName).toBe('Empresa A');
    });
  });

  describe('getUserOrFail', () => {
    it('should return the user when found', async () => {
      const user = new User({ id: 1 });
      repo.findById.mockResolvedValue(user);
      await expect(service.getUserOrFail(1)).resolves.toEqual(user);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.getUserOrFail(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserVisibleOrFail', () => {
    it('should return the user for a master', async () => {
      const user = new User({ id: 1, role: 'master', companyId: null });
      repo.findById.mockResolvedValue(user);

      await expect(service.getUserVisibleOrFail(1, master)).resolves.toEqual(user);
    });

    it('should return a same-company non-master user for a regular user', async () => {
      const user = new User({ id: 3, role: 'user', companyId: 5 });
      repo.findById.mockResolvedValue(user);

      await expect(service.getUserVisibleOrFail(3, regular)).resolves.toEqual(user);
    });

    it('should hide a master from a regular user', async () => {
      const user = new User({ id: 1, role: 'master', companyId: null });
      repo.findById.mockResolvedValue(user);

      await expect(service.getUserVisibleOrFail(1, regular)).rejects.toThrow(NotFoundException);
    });

    it('should hide a user from another company', async () => {
      const user = new User({ id: 3, role: 'user', companyId: 99 });
      repo.findById.mockResolvedValue(user);

      await expect(service.getUserVisibleOrFail(3, regular)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createUser', () => {
    it('should create a regular user with default role and status inactive', async () => {
      repo.findByEmail.mockResolvedValue(null);
      const created = new User({
        id: 3,
        email: 'joao@email.com',
        role: 'user',
        companyId: 5,
        status: 'inactive',
      });
      repo.create.mockResolvedValue(created);

      const dto: CreateUserInput = {
        name: 'João',
        lastName: 'Silva',
        email: 'joao@email.com',
        password: '123456',
        companyId: 5,
      };

      const result = await service.createUser(dto, master);

      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'joao@email.com',
          role: 'user',
          status: 'inactive',
          companyId: 5,
        }),
      );
      expect(result).toEqual(created);
    });

    it('should throw ConflictException for duplicate email', async () => {
      repo.findByEmail.mockResolvedValue(new User({ id: 9, email: 'duplicado@email.com' }));

      await expect(
        service.createUser(
          { name: 'X', email: 'duplicado@email.com', password: '123456' },
          master,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('should prevent non-master from creating a master', async () => {
      repo.findByEmail.mockResolvedValue(null);

      await expect(
        service.createUser(
          { name: 'X', email: 'x@email.com', password: '123456', role: 'master' },
          regular,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should prevent non-master from creating a user for another company', async () => {
      repo.findByEmail.mockResolvedValue(null);

      await expect(
        service.createUser(
          { name: 'X', email: 'x@email.com', password: '123456', companyId: 99 },
          regular,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow non-master to create a user for their own company', async () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.create.mockResolvedValue(new User({ id: 4, role: 'user', companyId: 5 }));

      const result = await service.createUser(
        { name: 'Y', email: 'y@email.com', password: '123456', companyId: 5 },
        regular,
      );

      expect(result).toEqual(expect.objectContaining({ companyId: 5, role: 'user' }));
    });

    it('should allow master to create another master', async () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.create.mockResolvedValue(new User({ id: 5, role: 'master', companyId: null }));

      const result = await service.createUser(
        { name: 'M', email: 'm@email.com', password: '123456', role: 'master' },
        master,
      );

      expect(result.role).toBe('master');
      expect(result.companyId).toBeNull();
    });

    it('should require a company for a non-master role', async () => {
      repo.findByEmail.mockResolvedValue(null);

      await expect(
        service.createUser({ name: 'X', email: 'x@email.com', password: '123456' }, master),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when the company does not exist', async () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.companyExists.mockResolvedValue(false);

      await expect(
        service.createUser(
          { name: 'X', email: 'x@email.com', password: '123456', companyId: 999 },
          master,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllPaged', () => {
    it('should delegate without a company filter for master', async () => {
      const data = [new User({ id: 1, email: 'admin@admin.com', password: 'x' })];
      repo.findAll.mockResolvedValue({ data, total: 1 });

      const result = await service.findAllPaged({ page: 1, limit: 10 }, master);

      expect(repo.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        companyId: undefined,
        isMasterUser: true,
      });
      expect(result.total).toBe(1);
      expect(result.data[0]).not.toHaveProperty('password');
    });

    it('should pass search and sort through', async () => {
      repo.findAll.mockResolvedValue({ data: [], total: 0 });

      await service.findAllPaged({ search: 'joao', sortBy: 'name', sortOrder: 'DESC' }, master);

      expect(repo.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'joao', sortBy: 'name', sortOrder: 'DESC' }),
      );
    });

    it('should filter by company for non-master users', async () => {
      repo.findAll.mockResolvedValue({ data: [], total: 0 });

      await service.findAllPaged({ page: 1, limit: 10 }, regular);

      expect(repo.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        companyId: 5,
        isMasterUser: false,
      });
    });
  });

  describe('updateUser', () => {
    it('should update user fields', async () => {
      const user = new User({ id: 3, name: 'Antigo', email: 'a@email.com', role: 'user', companyId: 5, status: 'active' });
      repo.findById.mockResolvedValue(user);
      repo.save.mockImplementation(async (u) => u);

      const result = await service.updateUser(3, { name: 'Novo' }, master);

      expect(result.name).toBe('Novo');
      expect(repo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException for a missing user', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.updateUser(99, { name: 'X' }, master)).rejects.toThrow(NotFoundException);
    });

    it('should hash the new password', async () => {
      const user = new User({ id: 3, email: 'a@email.com', role: 'user', companyId: 5, status: 'active' });
      repo.findById.mockResolvedValue(user);
      repo.save.mockImplementation(async (u) => u);

      await service.updateUser(3, { password: 'nova123' }, master);

      expect(bcrypt.hash).toHaveBeenCalledWith('nova123', 10);
    });

    it('should prevent deactivating your own account', async () => {
      const user = new User({ id: 2, email: 'u@email.com', role: 'user', companyId: 5, status: 'active' });
      repo.findById.mockResolvedValue(user);

      await expect(
        service.updateUser(2, { status: 'inactive' }, regular),
      ).rejects.toThrow(BadRequestException);
    });

    it('should prevent deactivating a master', async () => {
      const user = new User({ id: 1, email: 'm@email.com', role: 'master', companyId: null, status: 'active' });
      repo.findById.mockResolvedValue(user);

      await expect(service.updateUser(1, { status: 'inactive' }, master)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException for a duplicate email', async () => {
      const user = new User({ id: 1, email: 'a@email.com', role: 'user', companyId: 5 });
      repo.findById.mockResolvedValue(user);
      repo.findByEmail.mockResolvedValue(new User({ id: 2, email: 'b@email.com' }));

      await expect(service.updateUser(1, { email: 'b@email.com' }, master)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should prevent non-master from promoting to master', async () => {
      const user = new User({ id: 3, email: 'u@email.com', role: 'user', companyId: 5, status: 'active' });
      repo.findById.mockResolvedValue(user);

      await expect(service.updateUser(3, { role: 'master' }, regular)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should allow master to promote another user to master', async () => {
      const user = new User({ id: 3, email: 'u@email.com', role: 'user', companyId: 5, status: 'active' });
      repo.findById.mockResolvedValue(user);
      repo.save.mockImplementation(async (u) => u);

      const result = await service.updateUser(3, { role: 'master', companyId: null }, master);

      expect(result.role).toBe('master');
      expect(result.companyId).toBeNull();
    });

    it('should prevent demoting a master to user', async () => {
      const user = new User({ id: 1, email: 'm@email.com', role: 'master', companyId: null, status: 'active' });
      repo.findById.mockResolvedValue(user);

      await expect(service.updateUser(1, { role: 'user' }, master)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should prevent removing the company from a non-master user', async () => {
      const user = new User({ id: 3, email: 'u@email.com', role: 'user', companyId: 5, status: 'active' });
      repo.findById.mockResolvedValue(user);

      await expect(service.updateUser(3, { companyId: null }, master)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete an existing user', async () => {
      repo.delete.mockResolvedValue(true);
      await expect(service.deleteUser(3)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      repo.delete.mockResolvedValue(false);
      await expect(service.deleteUser(99)).rejects.toThrow(NotFoundException);
    });
  });
});
