import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { Repository } from 'typeorm';
import { ClientEntity } from './infrastructure/client.entity';
import { ResponsavelEntity } from './infrastructure/responsavel.entity';
import { TypeOrmClientRepository } from './infrastructure/typeorm-client.repository';
import { CLIENT_REPOSITORY } from './domain/client.repository';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

describe('ClientsController (integration)', () => {
  let app: INestApplication;
  let clientRepo: Repository<ClientEntity>;
  let responsavelRepo: Repository<ResponsavelEntity>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqljs',
          autoSave: false,
          location: ':memory:',
          entities: [ClientEntity, ResponsavelEntity],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([ClientEntity, ResponsavelEntity]),
      ],
      controllers: [ClientsController],
      providers: [
        ClientsService,
        { provide: CLIENT_REPOSITORY, useClass: TypeOrmClientRepository },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    clientRepo = moduleRef.get<Repository<ClientEntity>>(getRepositoryToken(ClientEntity));
    responsavelRepo = moduleRef.get<Repository<ResponsavelEntity>>(getRepositoryToken(ResponsavelEntity));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await responsavelRepo.clear();
    await clientRepo.clear();
  });

  describe('POST /clients', () => {
    it('should create a client with ativo default', async () => {
      const res = await request(app.getHttpServer())
        .post('/clients')
        .send({ nome: 'Empresa Teste', documento: '12345678000100' })
        .expect(201);

      expect(res.body).toMatchObject({
        nome: 'Empresa Teste',
        documento: '12345678000100',
        status: 'ativo',
      });
    });

    it('should return 400 when nome is missing', async () => {
      await request(app.getHttpServer()).post('/clients').send({ documento: '123' }).expect(400);
    });

    it('should return 400 for an invalid status', async () => {
      await request(app.getHttpServer())
        .post('/clients')
        .send({ nome: 'Empresa X', status: 'desativado' })
        .expect(400);
    });
  });

  describe('GET /clients', () => {
    beforeEach(async () => {
      await clientRepo.save([
        { nome: 'Empresa A', cidade: 'São Paulo', status: 'ativo' },
        { nome: 'Empresa B', cidade: 'Rio de Janeiro', status: 'inativo' },
      ]);
    });

    it('should list clients with total', async () => {
      const res = await request(app.getHttpServer()).get('/clients').expect(200);
      expect(res.body.total).toBe(2);
    });

    it('should filter by status', async () => {
      const res = await request(app.getHttpServer())
        .get('/clients')
        .query({ status: 'inativo' })
        .expect(200);
      expect(res.body.total).toBe(1);
      expect(res.body.data[0].nome).toBe('Empresa B');
    });

    it('should search clients', async () => {
      const res = await request(app.getHttpServer())
        .get('/clients')
        .query({ search: 'Empresa B' })
        .expect(200);
      expect(res.body.total).toBe(1);
    });

    it('should paginate results', async () => {
      const res = await request(app.getHttpServer())
        .get('/clients')
        .query({ page: 1, limit: 1 })
        .expect(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.total).toBe(2);
    });
  });

  describe('GET /clients/:id', () => {
    it('should return the client', async () => {
      const created = await clientRepo.save({ nome: 'Empresa X' });
      const res = await request(app.getHttpServer()).get(`/clients/${created.id}`).expect(200);
      expect(res.body.nome).toBe('Empresa X');
    });

    it('should return 404 when not found', async () => {
      await request(app.getHttpServer()).get('/clients/999').expect(404);
    });

    it('should return 400 for a non-numeric id', async () => {
      await request(app.getHttpServer()).get('/clients/abc').expect(400);
    });
  });

  describe('PATCH /clients/:id', () => {
    it('should update the client', async () => {
      const created = await clientRepo.save({ nome: 'Empresa Y', cidade: 'SP' });
      const res = await request(app.getHttpServer())
        .patch(`/clients/${created.id}`)
        .send({ cidade: 'RJ', status: 'inativo' })
        .expect(200);

      expect(res.body.cidade).toBe('RJ');
      expect(res.body.status).toBe('inativo');
    });

    it('should return 404 when client does not exist', async () => {
      await request(app.getHttpServer()).patch('/clients/999').send({ cidade: 'RJ' }).expect(404);
    });
  });

  describe('DELETE /clients/:id', () => {
    it('should delete the client', async () => {
      const created = await clientRepo.save({ nome: 'Empresa D' });
      await request(app.getHttpServer()).delete(`/clients/${created.id}`).expect(200);
      await request(app.getHttpServer()).get(`/clients/${created.id}`).expect(404);
    });

    it('should return 404 when deleting a non-existent client', async () => {
      await request(app.getHttpServer()).delete('/clients/999').expect(404);
    });
  });

  describe('GET /clients/:clientId/responsaveis', () => {
    it('should return an empty list when there are no responsaveis', async () => {
      const created = await clientRepo.save({ nome: 'Empresa A' });
      const res = await request(app.getHttpServer())
        .get(`/clients/${created.id}/responsaveis`)
        .expect(200);

      expect(res.body).toEqual([]);
    });

    it('should list responsaveis of a client', async () => {
      const created = await clientRepo.save({ nome: 'Empresa A' });
      await responsavelRepo.save([
        { clientId: created.id, nome: 'João', sobrenome: 'Silva', funcao: 'Diretor' },
        { clientId: created.id, nome: 'Maria', sobrenome: 'Souza' },
      ]);

      const res = await request(app.getHttpServer())
        .get(`/clients/${created.id}/responsaveis`)
        .expect(200);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].nome).toBe('João');
    });

    it('should return 404 when client does not exist', async () => {
      await request(app.getHttpServer()).get('/clients/999/responsaveis').expect(404);
    });
  });

  describe('POST /clients/:clientId/responsaveis', () => {
    it('should create a responsavel for the client', async () => {
      const created = await clientRepo.save({ nome: 'Empresa A' });
      const res = await request(app.getHttpServer())
        .post(`/clients/${created.id}/responsaveis`)
        .send({ nome: 'João', sobrenome: 'Silva', email: 'joao@empresa.com', funcao: 'Diretor' })
        .expect(201);

      expect(res.body).toMatchObject({
        clientId: created.id,
        nome: 'João',
        sobrenome: 'Silva',
        email: 'joao@empresa.com',
        funcao: 'Diretor',
      });
    });

    it('should return 400 when nome or sobrenome is missing', async () => {
      const created = await clientRepo.save({ nome: 'Empresa A' });
      await request(app.getHttpServer())
        .post(`/clients/${created.id}/responsaveis`)
        .send({ nome: 'João' })
        .expect(400);
      await request(app.getHttpServer())
        .post(`/clients/${created.id}/responsaveis`)
        .send({ sobrenome: 'Silva' })
        .expect(400);
    });

    it('should return 404 when client does not exist', async () => {
      await request(app.getHttpServer())
        .post('/clients/999/responsaveis')
        .send({ nome: 'João', sobrenome: 'Silva' })
        .expect(404);
    });
  });

  describe('PATCH /clients/responsaveis/:id', () => {
    it('should update the responsavel', async () => {
      const created = await clientRepo.save({ nome: 'Empresa A' });
      const responsavel = await responsavelRepo.save({
        clientId: created.id,
        nome: 'João',
        sobrenome: 'Silva',
      });

      const res = await request(app.getHttpServer())
        .patch(`/clients/responsaveis/${responsavel.id}`)
        .send({ telefone: '(11) 99999-0000', funcao: 'Gerente' })
        .expect(200);

      expect(res.body.telefone).toBe('(11) 99999-0000');
      expect(res.body.funcao).toBe('Gerente');
    });

    it('should return 404 when responsavel does not exist', async () => {
      await request(app.getHttpServer())
        .patch('/clients/responsaveis/999')
        .send({ telefone: '(11) 99999-0000' })
        .expect(404);
    });
  });

  describe('DELETE /clients/responsaveis/:id', () => {
    it('should delete the responsavel', async () => {
      const created = await clientRepo.save({ nome: 'Empresa A' });
      const responsavel = await responsavelRepo.save({
        clientId: created.id,
        nome: 'João',
        sobrenome: 'Silva',
      });

      await request(app.getHttpServer())
        .delete(`/clients/responsaveis/${responsavel.id}`)
        .expect(200);

      const count = await responsavelRepo.count({ where: { clientId: created.id } });
      expect(count).toBe(0);
    });

    it('should return 404 when deleting a non-existent responsavel', async () => {
      await request(app.getHttpServer()).delete('/clients/responsaveis/999').expect(404);
    });
  });
});
