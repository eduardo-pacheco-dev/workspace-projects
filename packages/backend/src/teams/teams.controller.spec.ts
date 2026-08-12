import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { AuthGuard } from '@nestjs/passport';
import request from 'supertest';
import { Repository } from 'typeorm';
import { Team } from './team.entity';
import { TeamMember } from './team-member.entity';
import { CollaboratorEntity } from '../collaborators/infrastructure/collaborator.entity';
import { Company } from '../companies/company.entity';
import { Lpu } from '../lpu/lpu.entity';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';

describe('TeamsController (integration)', () => {
  let app: INestApplication;

  let freelancerId: number;
  let collaboratorId: number;

  const currentUser = {
    id: 1,
    email: 'admin@admin.com',
    name: 'Admin',
    role: 'master',
    companyId: null,
  };

  const mockAuthGuard = {
    canActivate: (context: any) => {
      const req = context.switchToHttp().getRequest();
      req.user = currentUser;
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
          entities: [Team, TeamMember, CollaboratorEntity, Company, Lpu],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Team, TeamMember, CollaboratorEntity, Company, Lpu]),
      ],
      controllers: [TeamsController],
      providers: [TeamsService],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();

    const companyRepo = moduleRef.get<Repository<Company>>(getRepositoryToken(Company));
    const company = await companyRepo.save({ nome: 'EA Projetos Telecom Ltda' });

    const collaboratorRepo = moduleRef.get<Repository<CollaboratorEntity>>(getRepositoryToken(CollaboratorEntity));
    const saved = await collaboratorRepo.save([
      { nome: 'Carlos Silva', companyId: company.id, isFreelancer: true, status: 'ativo' },
      { nome: 'Ana Souza', companyId: company.id, isFreelancer: false, status: 'ativo' },
    ]);
    freelancerId = saved[0].id;
    collaboratorId = saved[1].id;
  });

  afterAll(async () => {
    await app.close();
  });

  let teamId: number;

  describe('POST /teams', () => {
    it('should create a team with ativo default', async () => {
      const res = await request(app.getHttpServer())
        .post('/teams')
        .send({ nome: 'Equipe Norte' })
        .expect(201);

      expect(res.body).toMatchObject({ nome: 'Equipe Norte', status: 'ativo' });
      teamId = res.body.id;
    });

    it('should return 400 when nome is missing', async () => {
      await request(app.getHttpServer()).post('/teams').send({}).expect(400);
    });

    it('should return 400 for an invalid status', async () => {
      await request(app.getHttpServer())
        .post('/teams')
        .send({ nome: 'Equipe', status: 'demitido' })
        .expect(400);
    });
  });

  describe('GET /teams', () => {
    it('should list teams', async () => {
      const res = await request(app.getHttpServer()).get('/teams').expect(200);
      expect(res.body.total).toBe(1);
      expect(res.body.data[0].nome).toBe('Equipe Norte');
    });

    it('should search teams', async () => {
      const res = await request(app.getHttpServer())
        .get('/teams')
        .query({ search: 'norte' })
        .expect(200);
      expect(res.body.total).toBe(1);

      const empty = await request(app.getHttpServer())
        .get('/teams')
        .query({ search: 'nao-existe' })
        .expect(200);
      expect(empty.body.total).toBe(0);
    });
  });

  describe('GET /teams/:id', () => {
    it('should return the team', async () => {
      const res = await request(app.getHttpServer()).get(`/teams/${teamId}`).expect(200);
      expect(res.body.nome).toBe('Equipe Norte');
    });

    it('should return 404 when not found', async () => {
      await request(app.getHttpServer()).get('/teams/999').expect(404);
    });
  });

  describe('PATCH /teams/:id', () => {
    it('should update the team', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/teams/${teamId}`)
        .send({ descricao: 'Equipe de campo' })
        .expect(200);

      expect(res.body.descricao).toBe('Equipe de campo');
    });

    it('should return 400 for an empty body', async () => {
      await request(app.getHttpServer()).patch(`/teams/${teamId}`).send({}).expect(400);
    });
  });

  describe('team members', () => {
    it('should add a freelancer member', async () => {
      const res = await request(app.getHttpServer())
        .post(`/teams/${teamId}/members`)
        .send({ collaboratorId: freelancerId })
        .expect(201);

      expect(res.body.teamId).toBe(teamId);
      expect(res.body.collaboratorId).toBe(freelancerId);
    });

    it('should return 409 for a duplicate member', async () => {
      await request(app.getHttpServer())
        .post(`/teams/${teamId}/members`)
        .send({ collaboratorId: freelancerId })
        .expect(409);
    });

    it('should return 404 for an unknown collaborator', async () => {
      await request(app.getHttpServer())
        .post(`/teams/${teamId}/members`)
        .send({ collaboratorId: 999 })
        .expect(404);
    });

    it('should return 400 without collaboratorId', async () => {
      await request(app.getHttpServer())
        .post(`/teams/${teamId}/members`)
        .send({})
        .expect(400);
    });

    it('should list the team with members loaded', async () => {
      const res = await request(app.getHttpServer()).get(`/teams/${teamId}`).expect(200);
      expect(res.body.members).toHaveLength(1);
      expect(res.body.members[0].collaborator.nome).toBe('Carlos Silva');
      expect(res.body.members[0].collaborator.isFreelancer).toBe(true);
    });

    it('should remove a member', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/teams/${teamId}/members/${freelancerId}`)
        .expect(200);
      expect(res.body.message).toBe('Membro removido da equipe com sucesso');
    });

    it('should return 404 when removing a non-member', async () => {
      await request(app.getHttpServer())
        .delete(`/teams/${teamId}/members/${freelancerId}`)
        .expect(404);
    });
  });

  describe('DELETE /teams/:id', () => {
    it('should delete the team', async () => {
      await request(app.getHttpServer()).delete(`/teams/${teamId}`).expect(200);
      await request(app.getHttpServer()).get(`/teams/${teamId}`).expect(404);
    });
  });
});
