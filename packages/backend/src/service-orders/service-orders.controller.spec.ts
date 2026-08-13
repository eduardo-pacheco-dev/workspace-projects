import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { Repository } from 'typeorm';
import { ServiceOrderEntity } from './infrastructure/service-order.entity';
import { ServiceOrderObservationEntity } from './observations/infrastructure/observation.entity';
import { TypeOrmServiceOrderRepository } from './infrastructure/typeorm-service-order.repository';
import { SERVICE_ORDER_REPOSITORY } from './domain/service-order.repository';
import { ServiceOrdersController } from './service-orders.controller';
import { ServiceOrdersService } from './service-orders.service';

describe('ServiceOrdersController (integration)', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let serviceOrderRepo: Repository<ServiceOrderEntity>;

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
      controllers: [ServiceOrdersController],
      providers: [
        ServiceOrdersService,
        { provide: SERVICE_ORDER_REPOSITORY, useClass: TypeOrmServiceOrderRepository },
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
    await serviceOrderRepo.clear();
  });

  describe('POST /service-orders', () => {
    it('should create an order with generated numero', async () => {
      const res = await request(app.getHttpServer())
        .post('/service-orders')
        .send({ cliente: 'Vivo', descricao: 'Instalação de fibra' })
        .expect(201);

      expect(res.body).toMatchObject({ cliente: 'Vivo', descricao: 'Instalação de fibra', status: 'aberta' });
      expect(res.body.numero).toMatch(/^OS-\d{3}$/);
    });

    it('should return 400 when cliente is missing', async () => {
      await request(app.getHttpServer()).post('/service-orders').send({ descricao: 'X' }).expect(400);
    });

    it('should return 400 for an invalid status', async () => {
      await request(app.getHttpServer())
        .post('/service-orders')
        .send({ cliente: 'Vivo', status: 'invalido' })
        .expect(400);
    });
  });

  describe('GET /service-orders', () => {
    beforeEach(async () => {
      await serviceOrderRepo.save([
        { numero: 'OS-001', cliente: 'Vivo', status: 'aberta' },
        { numero: 'OS-002', cliente: 'Claro', status: 'concluida' },
      ]);
    });

    it('should list orders with total', async () => {
      const res = await request(app.getHttpServer()).get('/service-orders').expect(200);
      expect(res.body.total).toBe(2);
    });

    it('should filter by status', async () => {
      const res = await request(app.getHttpServer())
        .get('/service-orders')
        .query({ status: 'concluida' })
        .expect(200);
      expect(res.body.total).toBe(1);
      expect(res.body.data[0].cliente).toBe('Claro');
    });

    it('should search orders', async () => {
      const res = await request(app.getHttpServer())
        .get('/service-orders')
        .query({ search: 'OS-002' })
        .expect(200);
      expect(res.body.total).toBe(1);
    });
  });

  describe('GET /service-orders/:id', () => {
    it('should return the order', async () => {
      const created = await serviceOrderRepo.save({ numero: 'OS-010', cliente: 'Vivo' });
      const res = await request(app.getHttpServer()).get(`/service-orders/${created.id}`).expect(200);
      expect(res.body.cliente).toBe('Vivo');
    });

    it('should return 404 when not found', async () => {
      await request(app.getHttpServer()).get('/service-orders/999').expect(404);
    });
  });

  describe('PATCH /service-orders/:id', () => {
    it('should update the order', async () => {
      const created = await serviceOrderRepo.save({ numero: 'OS-011', cliente: 'Vivo', status: 'aberta' });
      const res = await request(app.getHttpServer())
        .patch(`/service-orders/${created.id}`)
        .send({ status: 'em_andamento' })
        .expect(200);

      expect(res.body.status).toBe('em_andamento');
    });

    it('should return 404 when order does not exist', async () => {
      await request(app.getHttpServer()).patch('/service-orders/999').send({ status: 'concluida' }).expect(404);
    });
  });

  describe('DELETE /service-orders/:id', () => {
    it('should delete the order', async () => {
      const created = await serviceOrderRepo.save({ numero: 'OS-012', cliente: 'Vivo' });
      await request(app.getHttpServer()).delete(`/service-orders/${created.id}`).expect(200);
      await request(app.getHttpServer()).get(`/service-orders/${created.id}`).expect(404);
    });
  });
});
