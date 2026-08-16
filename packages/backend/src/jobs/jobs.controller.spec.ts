import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { Repository } from 'typeorm';
import { Job } from './job.entity';
import { Company } from '../companies/company.entity';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { JOB_EXECUTORS } from './job-executors';

describe('JobsController (integration)', () => {
  let app: INestApplication;

  const currentUser = {
    id: 1,
    email: 'admin@admin.com',
    name: 'Admin',
    role: 'master',
    companyId: null as number | null,
  };

  const executor = {
    type: 'ECHO',
    execute: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqljs',
          autoSave: false,
          location: ':memory:',
          entities: [Job, Company],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Job, Company]),
      ],
      controllers: [JobsController],
      providers: [
        JobsService,
        { provide: JOB_EXECUTORS, useValue: [executor] },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use((req: any, _res: any, next: any) => {
      req.user = currentUser;
      next();
    });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let jobId: number;

  describe('POST /jobs', () => {
    it('should create a job with ativo default', async () => {
      const res = await request(app.getHttpServer())
        .post('/jobs')
        .send({
          nome: 'Limpeza de Logs',
          tipo: 'ECHO',
          cronExpression: '0 0 * * *',
          descricao: 'Remove logs antigos',
        })
        .expect(201);

      expect(res.body).toMatchObject({
        nome: 'Limpeza de Logs',
        tipo: 'ECHO',
        status: 'ativo',
      });
      expect(res.body.proximaExecucaoEm).toBeTruthy();
      jobId = res.body.id;
    });

    it('should return 400 when cron is missing', async () => {
      await request(app.getHttpServer())
        .post('/jobs')
        .send({ nome: 'Sem Cron', tipo: 'ECHO' })
        .expect(400);
    });

    it('should return 400 for an invalid cron expression', async () => {
      await request(app.getHttpServer())
        .post('/jobs')
        .send({ nome: 'Cron Invalida', tipo: 'ECHO', cronExpression: 'abc' })
        .expect(400);
    });

    it('should return 400 for an invalid status', async () => {
      await request(app.getHttpServer())
        .post('/jobs')
        .send({ nome: 'Status Errado', tipo: 'ECHO', cronExpression: '0 0 * * *', status: 'pausado' })
        .expect(400);
    });
  });

  describe('GET /jobs', () => {
    it('should list jobs', async () => {
      const res = await request(app.getHttpServer()).get('/jobs').expect(200);
      expect(res.body.total).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].nome).toBe('Limpeza de Logs');
    });

    it('should search jobs', async () => {
      const res = await request(app.getHttpServer())
        .get('/jobs')
        .query({ search: 'Limpeza' })
        .expect(200);
      expect(res.body.total).toBe(1);

      const empty = await request(app.getHttpServer())
        .get('/jobs')
        .query({ search: 'nao-existe' })
        .expect(200);
      expect(empty.body.total).toBe(0);
    });

    it('should filter by status', async () => {
      const res = await request(app.getHttpServer())
        .get('/jobs')
        .query({ status: 'inativo' })
        .expect(200);
      expect(res.body.total).toBe(0);
    });
  });

  describe('GET /jobs/:id', () => {
    it('should return the job', async () => {
      const res = await request(app.getHttpServer()).get(`/jobs/${jobId}`).expect(200);
      expect(res.body.nome).toBe('Limpeza de Logs');
    });

    it('should return 404 when not found', async () => {
      await request(app.getHttpServer()).get('/jobs/999').expect(404);
    });
  });

  describe('PATCH /jobs/:id', () => {
    it('should update the job', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/jobs/${jobId}`)
        .send({ descricao: 'Rotina diária de manutenção' })
        .expect(200);
      expect(res.body.descricao).toBe('Rotina diária de manutenção');
    });

    it('should return 400 for an invalid cron', async () => {
      await request(app.getHttpServer())
        .patch(`/jobs/${jobId}`)
        .send({ cronExpression: 'invalida' })
        .expect(400);
    });
  });

  describe('DELETE /jobs/:id', () => {
    it('should delete the job', async () => {
      const created = await request(app.getHttpServer())
        .post('/jobs')
        .send({ nome: 'Job Temporário', tipo: 'ECHO', cronExpression: '0 0 * * *' })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/jobs/${created.body.id}`)
        .expect(200, { message: 'Job excluído com sucesso' });

      await request(app.getHttpServer()).get(`/jobs/${created.body.id}`).expect(404);
    });

    it('should return 404 when job does not exist', async () => {
      await request(app.getHttpServer()).delete('/jobs/999').expect(404);
    });
  });

  describe('POST /jobs/:id/run', () => {
    it('should run the job manually', async () => {
      const res = await request(app.getHttpServer()).post(`/jobs/${jobId}/run`).expect(201);
      expect(res.body.ultimoExecutadoEm).toBeTruthy();
      expect(executor.execute).toHaveBeenCalled();
    });

    it('should return 404 when job does not exist', async () => {
      await request(app.getHttpServer()).post('/jobs/999/run').expect(404);
    });
  });

  describe('isolamento por empresa', () => {
    let companyAId: number;
    let jobAId: number;
    let jobBId: number;

    beforeAll(async () => {
      const companyRepo = app.get<Repository<Company>>(getRepositoryToken(Company));
      const jobRepo = app.get<Repository<Job>>(getRepositoryToken(Job));
      const companyA = await companyRepo.save({ nome: 'Empresa A' });
      const companyB = await companyRepo.save({ nome: 'Empresa B' });
      companyAId = companyA.id;

      const jobA = await jobRepo.save({
        nome: 'Job Empresa A',
        tipo: 'ECHO',
        cronExpression: '0 0 * * *',
        status: 'ativo',
        empresaId: companyA.id,
      });
      const jobB = await jobRepo.save({
        nome: 'Job Empresa B',
        tipo: 'ECHO',
        cronExpression: '0 0 * * *',
        status: 'ativo',
        empresaId: companyB.id,
      });
      jobAId = jobA.id;
      jobBId = jobB.id;
    });

    beforeEach(() => {
      currentUser.role = 'user';
      currentUser.companyId = companyAId;
    });

    it('should list only jobs of the user company', async () => {
      const res = await request(app.getHttpServer()).get('/jobs').expect(200);
      expect(res.body.data.map((j: Job) => j.id)).toContain(jobAId);
      expect(res.body.data.map((j: Job) => j.id)).not.toContain(jobBId);
    });

    it('should not expose a job from another company', async () => {
      await request(app.getHttpServer()).get(`/jobs/${jobBId}`).expect(404);
    });

    it('should associate created job with the user company', async () => {
      const res = await request(app.getHttpServer())
        .post('/jobs')
        .send({ nome: 'Job Criado', tipo: 'ECHO', cronExpression: '0 0 * * *' })
        .expect(201);
      expect(res.body.empresaId).toBe(companyAId);
    });
  });
});