import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { AuthGuard } from '@nestjs/passport';
import request from 'supertest';
import { Repository } from 'typeorm';
import { Collaborator } from './collaborator.entity';
import { Company } from '../companies/company.entity';
import { Lpu } from '../lpu/lpu.entity';
import { CollaboratorsController } from './collaborators.controller';
import { CollaboratorsService } from './collaborators.service';

describe('CollaboratorsController (integration)', () => {
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

  let companyId: number;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqljs',
          autoSave: false,
          location: ':memory:',
          entities: [Collaborator, Company, Lpu],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Collaborator, Company, Lpu]),
      ],
      controllers: [CollaboratorsController],
      providers: [CollaboratorsService],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();

    const companyRepo = moduleRef.get<Repository<Company>>(getRepositoryToken(Company));
    const company = await companyRepo.save({ nome: 'EA Projetos Telecom Ltda' });
    companyId = company.id;
  });

  afterAll(async () => {
    await app.close();
  });

  let collaboratorId: number;

  describe('POST /collaborators', () => {
    it('should create a collaborator with ativo default and generated codigo', async () => {
      const res = await request(app.getHttpServer())
        .post('/collaborators')
        .send({ nome: 'João Silva', cargo: 'Diretor Técnico', email: 'joao@empresa.com', companyId })
        .expect(201);

      expect(res.body).toMatchObject({
        nome: 'João Silva',
        cargo: 'Diretor Técnico',
        email: 'joao@empresa.com',
        status: 'ativo',
        codigo: 'COL-0001',
        companyId,
      });
      collaboratorId = res.body.id;
    });

    it('should return 400 when nome is missing', async () => {
      await request(app.getHttpServer()).post('/collaborators').send({ cargo: 'X', companyId }).expect(400);
    });

    it('should return 400 for an invalid email', async () => {
      await request(app.getHttpServer())
        .post('/collaborators')
        .send({ nome: 'Maria', email: 'invalido', companyId })
        .expect(400);
    });

    it('should return 400 for an invalid status', async () => {
      await request(app.getHttpServer())
        .post('/collaborators')
        .send({ nome: 'Maria', status: 'demitido', companyId })
        .expect(400);
    });

    it('should return 400 when companyId is missing', async () => {
      await request(app.getHttpServer())
        .post('/collaborators')
        .send({ nome: 'Maria' })
        .expect(400);
    });

    it('should create a freelancer with isFreelancer true and FR codigo', async () => {
      const res = await request(app.getHttpServer())
        .post('/collaborators')
        .send({
          nome: 'Carlos Silva',
          companyId,
          isFreelancer: true,
          hourlyRate: 150,
          experienceLevel: 'senior',
          availability: 'available',
        })
        .expect(201);

      expect(res.body).toMatchObject({
        nome: 'Carlos Silva',
        isFreelancer: true,
        codigo: 'FR-0002',
        hourlyRate: 150,
        experienceLevel: 'senior',
      });
    });
  });

  describe('GET /collaborators', () => {
    it('should list collaborators', async () => {
      const res = await request(app.getHttpServer()).get('/collaborators').expect(200);
      expect(res.body.total).toBe(2);
      expect(res.body.data[0].nome).toBe('João Silva');
      expect(res.body.data[0].company?.nome).toBe('EA Projetos Telecom Ltda');
    });

    it('should filter by isFreelancer', async () => {
      const freelancers = await request(app.getHttpServer())
        .get('/collaborators')
        .query({ isFreelancer: 'true' })
        .expect(200);
      expect(freelancers.body.total).toBe(1);
      expect(freelancers.body.data[0].isFreelancer).toBe(true);
      expect(freelancers.body.data[0].codigo).toBe('FR-0002');

      const collaborators = await request(app.getHttpServer())
        .get('/collaborators')
        .query({ isFreelancer: 'false' })
        .expect(200);
      expect(collaborators.body.total).toBe(1);
      expect(collaborators.body.data[0].isFreelancer).toBe(false);
    });

    it('should search collaborators', async () => {
      const res = await request(app.getHttpServer())
        .get('/collaborators')
        .query({ search: 'joao' })
        .expect(200);
      expect(res.body.total).toBe(1);

      const empty = await request(app.getHttpServer())
        .get('/collaborators')
        .query({ search: 'nao-existe' })
        .expect(200);
      expect(empty.body.total).toBe(0);
    });

    it('should paginate results', async () => {
      const res = await request(app.getHttpServer())
        .get('/collaborators')
        .query({ page: 1, limit: 5 })
        .expect(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.total).toBe(2);
    });

    it('should sort results by nome descending', async () => {
      const res = await request(app.getHttpServer())
        .get('/collaborators')
        .query({ sortBy: 'nome', sortOrder: 'DESC' })
        .expect(200);
      expect(res.body.data[0].nome).toBe('João Silva');
    });
  });

  describe('GET /collaborators/:id', () => {
    it('should return the collaborator', async () => {
      const res = await request(app.getHttpServer()).get(`/collaborators/${collaboratorId}`).expect(200);
      expect(res.body.nome).toBe('João Silva');
    });

    it('should return 404 when not found', async () => {
      await request(app.getHttpServer()).get('/collaborators/999').expect(404);
    });

    it('should return 400 for a non-numeric id', async () => {
      await request(app.getHttpServer()).get('/collaborators/abc').expect(400);
    });
  });

  describe('PATCH /collaborators/:id', () => {
    it('should update the collaborator', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/collaborators/${collaboratorId}`)
        .send({ cargo: 'Gerente de Projetos', status: 'inativo' })
        .expect(200);

      expect(res.body.cargo).toBe('Gerente de Projetos');
      expect(res.body.status).toBe('inativo');
    });

    it('should return 400 for an empty body', async () => {
      await request(app.getHttpServer()).patch(`/collaborators/${collaboratorId}`).send({}).expect(400);
    });
  });

  describe('DELETE /collaborators/:id', () => {
    it('should delete the collaborator', async () => {
      const res = await request(app.getHttpServer()).delete(`/collaborators/${collaboratorId}`).expect(200);
      expect(res.body.message).toBe('Colaborador excluído com sucesso');

      await request(app.getHttpServer()).get(`/collaborators/${collaboratorId}`).expect(404);
    });

    it('should return 404 when deleting non-existent collaborator', async () => {
      await request(app.getHttpServer()).delete('/collaborators/999').expect(404);
    });
  });

  describe('access control', () => {
    beforeAll(async () => {
      currentUser = { id: 1, email: 'admin@admin.com', name: 'Admin', role: 'master', companyId: null };
      const res = await request(app.getHttpServer())
        .post('/collaborators')
        .send({ nome: 'Colaborador Empresa A', companyId })
        .expect(201);
      collaboratorId = res.body.id;
    });

    it('should hide collaborators from another company for non-master', async () => {
      currentUser = { id: 2, email: 'user@empresa.com', name: 'User', role: 'user', companyId: 999 };

      const list = await request(app.getHttpServer()).get('/collaborators').expect(200);
      expect(list.body.total).toBe(0);

      await request(app.getHttpServer()).get(`/collaborators/${collaboratorId}`).expect(404);
      await request(app.getHttpServer()).patch(`/collaborators/${collaboratorId}`).send({ cargo: 'X' }).expect(404);
      await request(app.getHttpServer()).delete(`/collaborators/${collaboratorId}`).expect(404);

      await request(app.getHttpServer())
        .post('/collaborators')
        .send({ nome: 'Outro', companyId })
        .expect(400);
    });
  });

  describe('consolidated freelancer support', () => {
    beforeAll(async () => {
      currentUser = { id: 1, email: 'admin@admin.com', name: 'Admin', role: 'master', companyId: null };
    });

    it('should create a freelancer from firstName/lastName deriving nome and defaults', async () => {
      const res = await request(app.getHttpServer())
        .post('/collaborators')
        .send({
          firstName: 'Maria',
          lastName: 'Souza',
          companyId,
          isFreelancer: true,
          hourlyRate: 120,
          experienceLevel: 'mid',
          availability: 'available',
        })
        .expect(201);

      expect(res.body).toMatchObject({
        nome: 'Maria Souza',
        isFreelancer: true,
        skills: '[]',
        portfolio: '[]',
        experienceLevel: 'mid',
        availability: 'available',
      });
    });

    it('should return 400 for a collaborator without nome', async () => {
      await request(app.getHttpServer())
        .post('/collaborators')
        .send({ companyId })
        .expect(400);
    });

    it('should return 400 for a freelancer without nome or firstName', async () => {
      await request(app.getHttpServer())
        .post('/collaborators')
        .send({ companyId, isFreelancer: true })
        .expect(400);
    });

    it('should return 400 when companyId is missing', async () => {
      await request(app.getHttpServer())
        .post('/collaborators')
        .send({ nome: 'Sem Empresa' })
        .expect(400);
    });

    it('should combine isFreelancer and search filters', async () => {
      const res = await request(app.getHttpServer())
        .get('/collaborators')
        .query({ isFreelancer: 'true', search: 'maria' })
        .expect(200);

      expect(res.body.total).toBe(1);
      expect(res.body.data[0].firstName).toBe('Maria');
    });

    it('should update nome when firstName is changed', async () => {
      const list = await request(app.getHttpServer())
        .get('/collaborators')
        .query({ isFreelancer: 'true', search: 'maria' })
        .expect(200);
      const id = list.body.data[0].id;

      const res = await request(app.getHttpServer())
        .patch(`/collaborators/${id}`)
        .send({ firstName: 'Maria Clara' })
        .expect(200);

      expect(res.body.nome).toBe('Maria Clara Souza');
    });
  });
});
