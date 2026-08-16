import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard } from '@nestjs/passport';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DashboardNoteEntity } from './dashboard-note.entity';
import { DashboardNotesModule } from './dashboard-notes.module';

describe('DashboardNotesController (integração)', () => {
  let app: INestApplication;
  let repo: any;

  let currentUser: { id: number } = { id: 7 };

  const mockAuthGuard = {
    canActivate: (context: any) => {
      const req = context.switchToHttp().getRequest();
      req.user = currentUser;
      return true;
    },
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqljs' as any,
          autoSave: false,
          location: ':memory:',
          entities: [DashboardNoteEntity],
          synchronize: true,
        }),
        DashboardNotesModule,
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockAuthGuard)
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    repo = module.get(getRepositoryToken(DashboardNoteEntity));
  });

  afterAll(async () => {
    await app.close();
  });

  const authRequest = (method: 'get' | 'put', url: string, body?: any) => {
    const req = request(app.getHttpServer())[method](url);
    if (body !== undefined) req.send(body);
    return req;
  };

  it('should return empty content for a user without a note', async () => {
    const res = await authRequest('get', '/dashboard-notes/me');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ content: null });
  });

  it('should save and retrieve the note', async () => {
    const content = 'meu rascunho de teste';

    const saveRes = await authRequest('put', '/dashboard-notes/me', { content });
    expect(saveRes.status).toBe(200);
    expect(saveRes.body.content).toBe(content);

    const getRes = await authRequest('get', '/dashboard-notes/me');
    expect(getRes.status).toBe(200);
    expect(getRes.body.content).toBe(content);
  });

  it('should update an existing note', async () => {
    await authRequest('put', '/dashboard-notes/me', { content: 'primeira versão' });
    const res = await authRequest('put', '/dashboard-notes/me', { content: 'segunda versão' });

    expect(res.status).toBe(200);
    expect(res.body.content).toBe('segunda versão');

    const notes = await repo.find();
    expect(notes).toHaveLength(1);
    expect(notes[0].content).toBe('segunda versão');
  });

  it('should keep notes isolated per user', async () => {
    currentUser = { id: 1 };
    await authRequest('put', '/dashboard-notes/me', { content: 'nota do usuário 1' });

    currentUser = { id: 2 };
    const res = await authRequest('get', '/dashboard-notes/me');

    expect(res.status).toBe(200);
    expect(res.body.content).toBeNull();
  });
});
