import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Company } from './company.entity';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';

describe('CompanyController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqljs',
          autoSave: false,
          location: ':memory:',
          entities: [Company],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Company]),
      ],
      controllers: [CompanyController],
      providers: [CompanyService],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let companyId: number;

  describe('POST /companies', () => {
    it('should create a company with ativa default true', async () => {
      const res = await request(app.getHttpServer())
        .post('/companies')
        .send({ nome: 'EA Projetos Telecom Ltda', cnpj: '12.345.678/0001-90' })
        .expect(201);

      expect(res.body).toMatchObject({
        nome: 'EA Projetos Telecom Ltda',
        cnpj: '12.345.678/0001-90',
        ativa: true,
      });
      companyId = res.body.id;
    });

    it('should return 400 when nome is missing', async () => {
      await request(app.getHttpServer())
        .post('/companies')
        .send({ cnpj: '98.765.432/0001-10' })
        .expect(400);
    });

    it('should return 400 for an invalid email', async () => {
      await request(app.getHttpServer())
        .post('/companies')
        .send({ nome: 'Empresa', email: 'invalido' })
        .expect(400);
    });
  });

  describe('GET /companies', () => {
    it('should list companies', async () => {
      const res = await request(app.getHttpServer()).get('/companies').expect(200);
      expect(res.body.total).toBe(1);
      expect(res.body.data[0].nome).toBe('EA Projetos Telecom Ltda');
    });

    it('should search companies', async () => {
      const res = await request(app.getHttpServer())
        .get('/companies')
        .query({ search: 'telecom' })
        .expect(200);
      expect(res.body.total).toBe(1);

      const empty = await request(app.getHttpServer())
        .get('/companies')
        .query({ search: 'nada-a-ver' })
        .expect(200);
      expect(empty.body.total).toBe(0);
    });
  });

  describe('GET /companies/:id', () => {
    it('should return the company', async () => {
      const res = await request(app.getHttpServer()).get(`/companies/${companyId}`).expect(200);
      expect(res.body.nome).toBe('EA Projetos Telecom Ltda');
    });

    it('should return 404 when not found', async () => {
      await request(app.getHttpServer()).get('/companies/999').expect(404);
    });
  });

  describe('PATCH /companies/:id', () => {
    it('should update the company', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/companies/${companyId}`)
        .send({ cidade: 'São Paulo', ativa: false })
        .expect(200);

      expect(res.body.cidade).toBe('São Paulo');
      expect(res.body.ativa).toBe(false);
    });

    it('should return 400 for an empty body', async () => {
      await request(app.getHttpServer()).patch(`/companies/${companyId}`).send({}).expect(400);
    });
  });

  describe('DELETE /companies/:id', () => {
    it('should delete the company', async () => {
      const res = await request(app.getHttpServer()).delete(`/companies/${companyId}`).expect(200);
      expect(res.body.message).toBe('Empresa excluída com sucesso');

      await request(app.getHttpServer()).get(`/companies/${companyId}`).expect(404);
    });

    it('should return 404 when deleting non-existent company', async () => {
      await request(app.getHttpServer()).delete('/companies/999').expect(404);
    });
  });
});
