import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { ScheduleEvent } from './schedule-event.entity';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';

describe('ScheduleController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqljs',
          autoSave: false,
          location: ':memory:',
          entities: [ScheduleEvent],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([ScheduleEvent]),
      ],
      controllers: [ScheduleController],
      providers: [ScheduleService],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /schedule', () => {
    it('should create an event with the default status', async () => {
      const res = await request(app.getHttpServer())
        .post('/schedule')
        .send({ title: 'Reunião de equipe', startAt: '2026-08-03T10:00' })
        .expect(201);

      expect(res.body).toMatchObject({
        title: 'Reunião de equipe',
        startAt: '2026-08-03T10:00',
        status: 'scheduled',
      });
      expect(res.body.id).toBeDefined();
    });

    it('should return 400 when title is missing', async () => {
      await request(app.getHttpServer())
        .post('/schedule')
        .send({ description: 'sem título' })
        .expect(400);
    });

    it('should return 400 for an invalid status', async () => {
      await request(app.getHttpServer())
        .post('/schedule')
        .send({ title: 'Evento', status: 'invalid_status' })
        .expect(400);
    });
  });

  describe('GET /schedule', () => {
    it('should list events with pagination metadata', async () => {
      const res = await request(app.getHttpServer())
        .get('/schedule')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter by status', async () => {
      await request(app.getHttpServer())
        .post('/schedule')
        .send({ title: 'Confirmado', status: 'confirmed' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/schedule')
        .query({ status: 'confirmed' })
        .expect(200);

      expect(res.body.total).toBeGreaterThan(0);
      for (const event of res.body.data as ScheduleEvent[]) {
        expect(event.status).toBe('confirmed');
      }
    });

    it('should filter by date range', async () => {
      const res = await request(app.getHttpServer())
        .get('/schedule')
        .query({ from: '2026-08-01', to: '2026-08-05' })
        .expect(200);

      for (const event of res.body.data as ScheduleEvent[]) {
        expect(event.startAt! >= '2026-08-01').toBe(true);
        expect(event.startAt! <= '2026-08-05').toBe(true);
      }
    });

    it('should search by title', async () => {
      const res = await request(app.getHttpServer())
        .get('/schedule')
        .query({ search: 'Reunião' })
        .expect(200);

      expect(res.body.total).toBeGreaterThan(0);
      for (const event of res.body.data as ScheduleEvent[]) {
        expect(event.title).toMatch(/Reunião/i);
      }
    });
  });

  describe('GET /schedule/:id', () => {
    it('should return a single event', async () => {
      const created = await request(app.getHttpServer())
        .post('/schedule')
        .send({ title: 'Visita técnica' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get(`/schedule/${created.body.id}`)
        .expect(200);

      expect(res.body.id).toBe(created.body.id);
      expect(res.body.title).toBe('Visita técnica');
    });

    it('should return 404 for an unknown id', async () => {
      await request(app.getHttpServer())
        .get('/schedule/9999')
        .expect(404);
    });
  });

  describe('PATCH /schedule/:id', () => {
    it('should update an event', async () => {
      const created = await request(app.getHttpServer())
        .post('/schedule')
        .send({ title: 'Antes', status: 'scheduled' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .patch(`/schedule/${created.body.id}`)
        .send({ title: 'Depois', status: 'completed' })
        .expect(200);

      expect(res.body.title).toBe('Depois');
      expect(res.body.status).toBe('completed');
    });

    it('should return 404 for an unknown id', async () => {
      await request(app.getHttpServer())
        .patch('/schedule/9999')
        .send({ title: 'X' })
        .expect(404);
    });

    it('should return 400 for an invalid status', async () => {
      const created = await request(app.getHttpServer())
        .post('/schedule')
        .send({ title: 'Evento' })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/schedule/${created.body.id}`)
        .send({ status: 'invalid_status' })
        .expect(400);
    });
  });

  describe('DELETE /schedule/:id', () => {
    it('should delete an event', async () => {
      const created = await request(app.getHttpServer())
        .post('/schedule')
        .send({ title: 'Para excluir' })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/schedule/${created.body.id}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/schedule/${created.body.id}`)
        .expect(404);
    });

    it('should return 404 when the event does not exist', async () => {
      await request(app.getHttpServer())
        .delete('/schedule/9999')
        .expect(404);
    });
  });
});
