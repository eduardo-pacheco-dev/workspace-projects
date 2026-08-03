import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { Task } from './task.entity';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';

describe('TaskController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqljs',
          autoSave: false,
          location: ':memory:',
          entities: [Task],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Task]),
      ],
      controllers: [TaskController],
      providers: [TaskService],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /tasks', () => {
    it('should create a task with default status and priority', async () => {
      const res = await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Revisar projeto de infraestrutura', dueAt: '2026-08-05T10:00' })
        .expect(201);

      expect(res.body).toMatchObject({
        title: 'Revisar projeto de infraestrutura',
        dueAt: '2026-08-05T10:00',
        status: 'pending',
        priority: 'medium',
      });
      expect(res.body.id).toBeDefined();
    });

    it('should return 400 when title is missing', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .send({ description: 'sem título' })
        .expect(400);
    });

    it('should return 400 for an invalid status', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Tarefa', status: 'invalid_status' })
        .expect(400);
    });

    it('should return 400 for an invalid priority', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Tarefa', priority: 'invalid_priority' })
        .expect(400);
    });
  });

  describe('GET /tasks', () => {
    it('should list tasks with pagination metadata', async () => {
      const res = await request(app.getHttpServer())
        .get('/tasks')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter by status', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Em andamento', status: 'in_progress' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/tasks')
        .query({ status: 'in_progress' })
        .expect(200);

      expect(res.body.total).toBeGreaterThan(0);
      for (const task of res.body.data as Task[]) {
        expect(task.status).toBe('in_progress');
      }
    });

    it('should filter by priority', async () => {
      const res = await request(app.getHttpServer())
        .get('/tasks')
        .query({ priority: 'high' })
        .expect(200);

      for (const task of res.body.data as Task[]) {
        expect(task.priority).toBe('high');
      }
    });

    it('should search by title', async () => {
      const res = await request(app.getHttpServer())
        .get('/tasks')
        .query({ search: 'Revisar' })
        .expect(200);

      expect(res.body.total).toBeGreaterThan(0);
      for (const task of res.body.data as Task[]) {
        expect(task.title).toMatch(/Revisar/i);
      }
    });
  });

  describe('GET /tasks/:id', () => {
    it('should return a single task', async () => {
      const created = await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Visita técnica' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get(`/tasks/${created.body.id}`)
        .expect(200);

      expect(res.body.id).toBe(created.body.id);
      expect(res.body.title).toBe('Visita técnica');
    });

    it('should return 404 for an unknown id', async () => {
      await request(app.getHttpServer())
        .get('/tasks/9999')
        .expect(404);
    });
  });

  describe('PATCH /tasks/:id', () => {
    it('should update a task', async () => {
      const created = await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Antes', priority: 'low' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .patch(`/tasks/${created.body.id}`)
        .send({ title: 'Depois', status: 'completed', priority: 'high' })
        .expect(200);

      expect(res.body.title).toBe('Depois');
      expect(res.body.status).toBe('completed');
      expect(res.body.priority).toBe('high');
    });

    it('should return 404 for an unknown id', async () => {
      await request(app.getHttpServer())
        .patch('/tasks/9999')
        .send({ title: 'X' })
        .expect(404);
    });

    it('should return 400 for an invalid priority', async () => {
      const created = await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Tarefa' })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/tasks/${created.body.id}`)
        .send({ priority: 'invalid_priority' })
        .expect(400);
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should delete a task', async () => {
      const created = await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Para excluir' })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/tasks/${created.body.id}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/tasks/${created.body.id}`)
        .expect(404);
    });

    it('should return 404 when the task does not exist', async () => {
      await request(app.getHttpServer())
        .delete('/tasks/9999')
        .expect(404);
    });
  });
});
