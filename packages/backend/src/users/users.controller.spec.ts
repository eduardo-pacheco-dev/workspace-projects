import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import request from 'supertest';
import { User } from './user.entity';
import { Company } from '../companies/company.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController (integration)', () => {
  let app: INestApplication;
  let userRepo: Repository<User>;

  let currentUser: {
    id: number;
    email: string;
    name: string;
    role: string;
    companyId: number | null;
  } = {
    id: 1,
    email: 'admin@admin.com',
    name: 'Admin',
    role: 'master',
    companyId: null,
  };

  const mockAuthGuard = {
    canActivate: (context: any) => {
      const req = context.switchToHttp().getRequest();
      req.user = currentUser;
      return true;
    },
  };

  const masterUser = {
    id: 1,
    email: 'admin@admin.com',
    name: 'Admin',
    role: 'master',
    companyId: null,
  };

  const regularUser = {
    id: 4,
    email: 'gestor@empresa.com',
    name: 'Gestor',
    role: 'user',
    companyId: 1,
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqljs',
          autoSave: false,
          location: ':memory:',
          entities: [User, Company],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([User, Company]),
      ],
      controllers: [UsersController],
      providers: [UsersService],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleRef.createNestApplication();
    userRepo = moduleRef.get(getRepositoryToken(User));
    const companyRepo = moduleRef.get<Repository<Company>>(getRepositoryToken(Company));
    await app.init();

    await companyRepo.save({ id: 1, nome: 'EA Projetos Telecom Ltda' });
    await userRepo.save({
      id: 1,
      name: 'Admin',
      email: 'admin@admin.com',
      password: 'senha123',
      role: 'master',
      companyId: null,
      status: 'active',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  const postUser = (body: Record<string, unknown>) =>
    request(app.getHttpServer()).post('/users').send(body);

  describe('POST /users', () => {
    it('should allow master to create a regular user for any company', async () => {
      currentUser = masterUser;

      const res = await postUser({
        name: 'João',
        lastName: 'Silva',
        email: 'joao@empresa.com',
        password: '123456',
        role: 'user',
        companyId: 1,
      }).expect(201);

      expect(res.body).toMatchObject({
        name: 'João',
        email: 'joao@empresa.com',
        role: 'user',
        companyId: 1,
        status: 'inactive',
      });
      expect(res.body.password).toBeUndefined();
    });

    it('should allow master to create another master', async () => {
      currentUser = masterUser;

      const res = await postUser({
        name: 'Maria',
        email: 'maria@master.com',
        password: '123456',
        role: 'master',
      }).expect(201);

      expect(res.body.role).toBe('master');
      expect(res.body.companyId).toBeNull();
    });

    it('should allow a regular user to create a user for their own company', async () => {
      currentUser = regularUser;

      const res = await postUser({
        name: 'Pedro',
        email: 'pedro@empresa.com',
        password: '123456',
        role: 'user',
        companyId: 1,
      }).expect(201);

      expect(res.body.role).toBe('user');
      expect(res.body.companyId).toBe(1);
    });

    it('should reject a regular user creating a user for another company', async () => {
      currentUser = regularUser;

      const res = await postUser({
        name: 'Carlos',
        email: 'carlos@outra.com',
        password: '123456',
        role: 'user',
        companyId: 999,
      }).expect(400);

      expect(res.body.message).toContain('própria empresa');
    });

    it('should reject a regular user creating a master', async () => {
      currentUser = regularUser;

      const res = await postUser({
        name: 'Hacker',
        email: 'hacker@outra.com',
        password: '123456',
        role: 'master',
      }).expect(400);

      expect(res.body.message).toContain('master');
    });

    it('should reject a non-master role without a company', async () => {
      currentUser = masterUser;

      const res = await postUser({
        name: 'Sem Empresa',
        email: 'sem@empresa.com',
        password: '123456',
        role: 'user',
      }).expect(400);

      expect(res.body.message).toContain('empresa');
    });

    it('should reject a duplicate email', async () => {
      currentUser = masterUser;

      const res = await postUser({
        name: 'Duplicado',
        email: 'joao@empresa.com',
        password: '123456',
        role: 'user',
        companyId: 1,
      }).expect(409);

      expect(res.body.message).toContain('Email já cadastrado');
    });

    it('should reject an invalid body (missing name and short password)', async () => {
      currentUser = masterUser;

      await postUser({ email: 'sem-nome@email.com', password: '123456', role: 'user', companyId: 1 }).expect(400);
      await postUser({ name: 'Senha Curta', email: 'curta@email.com', password: '123', role: 'user', companyId: 1 }).expect(400);
    });
  });

  describe('GET /users', () => {
    it('should list users without exposing passwords', async () => {
      const res = await request(app.getHttpServer()).get('/users').expect(200);

      expect(res.body.total).toBeGreaterThanOrEqual(4);
      expect(res.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ email: 'admin@admin.com' }),
          expect.objectContaining({ email: 'joao@empresa.com' }),
        ]),
      );
      res.body.data.forEach((u: any) => expect(u.password).toBeUndefined());
    });

    it('should search users by email/name', async () => {
      const res = await request(app.getHttpServer())
        .get('/users')
        .query({ search: 'joao' })
        .expect(200);

      expect(res.body.data.some((u: any) => u.email === 'joao@empresa.com')).toBe(true);

      const empty = await request(app.getHttpServer())
        .get('/users')
        .query({ search: 'nao-existe' })
        .expect(200);
      expect(empty.body.total).toBe(0);
    });
  });

  describe('GET /users/:id', () => {
    it('should return the user', async () => {
      const res = await request(app.getHttpServer()).get('/users/1').expect(200);

      expect(res.body.email).toBe('admin@admin.com');
      expect(res.body.password).toBeUndefined();
    });

    it('should return 404 for a missing user', async () => {
      await request(app.getHttpServer()).get('/users/9999').expect(404);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update a user', async () => {
      currentUser = masterUser;

      const res = await request(app.getHttpServer())
        .patch('/users/2')
        .send({ phone: '11999998888' })
        .expect(200);

      expect(res.body.phone).toBe('11999998888');
    });

    it('should prevent deactivating your own account', async () => {
      currentUser = masterUser;

      const res = await request(app.getHttpServer())
        .patch('/users/1')
        .send({ status: 'inactive' })
        .expect(400);

      expect(res.body.message).toContain('próprio usuário');
    });

    it('should prevent deactivating a master', async () => {
      currentUser = masterUser;

      const res = await request(app.getHttpServer())
        .patch('/users/3')
        .send({ status: 'inactive' })
        .expect(400);

      expect(res.body.message).toContain('master');
    });

    it('should prevent demoting a master', async () => {
      currentUser = masterUser;

      const res = await request(app.getHttpServer())
        .patch('/users/3')
        .send({ role: 'user' })
        .expect(400);

      expect(res.body.message).toContain('master');
    });

    it('should prevent a regular user from promoting to master', async () => {
      currentUser = regularUser;

      const res = await request(app.getHttpServer())
        .patch('/users/2')
        .send({ role: 'master' })
        .expect(400);

      expect(res.body.message).toContain('master');
    });

    it('should allow master to promote a user to master', async () => {
      currentUser = masterUser;

      const res = await request(app.getHttpServer())
        .patch('/users/2')
        .send({ role: 'master', companyId: null })
        .expect(200);

      expect(res.body.role).toBe('master');
      expect(res.body.companyId).toBeNull();
    });
  });

  describe('DELETE /users/:id', () => {
    it('should reject deleting your own user', async () => {
      currentUser = masterUser;

      const res = await request(app.getHttpServer()).delete('/users/1').expect(400);

      expect(res.body.message).toContain('próprio usuário');
    });

    it('should delete another user', async () => {
      currentUser = masterUser;

      const res = await request(app.getHttpServer()).delete('/users/2').expect(200);
      expect(res.body.message).toBe('Usuário excluído com sucesso');

      await request(app.getHttpServer()).get('/users/2').expect(404);
    });

    it('should return 404 for a non-existent user', async () => {
      currentUser = masterUser;

      await request(app.getHttpServer()).delete('/users/9999').expect(404);
    });
  });
});
