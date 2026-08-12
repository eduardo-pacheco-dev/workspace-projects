import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import request from 'supertest';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { buildResetToken } from './reset-token';
import { AuditLogger } from '../common/audit/audit-logger';
import { UsersService } from '../users/users.service';
import { USER_REPOSITORY } from '../users/domain/user.repository';
import { UserEntity } from '../users/infrastructure/user.entity';
import { TypeOrmUserRepository } from '../users/infrastructure/typeorm-user.repository';
import { Company } from '../companies/company.entity';

describe('AuthController (integration)', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let userRepo: Repository<UserEntity>;

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
        JwtModule.register({
          secret: 'test-secret-0123456789abcdef0123456789abcdef',
          signOptions: { expiresIn: '1d' },
        }),
        ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 100 }]),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        UsersService,
        { provide: USER_REPOSITORY, useClass: TypeOrmUserRepository },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
        {
          provide: AuditLogger,
          useValue: {
            loginSuccess: jest.fn(),
            loginFailure: jest.fn(),
            accountLocked: jest.fn(),
            passwordReset: jest.fn(),
            register: jest.fn(),
          },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    userRepo = moduleRef.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    const companyRepo = moduleRef.get<Repository<Company>>(getRepositoryToken(Company));
    await companyRepo.save({ nome: 'Empresa A' });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await userRepo.clear();
  });

  describe('POST /auth/register', () => {
    it('should register an inactive user awaiting activation and return a generic message', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Maria', lastName: 'Souza', email: 'maria@email.com', password: 'Senha123' })
        .expect(201);

      expect(res.body.message).toContain('Registration');

      const saved = await userRepo.findOne({ where: { email: 'maria@email.com' } });
      expect(saved?.status).toBe('inactive');
      expect(saved?.role).toBe('user');
    });

    it('should not reveal whether the email is already registered', async () => {
      await userRepo.save({
        name: 'Maria',
        email: 'dup@email.com',
        password: 'x',
        role: 'user',
        status: 'active',
      });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Outro', email: 'dup@email.com', password: 'Senha123' })
        .expect(201);

      expect(res.body.message).toContain('Registration');
      const count = await userRepo.count({ where: { email: 'dup@email.com' } });
      expect(count).toBe(1);
    });

    it('should reject a weak password', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Fulano', email: 'fulano@email.com', password: '123' })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    let adminId: number;

    beforeEach(async () => {
      const hashed = await bcrypt.hash('Senha123', 10);
      const saved = await userRepo.save({
        name: 'Admin',
        email: 'admin@email.com',
        password: hashed,
        role: 'master',
        companyId: null,
        status: 'active',
      });
      adminId = saved.id;
    });

    it('should return a token for valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@email.com', password: 'Senha123' })
        .expect(201);

      expect(res.body.access_token).toBeDefined();
      expect(res.body.user.email).toBe('admin@email.com');

      const payload = JSON.parse(
        Buffer.from(res.body.access_token.split('.')[1], 'base64url').toString(),
      );
      expect(payload).toHaveProperty('sub', adminId);
      expect(payload).toHaveProperty('tokenVersion', 0);
      expect(payload.email).toBeUndefined();
    });

    it('should return 401 for a wrong password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@email.com', password: 'errada' })
        .expect(401);
    });

    it('should return 401 for an inactive user', async () => {
      await userRepo.update({ email: 'admin@email.com' }, { status: 'inactive' });

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@email.com', password: 'Senha123' })
        .expect(401);
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should store a hashed reset token', async () => {
      await userRepo.save({
        name: 'João',
        email: 'joao@email.com',
        password: 'x',
        role: 'user',
        status: 'active',
      });

      const res = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'joao@email.com' })
        .expect(201);

      expect(res.body.message).toContain('reset link');

      const saved = await userRepo.findOne({ where: { email: 'joao@email.com' } });
      expect(saved?.resetToken).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('POST /auth/reset-password', () => {
    it('should reset the password with a valid token', async () => {
      const { presentation, digest } = buildResetToken();
      const hashed = await bcrypt.hash('antiga', 10);
      await userRepo.save({
        name: 'João',
        email: 'joao@email.com',
        password: hashed,
        role: 'user',
        status: 'active',
        resetToken: digest,
      });

      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ token: presentation, password: 'Senha123' })
        .expect(201);

      const saved = await userRepo.findOne({ where: { email: 'joao@email.com' } });
      expect(saved?.resetToken).toBeNull();
      expect(await bcrypt.compare('Senha123', saved!.password)).toBe(true);
    });

    it('should return 400 for an expired token', async () => {
      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ token: `abc.${Date.now() - 1000}`, password: 'Senha123' })
        .expect(400);
    });
  });

  describe('rate limiting', () => {
    it('should return 429 after too many login attempts', async () => {
      const statuses: number[] = [];
      for (let i = 0; i < 12; i++) {
        const res = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: 'nao-existe@email.com', password: 'errada' });
        statuses.push(res.status);
      }

      expect(statuses).toContain(429);
    });
  });
});
