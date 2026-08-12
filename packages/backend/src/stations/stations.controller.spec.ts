import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { AuthGuard } from '@nestjs/passport';
import request from 'supertest';
import { Repository } from 'typeorm';
import { StationEntity } from './infrastructure/station.entity';
import { TypeOrmStationRepository } from './infrastructure/typeorm-station.repository';
import { STATION_REPOSITORY } from './domain/station.repository';
import { StationsController } from './stations.controller';
import { StationsService } from './stations.service';

describe('StationsController (integration)', () => {
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

  let stationRepo: Repository<StationEntity>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqljs',
          autoSave: false,
          location: ':memory:',
          entities: [StationEntity],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([StationEntity]),
      ],
      controllers: [StationsController],
      providers: [
        StationsService,
        { provide: STATION_REPOSITORY, useClass: TypeOrmStationRepository },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    stationRepo = moduleRef.get<Repository<StationEntity>>(getRepositoryToken(StationEntity));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await stationRepo.clear();
  });

  describe('POST /stations', () => {
    it('should create a station with ativo default', async () => {
      const res = await request(app.getHttpServer())
        .post('/stations')
        .send({ siteId: 'SITE-001', endId: 'END-001', mobileCarrier: 'TIM' })
        .expect(201);

      expect(res.body).toMatchObject({
        siteId: 'SITE-001',
        endId: 'END-001',
        mobileCarrier: 'TIM',
        status: 'ativo',
      });
    });

    it('should return 400 when siteId is missing', async () => {
      await request(app.getHttpServer()).post('/stations').send({ endId: 'END-002' }).expect(400);
    });

    it('should create a station without endId (optional field)', async () => {
      const res = await request(app.getHttpServer())
        .post('/stations')
        .send({ siteId: 'SITE-002' })
        .expect(201);

      expect(res.body.siteId).toBe('SITE-002');
      expect(res.body.endId).toBe('');
    });

    it('should return 400 for an invalid status', async () => {
      await request(app.getHttpServer())
        .post('/stations')
        .send({ siteId: 'SITE-003', endId: 'END-003', status: 'desativado' })
        .expect(400);
    });

    it('should return 400 for an invalid mobileCarrier', async () => {
      await request(app.getHttpServer())
        .post('/stations')
        .send({ siteId: 'SITE-004', endId: 'END-004', mobileCarrier: 'OI' })
        .expect(400);
    });

    it('should clear endId when mobileCarrier is not TIM', async () => {
      const res = await request(app.getHttpServer())
        .post('/stations')
        .send({ siteId: 'SITE-005', endId: 'END-005', mobileCarrier: 'CLARO' })
        .expect(201);

      expect(res.body.endId).toBe('');
    });

    it('should create a non-TIM station without endId', async () => {
      const res = await request(app.getHttpServer())
        .post('/stations')
        .send({ siteId: 'SITE-006', mobileCarrier: 'VIVO' })
        .expect(201);

      expect(res.body.endId).toBe('');
    });

    it('should create a station with technical fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/stations')
        .send({
          siteId: 'SITE-TECH',
          endId: 'END-TECH',
          elementType: 'Macro',
          technology: '4G',
          areaHolder: 'Detentora A',
          infraContractType: 'Locação',
          infraHolder: 'Infra B',
          infraType: 'Torre',
          evType: 'EV-01',
          evSupplier: 'Fornecedor X',
          regional: 'Norte',
          towerType: 'Torre treliçada',
          nominalAev: 120,
          groundArea: 45.5,
          structureHeight: 60,
          stationId: 'ST-999',
        })
        .expect(201);

      expect(res.body).toMatchObject({
        elementType: 'Macro',
        technology: '4G',
        areaHolder: 'Detentora A',
        infraContractType: 'Locação',
        infraHolder: 'Infra B',
        infraType: 'Torre',
        evType: 'EV-01',
        evSupplier: 'Fornecedor X',
        regional: 'Norte',
        towerType: 'Torre treliçada',
        nominalAev: 120,
        groundArea: 45.5,
        structureHeight: 60,
        stationId: 'ST-999',
      });
    });

    it('should return 400 for a non-numeric nominalAev', async () => {
      await request(app.getHttpServer())
        .post('/stations')
        .send({ siteId: 'SITE-TECH2', endId: 'END-TECH2', nominalAev: 'abc' })
        .expect(400);
    });
  });

  describe('POST /stations/import', () => {
    it('should import new stations', async () => {
      const res = await request(app.getHttpServer())
        .post('/stations/import')
        .send({
          stations: [
            { siteId: 'SITE-100', endId: 'END-100', mobileCarrier: 'TIM', status: 'ativo' },
            { siteId: 'SITE-101', endId: 'END-101', mobileCarrier: 'CLARO' },
          ],
        })
        .expect(201);

      expect(res.body).toEqual({ imported: 2, updated: 0, skipped: 0, errors: [] });

      const list = await request(app.getHttpServer()).get('/stations').expect(200);
      expect(list.body.total).toBe(2);
    });

    it('should update stations that already exist', async () => {
      await stationRepo.save({ siteId: 'SITE-200', endId: 'END-200', mobileCarrier: 'TIM', status: 'ativo' });

      const res = await request(app.getHttpServer())
        .post('/stations/import')
        .send({
          stations: [
            { siteId: 'SITE-200', endId: 'END-200', mobileCarrier: 'TIM', status: 'inativo' },
          ],
        })
        .expect(201);

      expect(res.body).toEqual({ imported: 0, updated: 1, skipped: 0, errors: [] });

      const updated = await stationRepo.findOne({ where: { siteId: 'SITE-200', endId: 'END-200' } });
      expect(updated?.status).toBe('inativo');
    });

    it('should update existing non-TIM stations by siteId', async () => {
      await stationRepo.save({ siteId: 'SITE-210', endId: '', mobileCarrier: 'CLARO', status: 'ativo' });

      const res = await request(app.getHttpServer())
        .post('/stations/import')
        .send({
          stations: [
            { siteId: 'SITE-210', mobileCarrier: 'CLARO', status: 'inativo' },
          ],
        })
        .expect(201);

      expect(res.body).toEqual({ imported: 0, updated: 1, skipped: 0, errors: [] });

      const updated = await stationRepo.findOne({ where: { siteId: 'SITE-210' } });
      expect(updated?.status).toBe('inativo');
      expect(updated?.endId).toBe('');
    });

    it('should mix inserts and updates', async () => {
      await stationRepo.save({ siteId: 'SITE-300', endId: 'END-300', mobileCarrier: 'TIM' });

      const res = await request(app.getHttpServer())
        .post('/stations/import')
        .send({
          stations: [
            { siteId: 'SITE-300', endId: 'END-300', mobileCarrier: 'TIM' },
            { siteId: 'SITE-301', endId: 'END-301', mobileCarrier: 'TIM' },
          ],
        })
        .expect(201);

      expect(res.body).toEqual({ imported: 1, updated: 1, skipped: 0, errors: [] });
    });

    it('should skip invalid rows and report errors', async () => {
      const res = await request(app.getHttpServer())
        .post('/stations/import')
        .send({
          stations: [
            { siteId: '', endId: 'END-400' },
            { siteId: 'SITE-401', endId: 'END-401' },
          ],
        })
        .expect(201);

      expect(res.body.imported).toBe(1);
      expect(res.body.skipped).toBe(1);
      expect(res.body.errors).toEqual(['Linha 1: Site ID e End ID são obrigatórios.']);
    });

    it('should return 400 when stations is empty or missing', async () => {
      await request(app.getHttpServer()).post('/stations/import').send({ stations: [] }).expect(400);
      await request(app.getHttpServer()).post('/stations/import').send({}).expect(400);
    });

    it('should trim whitespace and normalize values', async () => {
      const res = await request(app.getHttpServer())
        .post('/stations/import')
        .send({
          stations: [
            { siteId: '  SITE-500  ', endId: '  END-500  ', status: 'INATIVO' },
          ],
        })
        .expect(201);

      expect(res.body.imported).toBe(1);
      const saved = await stationRepo.findOne({ where: { siteId: 'SITE-500', endId: 'END-500' } });
      expect(saved?.status).toBe('ativo');
    });

    it('should clear endId for non-TIM rows in import', async () => {
      const res = await request(app.getHttpServer())
        .post('/stations/import')
        .send({
          stations: [
            { siteId: 'SITE-600', endId: 'END-600', mobileCarrier: 'CLARO' },
            { siteId: 'SITE-601', mobileCarrier: 'VIVO' },
          ],
        })
        .expect(201);

      expect(res.body).toEqual({ imported: 2, updated: 0, skipped: 0, errors: [] });

      const claro = await stationRepo.findOne({ where: { siteId: 'SITE-600' } });
      const vivo = await stationRepo.findOne({ where: { siteId: 'SITE-601' } });
      expect(claro?.endId).toBe('');
      expect(vivo?.endId).toBe('');
    });
  });

  describe('GET /stations', () => {
    beforeEach(async () => {
      await stationRepo.save([
        { siteId: 'SITE-A1', endId: 'END-A1', mobileCarrier: 'TIM', status: 'ativo' },
        { siteId: 'SITE-B2', endId: 'END-B2', mobileCarrier: 'CLARO', status: 'inativo' },
      ]);
    });

    it('should list stations with total', async () => {
      const res = await request(app.getHttpServer()).get('/stations').expect(200);
      expect(res.body.total).toBe(2);
      expect(res.body.data).toHaveLength(2);
    });

    it('should filter by status', async () => {
      const res = await request(app.getHttpServer())
        .get('/stations')
        .query({ status: 'inativo' })
        .expect(200);
      expect(res.body.total).toBe(1);
      expect(res.body.data[0].siteId).toBe('SITE-B2');
    });

    it('should filter by mobileCarrier', async () => {
      const res = await request(app.getHttpServer())
        .get('/stations')
        .query({ mobileCarrier: 'TIM' })
        .expect(200);
      expect(res.body.total).toBe(1);
      expect(res.body.data[0].siteId).toBe('SITE-A1');
    });

    it('should search stations', async () => {
      const res = await request(app.getHttpServer())
        .get('/stations')
        .query({ search: 'B2' })
        .expect(200);
      expect(res.body.total).toBe(1);
      expect(res.body.data[0].endId).toBe('END-B2');

      const empty = await request(app.getHttpServer())
        .get('/stations')
        .query({ search: 'nao-existe' })
        .expect(200);
      expect(empty.body.total).toBe(0);
    });

    it('should paginate results', async () => {
      const res = await request(app.getHttpServer())
        .get('/stations')
        .query({ page: 1, limit: 1 })
        .expect(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.total).toBe(2);
    });

    it('should sort by siteId descending', async () => {
      const res = await request(app.getHttpServer())
        .get('/stations')
        .query({ sortBy: 'siteId', sortOrder: 'DESC' })
        .expect(200);
      expect(res.body.data[0].siteId).toBe('SITE-B2');
    });
  });

  describe('GET /stations/:id', () => {
    it('should return the station', async () => {
      const created = await stationRepo.save({ siteId: 'SITE-X', endId: 'END-X' });
      const res = await request(app.getHttpServer()).get(`/stations/${created.id}`).expect(200);
      expect(res.body.siteId).toBe('SITE-X');
    });

    it('should return 404 when not found', async () => {
      await request(app.getHttpServer()).get('/stations/999').expect(404);
    });

    it('should return 400 for a non-numeric id', async () => {
      await request(app.getHttpServer()).get('/stations/abc').expect(400);
    });
  });

  describe('PATCH /stations/:id', () => {
    it('should update the station', async () => {
      const created = await stationRepo.save({ siteId: 'SITE-Y', endId: 'END-Y' });
      const res = await request(app.getHttpServer())
        .patch(`/stations/${created.id}`)
        .send({ address: 'Av. Nova, 10', status: 'inativo' })
        .expect(200);

      expect(res.body.address).toBe('Av. Nova, 10');
      expect(res.body.status).toBe('inativo');
    });

    it('should accept an empty body without errors', async () => {
      const created = await stationRepo.save({ siteId: 'SITE-Z', endId: 'END-Z' });
      const res = await request(app.getHttpServer()).patch(`/stations/${created.id}`).send({}).expect(200);
      expect(res.body.siteId).toBe('SITE-Z');
    });

    it('should return 404 when station does not exist', async () => {
      await request(app.getHttpServer()).patch('/stations/999').send({ address: 'X' }).expect(404);
    });
  });

  describe('DELETE /stations/:id', () => {
    it('should delete the station', async () => {
      const created = await stationRepo.save({ siteId: 'SITE-D', endId: 'END-D' });
      await request(app.getHttpServer()).delete(`/stations/${created.id}`).expect(200);
      await request(app.getHttpServer()).get(`/stations/${created.id}`).expect(404);
    });

    it('should return 404 when deleting a non-existent station', async () => {
      await request(app.getHttpServer()).delete('/stations/999').expect(404);
    });
  });
});
