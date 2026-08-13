import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { SystemSetting } from './settings.entity';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

describe('SettingsController (integration)', () => {
  let app: INestApplication;
  let currentRole = 'master';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqljs',
          autoSave: false,
          location: ':memory:',
          entities: [SystemSetting],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([SystemSetting]),
      ],
      controllers: [SettingsController],
      providers: [SettingsService],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use((req: any, _res: any, next: any) => {
      req.user = { id: 1, role: currentRole };
      next();
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    currentRole = 'master';
  });

  describe('GET /settings', () => {
    it('should return an empty record initially', async () => {
      const res = await request(app.getHttpServer()).get('/settings').expect(200);
      expect(res.body).toEqual({});
    });
  });

  describe('PUT /settings', () => {
    it('should upsert settings and return the full record', async () => {
      const res = await request(app.getHttpServer())
        .put('/settings')
        .send({
          companyName: 'EA Projetos Telecom',
          companyEmail: 'contato@eaprojetos.com.br',
          currency: 'BRL',
        })
        .expect(200);

      expect(res.body).toMatchObject({
        companyName: 'EA Projetos Telecom',
        companyEmail: 'contato@eaprojetos.com.br',
        currency: 'BRL',
      });
    });

    it('should merge partial updates', async () => {
      const res = await request(app.getHttpServer())
        .put('/settings')
        .send({ currency: 'USD' })
        .expect(200);

      expect(res.body).toMatchObject({
        companyName: 'EA Projetos Telecom',
        companyEmail: 'contato@eaprojetos.com.br',
        currency: 'USD',
      });
    });

    it('should strip unknown keys', async () => {
      const res = await request(app.getHttpServer())
        .put('/settings')
        .send({ companyName: 'Nova Empresa', bogusKey: 'nope' })
        .expect(200);

      expect(res.body.companyName).toBe('Nova Empresa');
      expect(res.body).not.toHaveProperty('bogusKey');
    });

    it('should return 400 for an empty body', async () => {
      await request(app.getHttpServer()).put('/settings').send({}).expect(400);
    });

    it('should allow admin role to update settings', async () => {
      currentRole = 'admin';

      const res = await request(app.getHttpServer())
        .put('/settings')
        .send({ currency: 'EUR' })
        .expect(200);

      expect(res.body.currency).toBe('EUR');
    });

    it('should forbid non-admin roles from updating settings', async () => {
      currentRole = 'user';

      const res = await request(app.getHttpServer())
        .put('/settings')
        .send({ currency: 'USD' })
        .expect(403);

      expect(res.body.message).toContain('administradores');
    });

    it('should return 400 for an invalid email', async () => {
      await request(app.getHttpServer())
        .put('/settings')
        .send({ companyEmail: 'nao-e-email' })
        .expect(400);
    });

    it('should return 400 for empty company name', async () => {
      await request(app.getHttpServer())
        .put('/settings')
        .send({ companyName: '' })
        .expect(400);
    });
  });
});
