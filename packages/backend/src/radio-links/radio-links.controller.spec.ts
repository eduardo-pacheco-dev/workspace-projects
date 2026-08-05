import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { AuthGuard } from '@nestjs/passport';
import request from 'supertest';
import { Repository } from 'typeorm';
import { RadioLink } from './radio-link.entity';
import { Station } from '../stations/station.entity';
import { RadioLinksController } from './radio-links.controller';
import { RadioLinksService } from './radio-links.service';

describe('RadioLinksController (integration)', () => {
  let app: INestApplication;

  const currentUser: {
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

  const mockAuthGuard = {
    canActivate: (context: any) => {
      const req = context.switchToHttp().getRequest();
      req.user = currentUser;
      return true;
    },
  };

  let radioLinkRepo: Repository<RadioLink>;
  let stationRepo: Repository<Station>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqljs',
          autoSave: false,
          location: ':memory:',
          entities: [RadioLink, Station],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([RadioLink, Station]),
      ],
      controllers: [RadioLinksController],
      providers: [RadioLinksService],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    radioLinkRepo = moduleRef.get<Repository<RadioLink>>(getRepositoryToken(RadioLink));
    stationRepo = moduleRef.get<Repository<Station>>(getRepositoryToken(Station));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await radioLinkRepo.clear();
    await stationRepo.clear();
  });

  describe('POST /radio-links', () => {
    it('should create a radio link with ativo default', async () => {
      const res = await request(app.getHttpServer())
        .post('/radio-links')
        .send({ nome: 'ENLACE-001', frequencia: '23 GHz' })
        .expect(201);

      expect(res.body).toMatchObject({ nome: 'ENLACE-001', frequencia: '23 GHz', status: 'ativo' });
    });

    it('should return 400 when nome is missing', async () => {
      await request(app.getHttpServer()).post('/radio-links').send({ frequencia: '23 GHz' }).expect(400);
    });

    it('should return 400 for an invalid status', async () => {
      await request(app.getHttpServer())
        .post('/radio-links')
        .send({ nome: 'ENLACE-X', status: 'desativado' })
        .expect(400);
    });
  });

  describe('POST /radio-links/import', () => {
    it('should import new radio links', async () => {
      const res = await request(app.getHttpServer())
        .post('/radio-links/import')
        .send({
          radioLinks: [
            { nome: 'ENLACE-100', frequencia: '23 GHz' },
            { nome: 'ENLACE-101', capacidade: '1 Gbps' },
          ],
        })
        .expect(201);

      expect(res.body).toEqual({ imported: 2, updated: 0, skipped: 0, errors: [] });

      const list = await request(app.getHttpServer()).get('/radio-links').expect(200);
      expect(list.body.total).toBe(2);
    });

    it('should update radio links that already exist by nome', async () => {
      await radioLinkRepo.save({ nome: 'ENLACE-200', status: 'ativo' });

      const res = await request(app.getHttpServer())
        .post('/radio-links/import')
        .send({
          radioLinks: [{ nome: 'ENLACE-200', status: 'inativo' }],
        })
        .expect(201);

      expect(res.body).toEqual({ imported: 0, updated: 1, skipped: 0, errors: [] });

      const updated = await radioLinkRepo.findOne({ where: { nome: 'ENLACE-200' } });
      expect(updated?.status).toBe('inativo');
    });

    it('should resolve station A and B by siteId', async () => {
      await stationRepo.save({
        id: 1,
        siteId: 'SITE-A1',
        endId: 'END-A1',
        endereco: 'Av A',
        operadora: 'TIM',
        status: 'ativo',
      });
      await stationRepo.save({
        id: 2,
        siteId: 'SITE-B1',
        endId: 'END-B1',
        endereco: 'Av B',
        operadora: 'CLARO',
        status: 'ativo',
      });

      const res = await request(app.getHttpServer())
        .post('/radio-links/import')
        .send({
          radioLinks: [
            {
              nome: 'ENLACE-300',
              siteIdA: 'SITE-A1',
              endIdA: 'END-A1',
              operadoraA: 'TIM',
              siteIdB: 'SITE-B1',
              operadoraB: 'CLARO',
            },
          ],
        })
        .expect(201);

      expect(res.body.imported).toBe(1);

      const saved = await radioLinkRepo.findOne({ where: { nome: 'ENLACE-300' } });
      expect(saved?.stationAId).toBe(1);
      expect(saved?.siteIdA).toBe('SITE-A1');
      expect(saved?.stationBId).toBe(2);
      expect(saved?.operadoraB).toBe('CLARO');
    });

    it('should skip rows without nome and report errors', async () => {
      const res = await request(app.getHttpServer())
        .post('/radio-links/import')
        .send({
          radioLinks: [{ nome: '' }, { nome: 'ENLACE-400' }],
        })
        .expect(201);

      expect(res.body.imported).toBe(1);
      expect(res.body.skipped).toBe(1);
      expect(res.body.errors).toEqual(['Linha 1: Nome é obrigatório.']);
    });

    it('should return 400 when radioLinks is empty or missing', async () => {
      await request(app.getHttpServer()).post('/radio-links/import').send({ radioLinks: [] }).expect(400);
      await request(app.getHttpServer()).post('/radio-links/import').send({}).expect(400);
    });
  });

  describe('GET /radio-links', () => {
    beforeEach(async () => {
      await radioLinkRepo.save([
        { nome: 'ENLACE-A', operadoraA: 'TIM', status: 'ativo' },
        { nome: 'ENLACE-B', operadoraA: 'CLARO', status: 'inativo' },
      ]);
    });

    it('should list radio links with total', async () => {
      const res = await request(app.getHttpServer()).get('/radio-links').expect(200);
      expect(res.body.total).toBe(2);
    });

    it('should filter by status', async () => {
      const res = await request(app.getHttpServer())
        .get('/radio-links')
        .query({ status: 'inativo' })
        .expect(200);
      expect(res.body.total).toBe(1);
      expect(res.body.data[0].nome).toBe('ENLACE-B');
    });

    it('should search radio links', async () => {
      const res = await request(app.getHttpServer())
        .get('/radio-links')
        .query({ search: 'ENLACE-B' })
        .expect(200);
      expect(res.body.total).toBe(1);
    });

    it('should paginate results', async () => {
      const res = await request(app.getHttpServer())
        .get('/radio-links')
        .query({ page: 1, limit: 1 })
        .expect(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.total).toBe(2);
    });
  });

  describe('GET /radio-links/:id', () => {
    it('should return the radio link', async () => {
      const created = await radioLinkRepo.save({ nome: 'ENLACE-X' });
      const res = await request(app.getHttpServer()).get(`/radio-links/${created.id}`).expect(200);
      expect(res.body.nome).toBe('ENLACE-X');
    });

    it('should return 404 when not found', async () => {
      await request(app.getHttpServer()).get('/radio-links/999').expect(404);
    });

    it('should return 400 for a non-numeric id', async () => {
      await request(app.getHttpServer()).get('/radio-links/abc').expect(400);
    });
  });

  describe('PATCH /radio-links/:id', () => {
    it('should update the radio link', async () => {
      const created = await radioLinkRepo.save({ nome: 'ENLACE-Y' });
      const res = await request(app.getHttpServer())
        .patch(`/radio-links/${created.id}`)
        .send({ capacidade: '1 Gbps', status: 'inativo' })
        .expect(200);

      expect(res.body.capacidade).toBe('1 Gbps');
      expect(res.body.status).toBe('inativo');
    });

    it('should return 404 when radio link does not exist', async () => {
      await request(app.getHttpServer()).patch('/radio-links/999').send({ capacidade: 'X' }).expect(404);
    });
  });

  describe('DELETE /radio-links/:id', () => {
    it('should delete the radio link', async () => {
      const created = await radioLinkRepo.save({ nome: 'ENLACE-D' });
      await request(app.getHttpServer()).delete(`/radio-links/${created.id}`).expect(200);
      await request(app.getHttpServer()).get(`/radio-links/${created.id}`).expect(404);
    });

    it('should return 404 when deleting a non-existent radio link', async () => {
      await request(app.getHttpServer()).delete('/radio-links/999').expect(404);
    });
  });
});
