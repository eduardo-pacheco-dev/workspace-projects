import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { Lpu } from './lpu.entity';
import { CollaboratorEntity } from '../collaborators/infrastructure/collaborator.entity';
import { Company } from '../companies/company.entity';
import { LpuController } from './lpu.controller';
import { LpuService } from './lpu.service';

describe('LpuController (integration)', () => {
  let app: INestApplication;

  let currentUser: {
    id: number;
    email: string;
    name: string;
    role: string;
    companyId: number | null;
  } = {
    id: 1,
    email: 'admin@admin.com',
    name: 'Admin',
    role: 'master',
    companyId: null,
  };

  let companyId: number;
  let freelancerId: number;
  let lpuId: number;

  const companyRepo = () => app.get('CompanyRepository') as any;
  const collaboratorRepo = () => app.get('CollaboratorEntityRepository') as any;

  const createCompany = async (nome: string) => {
    const saved = await companyRepo().save(companyRepo().create({ nome, ativa: true }));
    return saved.id;
  };

  const createFreelancer = async (cId: number) => {
    const saved = await collaboratorRepo().save(
      collaboratorRepo().create({
        nome: 'Carlos Silva',
        companyId: cId,
        isFreelancer: true,
        status: 'ativo',
      }),
    );
    return saved.id;
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqljs',
          autoSave: false,
          location: ':memory:',
          entities: [Lpu, CollaboratorEntity, Company],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Lpu, CollaboratorEntity, Company]),
      ],
      controllers: [LpuController],
      providers: [LpuService],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use((req: any, _res: any, next: any) => {
      req.user = currentUser;
      next();
    });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    companyId = await createCompany('Empresa Principal');
    freelancerId = await createFreelancer(companyId);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /lpus', () => {
    it('should create an lpu', async () => {
      const res = await request(app.getHttpServer())
        .post('/lpus')
        .send({ freelancerId, nome: 'LPU Torre 01', descricao: 'Manutenção', valor: 1500.5, status: 'ativo' })
        .expect(201);

      expect(res.body).toMatchObject({ nome: 'LPU Torre 01', valor: 1500.5 });
      lpuId = res.body.id;
    });

    it('should return 400 for missing nome', async () => {
      await request(app.getHttpServer()).post('/lpus').send({ freelancerId }).expect(400);
    });
  });

  describe('GET /lpus', () => {
    it('should list lpus with freelancer name', async () => {
      const res = await request(app.getHttpServer()).get('/lpus').expect(200);
      expect(res.body.total).toBe(1);
      expect(res.body.data[0].nome).toBe('LPU Torre 01');
      expect(res.body.data[0].freelancer.nome).toBe('Carlos Silva');
    });

    it('should search lpus', async () => {
      const res = await request(app.getHttpServer()).get('/lpus').query({ search: 'Torre' }).expect(200);
      expect(res.body.total).toBe(1);

      const empty = await request(app.getHttpServer()).get('/lpus').query({ search: 'nada-a-ver' }).expect(200);
      expect(empty.body.total).toBe(0);
    });

    it('should filter by status', async () => {
      const res = await request(app.getHttpServer()).get('/lpus').query({ status: 'inativo' }).expect(200);
      expect(res.body.total).toBe(0);
    });

    it('should scope by company for non-master users', async () => {
      const otherCompanyId = await createCompany('Outra Empresa');
      const freelancerB = await createFreelancer(otherCompanyId);

      currentUser = { id: 2, email: 'user@b.com', name: 'User', role: 'user', companyId: otherCompanyId };
      const before = await request(app.getHttpServer()).get('/lpus').expect(200);
      expect(before.body.total).toBe(0);

      await request(app.getHttpServer())
        .post('/lpus')
        .send({ freelancerId: freelancerB, nome: 'LPU Outra', status: 'ativo' })
        .expect(201);

      const after = await request(app.getHttpServer()).get('/lpus').expect(200);
      expect(after.body.total).toBe(1);
      expect(after.body.data[0].nome).toBe('LPU Outra');
    });
  });

  describe('GET /lpus/:id', () => {
    it('should return the lpu', async () => {
      const res = await request(app.getHttpServer()).get(`/lpus/${lpuId}`).expect(200);
      expect(res.body.nome).toBe('LPU Torre 01');
    });

    it('should return 404 when not found', async () => {
      await request(app.getHttpServer()).get('/lpus/999').expect(404);
    });
  });

  describe('PATCH /lpus/:id', () => {
    it('should update the lpu', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/lpus/${lpuId}`)
        .send({ valor: 2000 })
        .expect(200);
      expect(res.body.valor).toBe(2000);
    });
  });

  describe('DELETE /lpus/:id', () => {
    it('should delete the lpu', async () => {
      await request(app.getHttpServer()).delete(`/lpus/${lpuId}`).expect(200);
      await request(app.getHttpServer()).get(`/lpus/${lpuId}`).expect(404);
    });
  });
});
