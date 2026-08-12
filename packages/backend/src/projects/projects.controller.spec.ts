import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { Repository } from 'typeorm';
import { ProjectEntity } from './infrastructure/project.entity';
import { ProjectDocumentEntity } from './infrastructure/project-document.entity';
import { TypeOrmProjectRepository } from './infrastructure/typeorm-project.repository';
import { PROJECT_REPOSITORY } from './domain/project.repository';
import { StationEntity } from '../stations/infrastructure/station.entity';
import { RadioLink } from '../radio-links/radio-link.entity';
import { Company } from '../companies/company.entity';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

const mockAuthGuard = {
  canActivate: (context: any) => {
    const req = context.switchToHttp().getRequest();
    if (req.headers?.['x-test-user']) {
      req.user = { id: 1, email: 'admin@admin.com', name: 'Admin', role: 'master', companyId: null };
    }
    return true;
  },
};

describe('ProjectsController (integration)', () => {
  let app: INestApplication;
  let projectRepo: Repository<ProjectEntity>;
  let documentRepo: Repository<ProjectDocumentEntity>;
  let stationRepo: Repository<StationEntity>;
  let radioLinkRepo: Repository<RadioLink>;
  let companyRepo: Repository<Company>;
  let controller: ProjectsController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqljs',
          autoSave: false,
          location: ':memory:',
          entities: [ProjectEntity, ProjectDocumentEntity, StationEntity, RadioLink, Company],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([ProjectEntity, ProjectDocumentEntity, StationEntity, RadioLink, Company]),
      ],
      controllers: [ProjectsController],
      providers: [
        ProjectsService,
        { provide: PROJECT_REPOSITORY, useClass: TypeOrmProjectRepository },
        { provide: APP_GUARD, useValue: mockAuthGuard },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    projectRepo = moduleRef.get<Repository<ProjectEntity>>(getRepositoryToken(ProjectEntity));
    documentRepo = moduleRef.get<Repository<ProjectDocumentEntity>>(getRepositoryToken(ProjectDocumentEntity));
    stationRepo = moduleRef.get<Repository<StationEntity>>(getRepositoryToken(StationEntity));
    radioLinkRepo = moduleRef.get<Repository<RadioLink>>(getRepositoryToken(RadioLink));
    companyRepo = moduleRef.get<Repository<Company>>(getRepositoryToken(Company));
    controller = moduleRef.get(ProjectsController);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await documentRepo.clear();
    await stationRepo.clear();
    await radioLinkRepo.clear();
    await companyRepo.clear();
    await projectRepo.clear();
  });

  describe('POST /projects', () => {
    it('should create a project with auto codigo', async () => {
      const res = await request(app.getHttpServer())
        .post('/projects')
        .send({ nome: 'Infraestrutura Norte', cliente: 'Vivo' })
        .expect(201);

      expect(res.body).toMatchObject({ nome: 'Infraestrutura Norte', cliente: 'Vivo', status: 'ativo' });
      expect(res.body.codigo).toMatch(/^PRJ-\d{4}$/);
    });

    it('should return 400 when nome is missing', async () => {
      await request(app.getHttpServer()).post('/projects').send({ cliente: 'Vivo' }).expect(400);
    });

    it('should return 400 for an invalid status', async () => {
      await request(app.getHttpServer())
        .post('/projects')
        .send({ nome: 'Projeto X', status: 'desativado' })
        .expect(400);
    });
  });

  describe('GET /projects', () => {
    beforeEach(async () => {
      await projectRepo.save([
        { nome: 'Projeto A', cliente: 'Vivo', status: 'ativo' },
        { nome: 'Projeto B', cliente: 'Nokia', status: 'inativo' },
      ]);
    });

    it('should list projects with total', async () => {
      const res = await request(app.getHttpServer()).get('/projects').expect(200);
      expect(res.body.total).toBe(2);
    });

    it('should filter by status', async () => {
      const res = await request(app.getHttpServer())
        .get('/projects')
        .query({ status: 'inativo' })
        .expect(200);
      expect(res.body.total).toBe(1);
      expect(res.body.data[0].nome).toBe('Projeto B');
    });

    it('should filter by cliente', async () => {
      const res = await request(app.getHttpServer())
        .get('/projects')
        .query({ cliente: 'Nokia' })
        .expect(200);
      expect(res.body.total).toBe(1);
      expect(res.body.data[0].nome).toBe('Projeto B');
    });

    it('should search projects', async () => {
      const res = await request(app.getHttpServer())
        .get('/projects')
        .query({ search: 'Projeto B' })
        .expect(200);
      expect(res.body.total).toBe(1);
    });

    it('should paginate results', async () => {
      const res = await request(app.getHttpServer())
        .get('/projects')
        .query({ page: 1, limit: 1 })
        .expect(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.total).toBe(2);
    });

    it('should handle an authenticated user in the request', async () => {
      const res = await request(app.getHttpServer())
        .get('/projects')
        .set('x-test-user', 'master')
        .expect(200);
      expect(res.body.total).toBe(2);
    });

    it('should handle findAll without a request user (direct call)', async () => {
      const res = await controller.findAll(1, 10, 'id', 'ASC', undefined, undefined, undefined, undefined);
      expect(res.total).toBe(2);
    });
  });

  describe('GET /projects/:id', () => {
    it('should return the project', async () => {
      const created = await projectRepo.save({ nome: 'Projeto X' });
      const res = await request(app.getHttpServer()).get(`/projects/${created.id}`).expect(200);
      expect(res.body.nome).toBe('Projeto X');
    });

    it('should return 404 when not found', async () => {
      await request(app.getHttpServer()).get('/projects/999').expect(404);
    });
  });

  describe('PATCH /projects/:id', () => {
    it('should update the project', async () => {
      const created = await projectRepo.save({ nome: 'Projeto Y', status: 'ativo' });
      const res = await request(app.getHttpServer())
        .patch(`/projects/${created.id}`)
        .send({ status: 'inativo', operadora: 'TIM' })
        .expect(200);

      expect(res.body.status).toBe('inativo');
      expect(res.body.operadora).toBe('TIM');
    });

    it('should return 404 when project does not exist', async () => {
      await request(app.getHttpServer()).patch('/projects/999').send({ status: 'inativo' }).expect(404);
    });
  });

  describe('DELETE /projects/:id', () => {
    it('should delete the project', async () => {
      const created = await projectRepo.save({ nome: 'Projeto D' });
      await request(app.getHttpServer()).delete(`/projects/${created.id}`).expect(200);
      await request(app.getHttpServer()).get(`/projects/${created.id}`).expect(404);
    });

    it('should return 404 when deleting a non-existent project', async () => {
      await request(app.getHttpServer()).delete('/projects/999').expect(404);
    });
  });

  describe('documents', () => {
    it('should create and list documents of a project', async () => {
      const project = await projectRepo.save({ nome: 'Projeto X' });

      const created = await request(app.getHttpServer())
        .post(`/projects/${project.id}/documents`)
        .send({ nome: 'Contrato assinado', tipo: 'Contrato', quantidade: 2 })
        .expect(201);
      expect(created.body).toMatchObject({ nome: 'Contrato assinado', tipo: 'Contrato', quantidade: 2 });

      const list = await request(app.getHttpServer())
        .get(`/projects/${project.id}/documents`)
        .expect(200);
      expect(list.body).toHaveLength(1);
    });

    it('should return 400 for a document with invalid tipo', async () => {
      const project = await projectRepo.save({ nome: 'Projeto X' });
      await request(app.getHttpServer())
        .post(`/projects/${project.id}/documents`)
        .send({ nome: 'Doc', tipo: 'Invalido' })
        .expect(400);
    });

    it('should update and delete a document', async () => {
      const project = await projectRepo.save({ nome: 'Projeto X' });
      const doc = await documentRepo.save({ projectId: project.id, nome: 'ART', quantidade: 1 });

      const updated = await request(app.getHttpServer())
        .patch(`/projects/${project.id}/documents/${doc.id}`)
        .send({ quantidade: 5 })
        .expect(200);
      expect(updated.body.quantidade).toBe(5);

      await request(app.getHttpServer())
        .delete(`/projects/${project.id}/documents/${doc.id}`)
        .expect(200);

      const count = await documentRepo.count({ where: { projectId: project.id } });
      expect(count).toBe(0);
    });

    it('should return 404 when updating a non-existent document', async () => {
      const project = await projectRepo.save({ nome: 'Projeto X' });
      await request(app.getHttpServer())
        .patch(`/projects/${project.id}/documents/999`)
        .send({ quantidade: 2 })
        .expect(404);
    });
  });

  describe('stations', () => {
    it('should add and remove a station from a project', async () => {
      const project = await projectRepo.save({ nome: 'Projeto X' });
      const station = await stationRepo.save({ siteId: 'SITE-1', endId: 'END-1', status: 'ativo' });

      const added = await request(app.getHttpServer())
        .post(`/projects/${project.id}/stations`)
        .send({ stationId: station.id })
        .expect(201);
      expect(added.body.stations).toHaveLength(1);

      const list = await request(app.getHttpServer())
        .get(`/projects/${project.id}/stations`)
        .expect(200);
      expect(list.body).toHaveLength(1);

      await request(app.getHttpServer())
        .delete(`/projects/${project.id}/stations/${station.id}`)
        .expect(200);

      const after = await request(app.getHttpServer())
        .get(`/projects/${project.id}/stations`)
        .expect(200);
      expect(after.body).toHaveLength(0);
    });

    it('should return 404 when adding a non-existent station', async () => {
      const project = await projectRepo.save({ nome: 'Projeto X' });
      await request(app.getHttpServer())
        .post(`/projects/${project.id}/stations`)
        .send({ stationId: 999 })
        .expect(404);
    });
  });

  describe('radio links', () => {
    it('should add and remove a radio link from a project', async () => {
      const project = await projectRepo.save({ nome: 'Projeto X' });
      const radioLink = await radioLinkRepo.save({ nome: 'ENLACE-1' });

      const added = await request(app.getHttpServer())
        .post(`/projects/${project.id}/radio-links`)
        .send({ radioLinkId: radioLink.id })
        .expect(201);
      expect(added.body.radioLinks).toHaveLength(1);

      const list = await request(app.getHttpServer())
        .get(`/projects/${project.id}/radio-links`)
        .expect(200);
      expect(list.body).toHaveLength(1);

      await request(app.getHttpServer())
        .delete(`/projects/${project.id}/radio-links/${radioLink.id}`)
        .expect(200);

      const after = await request(app.getHttpServer())
        .get(`/projects/${project.id}/radio-links`)
        .expect(200);
      expect(after.body).toHaveLength(0);
    });

    it('should return 404 when adding a non-existent radio link', async () => {
      const project = await projectRepo.save({ nome: 'Projeto X' });
      await request(app.getHttpServer())
        .post(`/projects/${project.id}/radio-links`)
        .send({ radioLinkId: 999 })
        .expect(404);
    });
  });
});
