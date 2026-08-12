import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { ObservationsController } from './observations.controller';
import { ServiceOrderObservationsService } from './observations.service';
import { OBSERVATION_REPOSITORY } from './domain/observation.repository';
import { TypeOrmObservationRepository } from './infrastructure/typeorm-observation.repository';
import { ObservationFileStorage } from './infrastructure/observation-file-storage';
import { ServiceOrderObservationEntity } from './infrastructure/observation.entity';
import { ServiceOrderEntity } from '../infrastructure/service-order.entity';

describe('ObservationsController (integration)', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let serviceOrderRepo: Repository<ServiceOrderEntity>;
  let serviceOrderId: number;

  const mockFileStorage = {
    getFilePath: jest.fn((o) => `/uploads/${o.serviceOrderId}/${o.filename}`),
    store: jest.fn(() => ({
      filename: 'uuid.pdf',
      originalName: 'anexo.pdf',
      mimetype: 'application/pdf',
      size: 3,
    })),
    remove: jest.fn(),
  };

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqljs',
          autoSave: false,
          location: ':memory:',
          entities: [ServiceOrderEntity, ServiceOrderObservationEntity],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([ServiceOrderEntity, ServiceOrderObservationEntity]),
      ],
      controllers: [ObservationsController],
      providers: [
        ServiceOrderObservationsService,
        { provide: OBSERVATION_REPOSITORY, useClass: TypeOrmObservationRepository },
        { provide: ObservationFileStorage, useValue: mockFileStorage },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    serviceOrderRepo = moduleRef.get<Repository<ServiceOrderEntity>>(getRepositoryToken(ServiceOrderEntity));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    const serviceOrder = await serviceOrderRepo.save({ numero: 'OS-001', cliente: 'Vivo' });
    serviceOrderId = serviceOrder.id;
  });

  it('should create, list, reorder and delete observations', async () => {
    const created = await request(app.getHttpServer())
      .post(`/service-orders/${serviceOrderId}/observations`)
      .field('title', 'Primeira')
      .attach('file', Buffer.from('x'), 'anexo.pdf')
      .expect(201);

    expect(created.body).toMatchObject({ title: 'Primeira', position: 1, originalName: 'anexo.pdf' });

    const second = await request(app.getHttpServer())
      .post(`/service-orders/${serviceOrderId}/observations`)
      .send({ title: 'Segunda' })
      .expect(201);
    expect(second.body.position).toBe(2);

    const list = await request(app.getHttpServer())
      .get(`/service-orders/${serviceOrderId}/observations`)
      .expect(200);
    expect(list.body).toHaveLength(2);

    await request(app.getHttpServer())
      .patch(`/service-orders/${serviceOrderId}/observations/reorder`)
      .send({ ids: [second.body.id, created.body.id] })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/service-orders/observations/${created.body.id}`)
      .send({ title: 'Atualizada' })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/service-orders/observations/${created.body.id}`)
      .expect(200);
  });

  it('should return 400 when the title is missing', async () => {
    await request(app.getHttpServer())
      .post(`/service-orders/${serviceOrderId}/observations`)
      .send({})
      .expect(400);
  });

  it('should return 404 for the file of an observation without an attachment', async () => {
    const created = await request(app.getHttpServer())
      .post(`/service-orders/${serviceOrderId}/observations`)
      .send({ title: 'Sem anexo' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get(`/service-orders/observations/${created.body.id}/file`)
      .expect(404);

    expect(res.body.message).toBe('Observação sem anexo');
  });

  it('should serve the file when it exists', async () => {
    const created = await request(app.getHttpServer())
      .post(`/service-orders/${serviceOrderId}/observations`)
      .field('title', 'Com anexo')
      .attach('file', Buffer.from('conteudo'), 'anexo.pdf')
      .expect(201);

    const tmpDir = path.resolve('logs', 'test-observation-file');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const tmpFile = path.join(tmpDir, 'anexo.pdf');
    fs.writeFileSync(tmpFile, 'conteudo');
    mockFileStorage.getFilePath.mockReturnValue(tmpFile);

    const res = await request(app.getHttpServer())
      .get(`/service-orders/observations/${created.body.id}/file`)
      .expect(200);

    expect(Buffer.isBuffer(res.body)).toBe(true);
    expect(res.body.toString()).toBe('conteudo');

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
});
