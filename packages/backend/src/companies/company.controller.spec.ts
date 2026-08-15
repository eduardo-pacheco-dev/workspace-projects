import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard } from '@nestjs/passport';
import request from 'supertest';
import { Company } from './company.entity';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';

describe('CompanyController (integration)', () => {
  let app: INestApplication;

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

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqljs',
          autoSave: false,
          location: ':memory:',
          entities: [Company],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Company]),
      ],
      controllers: [CompanyController],
      providers: [CompanyService],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let companyId: number;
  let meCompanyId: number;

  describe('POST /companies', () => {
    it('should create a company with ativa default true', async () => {
      const res = await request(app.getHttpServer())
        .post('/companies')
        .send({ nome: 'EA Projetos Telecom Ltda', cnpj: '12.345.678/0001-90' })
        .expect(201);

      expect(res.body).toMatchObject({
        nome: 'EA Projetos Telecom Ltda',
        cnpj: '12.345.678/0001-90',
        ativa: true,
      });
      companyId = res.body.id;
    });
    it('should return 400 when nome is missing', async () => {
      await request(app.getHttpServer())
        .post('/companies')
        .send({ cnpj: '98.765.432/0001-10' })
        .expect(400);
    });

    it('should return 400 for an invalid email', async () => {
      await request(app.getHttpServer())
        .post('/companies')
        .send({ nome: 'Empresa', email: 'invalido' })
        .expect(400);
    });
  });

  describe('GET /companies', () => {
    it('should list companies', async () => {
      const res = await request(app.getHttpServer()).get('/companies').expect(200);
      expect(res.body.total).toBe(1);
      expect(res.body.data[0].nome).toBe('EA Projetos Telecom Ltda');
    });

    it('should search companies', async () => {
      const res = await request(app.getHttpServer())
        .get('/companies')
        .query({ search: 'telecom' })
        .expect(200);
      expect(res.body.total).toBe(1);

      const empty = await request(app.getHttpServer())
        .get('/companies')
        .query({ search: 'nada-a-ver' })
        .expect(200);
      expect(empty.body.total).toBe(0);
    });
  });

  describe('GET /companies/:id', () => {
    it('should return the company', async () => {
      const res = await request(app.getHttpServer()).get(`/companies/${companyId}`).expect(200);
      expect(res.body.nome).toBe('EA Projetos Telecom Ltda');
    });

    it('should return 404 when not found', async () => {
      await request(app.getHttpServer()).get('/companies/999').expect(404);
    });
  });

  describe('PATCH /companies/:id', () => {
    it('should update the company', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/companies/${companyId}`)
        .send({ cidade: 'São Paulo', ativa: false })
        .expect(200);

      expect(res.body.cidade).toBe('São Paulo');
      expect(res.body.ativa).toBe(false);
    });

    it('should return 400 for an empty body', async () => {
      await request(app.getHttpServer()).patch(`/companies/${companyId}`).send({}).expect(400);
    });
  });

  describe('DELETE /companies/:id', () => {
    it('should delete the company', async () => {
      const res = await request(app.getHttpServer()).delete(`/companies/${companyId}`).expect(200);
      expect(res.body.message).toBe('Empresa excluída com sucesso');

      await request(app.getHttpServer()).get(`/companies/${companyId}`).expect(404);
    });

    it('should return 404 when deleting non-existent company', async () => {
      await request(app.getHttpServer()).delete('/companies/999').expect(404);
    });
  });

  describe('access control', () => {
    it('should return 403 for a non-master user', async () => {
      currentUser = { id: 2, email: 'user@empresa.com', name: 'User', role: 'user', companyId: 1 };

      await request(app.getHttpServer()).get('/companies').expect(403);
      await request(app.getHttpServer()).get(`/companies/${companyId}`).expect(403);
      await request(app.getHttpServer())
        .post('/companies')
        .send({ nome: 'Outra Empresa' })
        .expect(403);
      await request(app.getHttpServer()).patch(`/companies/${companyId}`).send({ ativa: false }).expect(403);
      await request(app.getHttpServer()).delete(`/companies/${companyId}`).expect(403);
    });
  });

  describe('GET /companies/me', () => {
    it('should return the current user company', async () => {
      currentUser = { id: 1, email: 'admin@admin.com', name: 'Admin', role: 'master', companyId: null };
      const created = await request(app.getHttpServer())
        .post('/companies')
        .send({ nome: 'Empresa do Usuário', cnpj: '11.222.333/0001-44' })
        .expect(201);
      meCompanyId = created.body.id;

      currentUser = { id: 3, email: 'admin@empresa.com', name: 'Admin Empresa', role: 'admin', companyId: meCompanyId };
      const res = await request(app.getHttpServer()).get('/companies/me').expect(200);
      expect(res.body.id).toBe(meCompanyId);
      expect(res.body.nome).toBe('Empresa do Usuário');
    });

    it('should return null when the user has no company', async () => {
      currentUser = { id: 1, email: 'admin@admin.com', name: 'Admin', role: 'master', companyId: null };
      const res = await request(app.getHttpServer()).get('/companies/me').expect(200);
      expect(res.body).toEqual({});
    });
  });

  describe('PATCH /companies/me', () => {
    it('should update the current user company for an admin', async () => {
      currentUser = { id: 3, email: 'admin@empresa.com', name: 'Admin Empresa', role: 'admin', companyId: meCompanyId };
      const res = await request(app.getHttpServer())
        .patch('/companies/me')
        .send({ cidade: 'Campinas', telefone: '(19) 99999-0000' })
        .expect(200);
      expect(res.body.cidade).toBe('Campinas');
      expect(res.body.telefone).toBe('(19) 99999-0000');
    });

    it('should return 403 for a non-admin role', async () => {
      currentUser = { id: 4, email: 'user@empresa.com', name: 'User', role: 'user', companyId: meCompanyId };
      await request(app.getHttpServer())
        .patch('/companies/me')
        .send({ cidade: 'X' })
        .expect(403);
    });

    it('should return 404 when the user has no company', async () => {
      currentUser = { id: 1, email: 'admin@admin.com', name: 'Admin', role: 'master', companyId: null };
      await request(app.getHttpServer())
        .patch('/companies/me')
        .send({ cidade: 'X' })
        .expect(404);
    });
  });
});
