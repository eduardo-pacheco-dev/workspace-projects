import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { Company } from '../../companies/company.entity';
import { TypeOrmUserRepository } from './typeorm-user.repository';
import { User } from '../domain/user.entity';

describe('TypeOrmUserRepository', () => {
  let repository: TypeOrmUserRepository;
  let userRepo: Repository<UserEntity>;
  let moduleRef: TestingModule;
  let companyId: number;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqljs',
          autoSave: false,
          location: ':memory:',
          entities: [UserEntity, Company],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([UserEntity, Company]),
      ],
      providers: [TypeOrmUserRepository],
    }).compile();

    repository = moduleRef.get(TypeOrmUserRepository);
    userRepo = moduleRef.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    const companyRepo = moduleRef.get<Repository<Company>>(getRepositoryToken(Company));
    const company = await companyRepo.save({ nome: 'Empresa A' });
    companyId = company.id;
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  const createUser = (props: Partial<UserEntity>) =>
    repository.create(new User({ name: 'João', email: 'joao@email.com', password: 'x', role: 'user', companyId, ...props }));

  describe('create', () => {
    it('should persist a user and return the domain object', async () => {
      const user = await repository.create(
        new User({ name: 'Maria', email: 'maria@email.com', password: 'secret', role: 'master', companyId: null }),
      );

      expect(user.id).toBeDefined();
      expect(user.name).toBe('Maria');
      expect(user.role).toBe('master');
      const saved = await userRepo.findOne({ where: { id: user.id } });
      expect(saved?.email).toBe('maria@email.com');
    });
  });

  describe('findByEmail', () => {
    it('should return the user with the company relation', async () => {
      await createUser({ email: 'busca@email.com' });

      const user = await repository.findByEmail('busca@email.com');

      expect(user?.email).toBe('busca@email.com');
      expect(user?.company?.nome).toBe('Empresa A');
    });
  });

  describe('findById', () => {
    it('should return the user when found', async () => {
      const created = await createUser({ email: 'byid@email.com' });

      const user = await repository.findById(created.id!);

      expect(user?.id).toBe(created.id);
    });
  });

  describe('update', () => {
    it('should update only the provided fields', async () => {
      const created = await createUser({ email: 'upd@email.com' });
      await repository.update(created.id!, { resetToken: 'token-123' });

      const saved = await userRepo.findOne({ where: { id: created.id } });
      expect(saved?.resetToken).toBe('token-123');
      expect(saved?.name).toBe('João');
    });

    it('should persist null values for provided nullable fields', async () => {
      const created = await createUser({ email: 'null@email.com', resetToken: 'old' });
      await repository.update(created.id!, { resetToken: null, password: 'nova' });

      const saved = await userRepo.findOne({ where: { id: created.id } });
      expect(saved?.resetToken).toBeNull();
      expect(saved?.password).toBe('nova');
    });
  });

  describe('findByResetToken', () => {
    it('should return the user by reset token', async () => {
      const created = await createUser({ email: 'reset@email.com' });
      await repository.update(created.id!, { resetToken: 'token-abc' });

      const user = await repository.findByResetToken('token-abc');

      expect(user?.id).toBe(created.id);
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      await userRepo.clear();
      await createUser({ email: 'master@email.com', role: 'master', companyId: null });
      await createUser({ email: 'joao.a@email.com', companyId });
      await createUser({ email: 'joao.b@email.com', companyId });
    });

    it('should return all users for a master', async () => {
      const { data, total } = await repository.findAll({ isMasterUser: true });

      expect(total).toBe(3);
      expect(data.every((u) => u.password)).toBe(true);
    });

    it('should filter by company and exclude masters for non-master', async () => {
      const { data, total } = await repository.findAll({ isMasterUser: false, companyId });

      expect(total).toBe(2);
      expect(data.every((u) => u.role !== 'master')).toBe(true);
    });

    it('should apply search for master with where', async () => {
      const { total } = await repository.findAll({ isMasterUser: true, search: 'master' });

      expect(total).toBe(1);
    });

    it('should apply search as andWhere for non-master', async () => {
      const { data, total } = await repository.findAll({
        isMasterUser: false,
        companyId,
        search: 'joao',
      });

      expect(total).toBe(2);
      expect(data.every((u) => u.role !== 'master')).toBe(true);
    });
  });

  describe('delete', () => {
    it('should return true when the user is deleted', async () => {
      const created = await createUser({ email: 'del@email.com' });

      await expect(repository.delete(created.id!)).resolves.toBe(true);
    });

    it('should return false when the user does not exist', async () => {
      await expect(repository.delete(99999)).resolves.toBe(false);
    });
  });

  describe('companyExists', () => {
    it('should return true for an existing company', async () => {
      await expect(repository.companyExists(companyId)).resolves.toBe(true);
    });

    it('should return false for a missing company', async () => {
      await expect(repository.companyExists(99999)).resolves.toBe(false);
    });
  });
});
