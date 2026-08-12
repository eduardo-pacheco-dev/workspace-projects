import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { Repository } from 'typeorm';
import { PdcaEntity } from './infrastructure/pdca.entity';
import { PdcaActionEntity } from './infrastructure/pdca-action.entity';
import { TypeOrmPdcaRepository } from './infrastructure/typeorm-pdca.repository';
import { PDCA_REPOSITORY } from './domain/pdca.repository';
import { Project } from '../projects/project.entity';
import { StationEntity } from '../stations/infrastructure/station.entity';
import { RadioLink } from '../radio-links/radio-link.entity';
import { Company } from '../companies/company.entity';
import { PdcaController } from './pdca.controller';
import { PdcaService } from './pdca.service';

describe('PdcaController (integration)', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let pdcaRepo: Repository<PdcaEntity>;
  let actionRepo: Repository<PdcaActionEntity>;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqljs',
          autoSave: false,
          location: ':memory:',
          entities: [PdcaEntity, PdcaActionEntity, Project, StationEntity, RadioLink, Company],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([
          PdcaEntity,
          PdcaActionEntity,
          Project,
          StationEntity,
          RadioLink,
          Company,
        ]),
      ],
      controllers: [PdcaController],
      providers: [
        PdcaService,
        { provide: PDCA_REPOSITORY, useClass: TypeOrmPdcaRepository },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    pdcaRepo = moduleRef.get<Repository<PdcaEntity>>(getRepositoryToken(PdcaEntity));
    actionRepo = moduleRef.get<Repository<PdcaActionEntity>>(getRepositoryToken(PdcaActionEntity));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await actionRepo.clear();
    await pdcaRepo.clear();
  });

  describe('POST /pdca', () => {
    it('should create a cycle with default fase and status', async () => {
      const res = await request(app.getHttpServer())
        .post('/pdca')
        .send({ titulo: 'Reduzir falhas' })
        .expect(201);

      expect(res.body).toMatchObject({ titulo: 'Reduzir falhas', fase: 'plan', statusCiclo: 'aberto' });
    });

    it('should return 400 when titulo is missing', async () => {
      await request(app.getHttpServer()).post('/pdca').send({}).expect(400);
    });

    it('should return 400 for an invalid fase', async () => {
      await request(app.getHttpServer())
        .post('/pdca')
        .send({ titulo: 'Ciclo', fase: 'invalida' })
        .expect(400);
    });
  });

  describe('GET /pdca', () => {
    beforeEach(async () => {
      await pdcaRepo.save([
        { titulo: 'Ciclo A', fase: 'plan', statusCiclo: 'aberto' },
        { titulo: 'Ciclo B', fase: 'do', statusCiclo: 'em_execucao' },
      ]);
    });

    it('should list cycles with total', async () => {
      const res = await request(app.getHttpServer()).get('/pdca').expect(200);
      expect(res.body.total).toBe(2);
    });

    it('should filter by fase and search', async () => {
      const res = await request(app.getHttpServer())
        .get('/pdca')
        .query({ fase: 'do', search: 'Ciclo B' })
        .expect(200);
      expect(res.body.total).toBe(1);
      expect(res.body.data[0].titulo).toBe('Ciclo B');
    });
  });

  describe('GET /pdca/:id', () => {
    it('should return the cycle with actions', async () => {
      const created = await pdcaRepo.save({ titulo: 'Ciclo' });
      await actionRepo.save({ pdcaId: created.id, what: 'Ação 1' });

      const res = await request(app.getHttpServer()).get(`/pdca/${created.id}`).expect(200);
      expect(res.body.titulo).toBe('Ciclo');
      expect(res.body.actions).toHaveLength(1);
      expect(res.body.actions[0].what).toBe('Ação 1');
    });

    it('should return 404 when not found', async () => {
      await request(app.getHttpServer()).get('/pdca/999').expect(404);
    });
  });

  describe('PATCH /pdca/:id', () => {
    it('should update the cycle and set the conclusion date', async () => {
      const created = await pdcaRepo.save({ titulo: 'Ciclo', fase: 'act', statusCiclo: 'em_verificacao' });

      const res = await request(app.getHttpServer())
        .patch(`/pdca/${created.id}`)
        .send({ statusCiclo: 'concluido' })
        .expect(200);

      expect(res.body.statusCiclo).toBe('concluido');
      expect(res.body.dataConclusao).toBeDefined();
    });

    it('should reject advancing to check without a concluded action', async () => {
      const created = await pdcaRepo.save({ titulo: 'Ciclo', fase: 'do', causaRaiz: 'causa', statusCiclo: 'em_execucao' });

      await request(app.getHttpServer())
        .patch(`/pdca/${created.id}`)
        .send({ fase: 'check' })
        .expect(400);
    });
  });

  describe('actions', () => {
    let pdcaId: number;

    beforeEach(async () => {
      const created = await pdcaRepo.save({ titulo: 'Ciclo', fase: 'plan', statusCiclo: 'aberto' });
      pdcaId = created.id;
    });

    it('should create, list, update and delete an action', async () => {
      const created = await request(app.getHttpServer())
        .post(`/pdca/${pdcaId}/actions`)
        .send({ what: 'Executar tarefa' })
        .expect(201);

      expect(created.body).toMatchObject({ what: 'Executar tarefa', status: 'pendente', progresso: 0 });

      const list = await request(app.getHttpServer()).get(`/pdca/${pdcaId}/actions`).expect(200);
      expect(list.body).toHaveLength(1);

      const updated = await request(app.getHttpServer())
        .patch(`/pdca/${pdcaId}/actions/${created.body.id}`)
        .send({ status: 'concluido' })
        .expect(200);
      expect(updated.body.status).toBe('concluido');
      expect(updated.body.dataConclusaoReal).toBeDefined();

      await request(app.getHttpServer())
        .delete(`/pdca/${pdcaId}/actions/${created.body.id}`)
        .expect(200);
      const after = await request(app.getHttpServer()).get(`/pdca/${pdcaId}/actions`).expect(200);
      expect(after.body).toHaveLength(0);
    });

    it('should mark an overdue action as atrasado', async () => {
      const created = await request(app.getHttpServer())
        .post(`/pdca/${pdcaId}/actions`)
        .send({ what: 'Tarefa', whenPrazo: '2000-01-01' })
        .expect(201);

      const updated = await request(app.getHttpServer())
        .patch(`/pdca/${pdcaId}/actions/${created.body.id}`)
        .send({ status: 'em_andamento' })
        .expect(200);

      expect(updated.body.atrasado).toBe(true);
      expect(updated.body.status).toBe('atrasado');
    });
  });

  describe('POST /pdca/:id/restart', () => {
    it('should create a new linked cycle', async () => {
      const created = await pdcaRepo.save({ titulo: 'Ciclo original', fase: 'plan', statusCiclo: 'aberto' });

      const res = await request(app.getHttpServer())
        .post(`/pdca/${created.id}/restart`)
        .expect(201);

      expect(res.body).toMatchObject({
        titulo: 'Novo ciclo: Ciclo original',
        cicloPaiId: created.id,
        fase: 'plan',
        statusCiclo: 'aberto',
      });
    });
  });

  describe('DELETE /pdca/:id', () => {
    it('should delete the cycle', async () => {
      const created = await pdcaRepo.save({ titulo: 'Ciclo' });

      await request(app.getHttpServer()).delete(`/pdca/${created.id}`).expect(200);
      await request(app.getHttpServer()).get(`/pdca/${created.id}`).expect(404);
    });
  });
});
