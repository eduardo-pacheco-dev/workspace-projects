import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { MsProject } from './ms-project.entity';
import { MsTask } from './ms-task.entity';
import { MsDependency } from './ms-dependency.entity';
import { MsResource } from './ms-resource.entity';
import { MsAssignment } from './ms-assignment.entity';
import { MsProjectController } from './ms-project.controller';
import { MsProjectService } from './ms-project.service';

describe('MsProjectController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqljs',
          autoSave: false,
          location: ':memory:',
          entities: [MsProject, MsTask, MsDependency, MsResource, MsAssignment],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([MsProject, MsTask, MsDependency, MsResource, MsAssignment]),
      ],
      controllers: [MsProjectController],
      providers: [MsProjectService],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let planId: number;

  describe('POST /ms-project', () => {
    it('should create a plan with defaults', async () => {
      const res = await request(app.getHttpServer())
        .post('/ms-project')
        .send({ name: 'Implantação de ERBS – Site Norte', startDate: '2026-08-03' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toMatchObject({
        name: 'Implantação de ERBS – Site Norte',
        startDate: '2026-08-03',
        workingDays: [1, 2, 3, 4, 5],
        status: 'not_started',
      });
      planId = res.body.id;
    });

    it('should return 400 when name is missing', async () => {
      await request(app.getHttpServer())
        .post('/ms-project')
        .send({ description: 'sem nome' })
        .expect(400);
    });

    it('should ignore client-provided status (derived by the service)', async () => {
      const res = await request(app.getHttpServer())
        .post('/ms-project')
        .send({ name: 'Projeto', status: 'completed' })
        .expect(201);

      expect(res.body.status).toBe('not_started');
    });

    it('should return 400 for an invalid working day', async () => {
      await request(app.getHttpServer())
        .post('/ms-project')
        .send({ name: 'Projeto', workingDays: [7] })
        .expect(400);
    });
  });

  describe('POST /ms-project/:projectId/tasks', () => {
    it('should add tasks and compute the schedule', async () => {
      const t1 = await request(app.getHttpServer())
        .post(`/ms-project/${planId}/tasks`)
        .send({ name: 'Levantamento topográfico', durationDays: 2, percentComplete: 100 })
        .expect(201);

      expect(t1.body.tasks.length).toBe(1);
      expect(t1.body.tasks[0].position).toBe(1);

      const t2 = await request(app.getHttpServer())
        .post(`/ms-project/${planId}/tasks`)
        .send({ name: 'Projeto executivo', durationDays: 3 })
        .expect(201);

      const task2 = t2.body.tasks[t2.body.tasks.length - 1];
      expect(task2.position).toBe(2);
      expect(task2.startDate).toBe('2026-08-03');
      expect(task2.finishDate).toBe('2026-08-05');
    });

    it('should return 400 for an invalid priority', async () => {
      await request(app.getHttpServer())
        .post(`/ms-project/${planId}/tasks`)
        .send({ name: 'Tarefa', priority: 'invalid_priority' })
        .expect(400);
    });

    it('should return 404 when the plan does not exist', async () => {
      await request(app.getHttpServer())
        .post('/ms-project/9999/tasks')
        .send({ name: 'Tarefa' })
        .expect(404);
    });
  });

  describe('POST /ms-project/:projectId/dependencies', () => {
    it('should add a dependency and recompute successor dates', async () => {
      await request(app.getHttpServer())
        .post(`/ms-project/${planId}/tasks`)
        .send({ name: 'Instalação da torre', durationDays: 3 })
        .expect(201);

      const detail = await request(app.getHttpServer())
        .get(`/ms-project/${planId}`)
        .expect(200);

      const predecessor = detail.body.tasks.find((t: MsTask) => t.name === 'Levantamento topográfico');
      const successor = detail.body.tasks.find((t: MsTask) => t.name === 'Instalação da torre');

      const res = await request(app.getHttpServer())
        .post(`/ms-project/${planId}/dependencies`)
        .send({ taskId: successor.id, predecessorTaskId: predecessor.id, type: 'FS' })
        .expect(201);

      const dep = res.body.dependencies.find((d: MsDependency) => d.taskId === successor.id);
      expect(dep).toMatchObject({ type: 'FS', lagDays: 0 });

      const recomputed = res.body.tasks.find((t: MsTask) => t.name === 'Instalação da torre');
      expect(recomputed.startDate).toBe('2026-08-05');
      expect(recomputed.finishDate).toBe('2026-08-07');
    });

    it('should reject self-dependencies', async () => {
      const detail = await request(app.getHttpServer())
        .get(`/ms-project/${planId}`)
        .expect(200);

      const task = detail.body.tasks[0];
      await request(app.getHttpServer())
        .post(`/ms-project/${planId}/dependencies`)
        .send({ taskId: task.id, predecessorTaskId: task.id })
        .expect(400);
    });

    it('should reject duplicate dependencies', async () => {
      const detail = await request(app.getHttpServer())
        .get(`/ms-project/${planId}`)
        .expect(200);

      const predecessor = detail.body.tasks.find((t: MsTask) => t.name === 'Levantamento topográfico');
      const successor = detail.body.tasks.find((t: MsTask) => t.name === 'Instalação da torre');

      await request(app.getHttpServer())
        .post(`/ms-project/${planId}/dependencies`)
        .send({ taskId: successor.id, predecessorTaskId: predecessor.id, type: 'FS' })
        .expect(400);
    });
  });

  describe('POST /ms-project/:projectId/resources and /assignments', () => {
    it('should add resources and assignments', async () => {
      const res = await request(app.getHttpServer())
        .post(`/ms-project/${planId}/resources`)
        .send({ name: 'Carlos Silva', type: 'work', maxUnits: 100 })
        .expect(201);

      const resource = res.body.resources[res.body.resources.length - 1];
      expect(resource).toMatchObject({ name: 'Carlos Silva', type: 'work', maxUnits: 100 });

      const detail = await request(app.getHttpServer())
        .get(`/ms-project/${planId}`)
        .expect(200);
      const task = detail.body.tasks[0];

      const assigned = await request(app.getHttpServer())
        .post(`/ms-project/${planId}/assignments`)
        .send({ taskId: task.id, resourceId: resource.id, units: 100, work: 16 })
        .expect(201);

      const assignment = assigned.body.assignments[assigned.body.assignments.length - 1];
      expect(assignment).toMatchObject({ taskId: task.id, resourceId: resource.id, units: 100, work: 16 });
    });

    it('should reject assignments for unknown resources', async () => {
      const detail = await request(app.getHttpServer())
        .get(`/ms-project/${planId}`)
        .expect(200);
      const task = detail.body.tasks[0];

      await request(app.getHttpServer())
        .post(`/ms-project/${planId}/assignments`)
        .send({ taskId: task.id, resourceId: 9999 })
        .expect(404);
    });
  });

  describe('GET /ms-project', () => {
    it('should list plans with pagination metadata', async () => {
      const res = await request(app.getHttpServer())
        .get('/ms-project')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(res.body.total).toBeGreaterThan(0);
    });
  });

  describe('GET /ms-project/:id', () => {
    it('should return a plan with schedule, tasks, dependencies, resources and assignments', async () => {
      const res = await request(app.getHttpServer())
        .get(`/ms-project/${planId}`)
        .expect(200);

      expect(res.body).toHaveProperty('schedule');
      expect(res.body.schedule.durationDays).toBeGreaterThan(0);
      expect(res.body.tasks.length).toBeGreaterThan(0);
      for (const task of res.body.tasks as MsTask[]) {
        expect(task.startDate).toBeDefined();
        expect(task.finishDate).toBeDefined();
        expect(typeof task.critical).toBe('boolean');
      }
      expect(res.body.dependencies.length).toBeGreaterThan(0);
      expect(res.body.resources.length).toBeGreaterThan(0);
      expect(res.body.assignments.length).toBeGreaterThan(0);
    });

    it('should return 404 for an unknown id', async () => {
      await request(app.getHttpServer())
        .get('/ms-project/9999')
        .expect(404);
    });
  });

  describe('POST /ms-project/:projectId/schedule', () => {
    it('should recompute the schedule explicitly', async () => {
      const res = await request(app.getHttpServer())
        .post(`/ms-project/${planId}/schedule`)
        .expect(201);

      expect(res.body.schedule).toBeDefined();
      expect(res.body.tasks[0].critical).toBeDefined();
    });
  });

  describe('PATCH /ms-project/:id', () => {
    it('should update a plan', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/ms-project/${planId}`)
        .send({ name: 'Implantação de ERBS – Site Norte (rev. 2)' })
        .expect(200);

      expect(res.body.name).toBe('Implantação de ERBS – Site Norte (rev. 2)');
    });

    it('should return 404 for an unknown id', async () => {
      await request(app.getHttpServer())
        .patch('/ms-project/9999')
        .send({ name: 'X' })
        .expect(404);
    });
  });

  describe('PATCH /ms-project/tasks/:id', () => {
    it('should update a task and recompute the schedule', async () => {
      const detail = await request(app.getHttpServer())
        .get(`/ms-project/${planId}`)
        .expect(200);
      const task = detail.body.tasks.find((t: MsTask) => t.name === 'Projeto executivo');

      const res = await request(app.getHttpServer())
        .patch(`/ms-project/tasks/${task.id}`)
        .send({ percentComplete: 50 })
        .expect(200);

      const updated = res.body.tasks.find((t: MsTask) => t.id === task.id);
      expect(updated.percentComplete).toBe(50);
    });

    it('should return 404 for an unknown task', async () => {
      await request(app.getHttpServer())
        .patch('/ms-project/tasks/9999')
        .send({ name: 'X' })
        .expect(404);
    });
  });

  describe('PATCH /ms-project/resources/:id', () => {
    it('should update a resource', async () => {
      const detail = await request(app.getHttpServer())
        .get(`/ms-project/${planId}`)
        .expect(200);
      const resource = detail.body.resources[0];

      const res = await request(app.getHttpServer())
        .patch(`/ms-project/resources/${resource.id}`)
        .send({ maxUnits: 80 })
        .expect(200);

      const updated = res.body.resources.find((r: MsResource) => r.id === resource.id);
      expect(updated.maxUnits).toBe(80);
    });
  });

  describe('PATCH /ms-project/assignments/:id', () => {
    it('should update an assignment', async () => {
      const detail = await request(app.getHttpServer())
        .get(`/ms-project/${planId}`)
        .expect(200);
      const assignment = detail.body.assignments[0];

      const res = await request(app.getHttpServer())
        .patch(`/ms-project/assignments/${assignment.id}`)
        .send({ units: 50 })
        .expect(200);

      const updated = res.body.assignments.find((a: MsAssignment) => a.id === assignment.id);
      expect(updated.units).toBe(50);
    });
  });

  describe('DELETE /ms-project/dependencies/:id', () => {
    it('should delete a dependency', async () => {
      const detail = await request(app.getHttpServer())
        .get(`/ms-project/${planId}`)
        .expect(200);
      const dependency = detail.body.dependencies[0];

      await request(app.getHttpServer())
        .delete(`/ms-project/dependencies/${dependency.id}`)
        .expect(200);

      const after = await request(app.getHttpServer())
        .get(`/ms-project/${planId}`)
        .expect(200);

      const remaining = after.body.dependencies.filter((d: MsDependency) => d.id === dependency.id);
      expect(remaining.length).toBe(0);
    });

    it('should return 404 when the dependency does not exist', async () => {
      await request(app.getHttpServer())
        .delete('/ms-project/dependencies/9999')
        .expect(404);
    });
  });

  describe('DELETE /ms-project/tasks/:id', () => {
    it('should delete a task', async () => {
      const detail = await request(app.getHttpServer())
        .get(`/ms-project/${planId}`)
        .expect(200);
      const task = detail.body.tasks[0];

      await request(app.getHttpServer())
        .delete(`/ms-project/tasks/${task.id}`)
        .expect(200);

      const after = await request(app.getHttpServer())
        .get(`/ms-project/${planId}`)
        .expect(200);

      const remaining = after.body.tasks.filter((t: MsTask) => t.id === task.id);
      expect(remaining.length).toBe(0);
    });

    it('should return 404 when the task does not exist', async () => {
      await request(app.getHttpServer())
        .delete('/ms-project/tasks/9999')
        .expect(404);
    });
  });

  describe('DELETE /ms-project/resources/:id', () => {
    it('should delete a resource and its assignments', async () => {
      const detail = await request(app.getHttpServer())
        .get(`/ms-project/${planId}`)
        .expect(200);
      const resource = detail.body.resources[0];

      await request(app.getHttpServer())
        .delete(`/ms-project/resources/${resource.id}`)
        .expect(200);

      const after = await request(app.getHttpServer())
        .get(`/ms-project/${planId}`)
        .expect(200);

      const remaining = after.body.resources.filter((r: MsResource) => r.id === resource.id);
      expect(remaining.length).toBe(0);
    });
  });

  describe('DELETE /ms-project/assignments/:id', () => {
    it('should delete an assignment', async () => {
      const res = await request(app.getHttpServer())
        .post(`/ms-project/${planId}/resources`)
        .send({ name: 'Ana Pereira', type: 'work' })
        .expect(201);
      const resource = res.body.resources[res.body.resources.length - 1];

      const detail = await request(app.getHttpServer())
        .get(`/ms-project/${planId}`)
        .expect(200);
      const task = detail.body.tasks[0];

      const assigned = await request(app.getHttpServer())
        .post(`/ms-project/${planId}/assignments`)
        .send({ taskId: task.id, resourceId: resource.id })
        .expect(201);
      const assignment = assigned.body.assignments[assigned.body.assignments.length - 1];

      await request(app.getHttpServer())
        .delete(`/ms-project/assignments/${assignment.id}`)
        .expect(200);

      const after = await request(app.getHttpServer())
        .get(`/ms-project/${planId}`)
        .expect(200);

      const remaining = after.body.assignments.filter((a: MsAssignment) => a.id === assignment.id);
      expect(remaining.length).toBe(0);
    });
  });

  describe('DELETE /ms-project/:id', () => {
    it('should delete a plan', async () => {
      await request(app.getHttpServer())
        .delete(`/ms-project/${planId}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/ms-project/${planId}`)
        .expect(404);
    });

    it('should return 404 when the plan does not exist', async () => {
      await request(app.getHttpServer())
        .delete('/ms-project/9999')
        .expect(404);
    });
  });
});
