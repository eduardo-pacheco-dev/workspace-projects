import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../users/infrastructure/user.entity';
import { Company } from '../companies/company.entity';
import { UserAlreadyExistsError } from '../users/create-user.helper';
import { buildDataSource, main, runCreateUser } from '../../scripts/create-user';

describe('scripts/create-user', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'sqljs' as any,
      autoSave: false,
      location: ':memory:',
      entities: [UserEntity, Company],
      synchronize: true,
    });
    await dataSource.initialize();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    await dataSource.getRepository(UserEntity).clear();
  });

  afterEach(() => {
    delete process.env.DB_TYPE;
    jest.restoreAllMocks();
  });

  describe('buildDataSource', () => {
    it('should build a mysql DataSource by default', () => {
      delete process.env.DB_TYPE;
      const ds = buildDataSource();

      expect(ds.options).toMatchObject({
        type: 'mysql',
        entities: expect.arrayContaining([UserEntity, Company]),
      });
    });

    it('should build a sqljs DataSource when DB_TYPE=sqljs', () => {
      process.env.DB_TYPE = 'sqljs';
      const ds = buildDataSource();

      expect((ds.options as any).type).toBe('sqljs');
      expect((ds.options as any).entities).toEqual(expect.arrayContaining([UserEntity, Company]));
    });
  });

  describe('runCreateUser', () => {
    it('should create a user and return a success message', async () => {
      const message = await runCreateUser(dataSource, ['Eduardo', 'edu@example.com', '123456']);

      expect(message).toContain('Eduardo');
      expect(message).toContain('edu@example.com');

      const saved = await dataSource
        .getRepository(UserEntity)
        .findOne({ where: { email: 'edu@example.com' } });
      expect(saved).toBeDefined();
      expect(saved?.name).toBe('Eduardo');
      expect(saved?.role).toBe('master');
      expect(await bcrypt.compare('123456', saved!.password)).toBe(true);
    });

    it('should throw a usage error when fewer than 3 arguments are provided', async () => {
      await expect(runCreateUser(dataSource, ['Eduardo'])).rejects.toThrow(/Uso:/);
    });

    it('should propagate UserAlreadyExistsError for a duplicate email', async () => {
      await runCreateUser(dataSource, ['Eduardo', 'dup@example.com', '123456']);

      await expect(runCreateUser(dataSource, ['Outro', 'dup@example.com', '654321'])).rejects.toThrow(
        UserAlreadyExistsError,
      );
    });
  });

  describe('main', () => {
    it('should print usage and exit when arguments are missing', async () => {
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation((() => {
        throw new Error('exit called');
      }) as any);
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const originalArgv = process.argv;
      process.argv = ['node', 'create-user.ts'];

      try {
        await expect(main()).rejects.toThrow('exit called');
        expect(exitSpy).toHaveBeenCalledWith(1);
        expect(errorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Uso: npx ts-node scripts/create-user.ts'),
        );
      } finally {
        process.argv = originalArgv;
      }
    });
  });
});
