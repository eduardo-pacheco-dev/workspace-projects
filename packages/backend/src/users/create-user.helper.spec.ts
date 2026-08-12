import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './infrastructure/user.entity';
import { Company } from '../companies/company.entity';
import { createUser, UserAlreadyExistsError } from './create-user.helper';

describe('createUser (helper)', () => {
  let dataSource: DataSource;
  let repo: Repository<UserEntity>;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'sqljs' as any,
      autoSave: false,
      location: ':memory:',
      entities: [UserEntity, Company],
      synchronize: true,
    });
    await dataSource.initialize();
    repo = dataSource.getRepository(UserEntity);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    await repo.clear();
  });

  it('should create a master user with a hashed password', async () => {
    const user = await createUser(repo, 'Admin', 'admin@example.com', '123456');

    expect(user.name).toBe('Admin');
    expect(user.email).toBe('admin@example.com');
    expect(user.role).toBe('master');
    expect(user.companyId).toBeNull();
    expect(user.password).not.toBe('123456');
    expect(await bcrypt.compare('123456', user.password)).toBe(true);
  });

  it('should persist the user in the repository', async () => {
    await createUser(repo, 'João', 'joao@example.com', 'senha123');

    const saved = await repo.findOne({ where: { email: 'joao@example.com' } });
    expect(saved).toBeDefined();
    expect(saved?.name).toBe('João');
    expect(saved?.role).toBe('master');
  });

  it('should throw UserAlreadyExistsError when the email already exists', async () => {
    await createUser(repo, 'Primeiro', 'dup@example.com', 'senha1');

    await expect(createUser(repo, 'Segundo', 'dup@example.com', 'senha2')).rejects.toThrow(
      UserAlreadyExistsError,
    );

    const users = await repo.find({ where: { email: 'dup@example.com' } });
    expect(users).toHaveLength(1);
  });
});
