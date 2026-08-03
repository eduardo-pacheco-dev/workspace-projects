import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard } from '@nestjs/passport';
import request from 'supertest';
import { Collaborator } from './collaborator.entity';
import { CollaboratorsController } from './collaborators.controller';
import { CollaboratorsService } from './collaborators.service';

describe('CollaboratorsController (integration)', () => {
  let app: INestApplication;

  const mockAuthGuard = {
    canActivate: (context: any) => {
      const req = context.switchToHttp().getRequest();
      req.user = { id: 1, email: 'admin@admin.com', name: 'Admin', role: 'master', companyId: null };
      return true;
    },
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqljs',
          autoSave: false,
          location: ':memory:',
          entities: [Collaborator],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Collaborator]),
      ],
      controllers: [CollaboratorsController],
      providers: [CollaboratorsService],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let collaboratorId: number;

  describe('POST /collaborators', () => {
    it('should create a collaborator with ativo default and generated codigo', async () => {
      const res = await request(app.getHttpServer())
        .post('/collaborators')
        .send({ nome: 'João Silva', cargo: 'Diretor Técnico', email: 'joao@empresa.com' })
        .expect(201);

      expect(res.body).toMatchObject({
        nome: 'João Silva',
        cargo: 'Diretor Técnico',
        email: 'joao@empresa.com',
        status: 'ativo',
        codigo: 'COL-0001',
      });
      collaboratorId = res.body.id;
    });

    it('should return 400 when nome is missing', async () => {
      await request(app.getHttpServer()).post('/collaborators').send({ cargo: 'X' }).expect(400);
    });

    it('should return 400 for an invalid email', async () => {
      await request(app.getHttpServer())
        .post('/collaborators')
        .send({ nome: 'Maria', email: 'invalido' })
        .expect(400);
    });
  });

  describe('GET /collaborators', () => {
    it('should list collaborators', async () => {
      const res = await request(app.getHttpServer()).get('/collaborators').expect(200);
      expect(res.body.total).toBe(1);
      expect(res.body.data[0].nome).toBe('João Silva');
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
  });

  describe('GET /collaborators/:id', () => {
    it('should return the collaborator', async () => {
      const res = await request(app.getHttpServer()).get(`/collaborators/${collaboratorId}`).expect(200);
      expect(res.body.nome).toBe('João Silva');
    });

    it('should return 404 when not found', async () => {
      await request(app.getHttpServer()).get('/collaborators/999').expect(404);
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
});
