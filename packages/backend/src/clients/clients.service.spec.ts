import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { Client } from './client.entity';
import { Responsavel } from './responsavel.entity';

describe('ClientsService', () => {
  let service: ClientsService;

  const clientsRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const responsaveisRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const buildQueryBuilder = (data: Client[], total: number) => {
    const qb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([data, total]),
    };
    return qb;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: getRepositoryToken(Client), useValue: clientsRepo },
        { provide: getRepositoryToken(Responsavel), useValue: responsaveisRepo },
      ],
    }).compile();

    service = moduleRef.get(ClientsService);
  });

  describe('create', () => {
    it('should create a client', async () => {
      const saved = { id: 1, nome: 'Empresa A', status: 'ativo' };
      clientsRepo.create.mockReturnValue(saved);
      clientsRepo.save.mockResolvedValue(saved);

      const result = await service.create({ nome: 'Empresa A' });

      expect(clientsRepo.create).toHaveBeenCalledWith({ nome: 'Empresa A' });
      expect(result.status).toBe('ativo');
    });
  });

  describe('findAll', () => {
    it('should list clients with default sort', async () => {
      const data = [{ id: 1, nome: 'Empresa A' }];
      const qb = buildQueryBuilder(data as Client[], 1);
      clientsRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(clientsRepo.createQueryBuilder).toHaveBeenCalledWith('c');
      expect(qb.orderBy).toHaveBeenCalledWith('c.id', 'ASC');
      expect(result).toEqual({ data, total: 1 });
    });

    it('should apply search and status filters', async () => {
      const qb = buildQueryBuilder([], 0);
      clientsRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ search: 'Empresa', status: 'ativo' });

      expect(qb.where).toHaveBeenCalledWith(
        expect.stringContaining('c.nome LIKE :search'),
        { search: '%Empresa%' },
      );
      expect(qb.andWhere).toHaveBeenCalledWith('c.status = :status', { status: 'ativo' });
    });

    it('should ignore unsupported sort columns', async () => {
      const qb = buildQueryBuilder([], 0);
      clientsRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ sortBy: 'DROP TABLE', sortOrder: 'DESC' });

      expect(qb.orderBy).toHaveBeenCalledWith('c.id', 'DESC');
    });
  });

  describe('findById', () => {
    it('should return the client when found', async () => {
      const client = { id: 1, nome: 'Empresa A' };
      clientsRepo.findOne.mockResolvedValue(client);

      await expect(service.findById(1)).resolves.toEqual(client);
      expect(clientsRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when not found', async () => {
      clientsRepo.findOne.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an existing client', async () => {
      const client = { id: 1, nome: 'Empresa A', cidade: 'SP' };
      clientsRepo.findOne.mockResolvedValue(client);
      clientsRepo.save.mockImplementation(async (c) => c);

      const result = await service.update(1, { cidade: 'RJ' });

      expect(result.cidade).toBe('RJ');
      expect(result.nome).toBe('Empresa A');
    });

    it('should throw NotFoundException when client does not exist', async () => {
      clientsRepo.findOne.mockResolvedValue(null);

      await expect(service.update(99, { nome: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an existing client', async () => {
      clientsRepo.delete.mockResolvedValue({ affected: 1 });

      await expect(service.delete(1)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when client does not exist', async () => {
      clientsRepo.delete.mockResolvedValue({ affected: 0 });

      await expect(service.delete(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findResponsaveisByClient', () => {
    it('should list responsaveis of a client ordered by nome', async () => {
      clientsRepo.findOne.mockResolvedValue({ id: 1, nome: 'Empresa A' });
      const responsaveis = [
        { id: 1, clientId: 1, nome: 'João' },
        { id: 2, clientId: 1, nome: 'Maria' },
      ];
      responsaveisRepo.find.mockResolvedValue(responsaveis);

      const result = await service.findResponsaveisByClient(1);

      expect(responsaveisRepo.find).toHaveBeenCalledWith({
        where: { clientId: 1 },
        order: { nome: 'ASC' },
      });
      expect(result).toEqual(responsaveis);
    });

    it('should throw NotFoundException when client does not exist', async () => {
      clientsRepo.findOne.mockResolvedValue(null);

      await expect(service.findResponsaveisByClient(99)).rejects.toThrow(NotFoundException);
      expect(responsaveisRepo.find).not.toHaveBeenCalled();
    });
  });

  describe('createResponsavel', () => {
    it('should create a responsavel for an existing client', async () => {
      clientsRepo.findOne.mockResolvedValue({ id: 1, nome: 'Empresa A' });
      const saved = { id: 1, clientId: 1, nome: 'João', sobrenome: 'Silva' };
      responsaveisRepo.create.mockReturnValue(saved);
      responsaveisRepo.save.mockResolvedValue(saved);

      const result = await service.createResponsavel(1, {
        nome: 'João',
        sobrenome: 'Silva',
        funcao: 'Diretor',
      });

      expect(responsaveisRepo.create).toHaveBeenCalledWith({
        clientId: 1,
        nome: 'João',
        sobrenome: 'Silva',
        funcao: 'Diretor',
      });
      expect(result.clientId).toBe(1);
    });

    it('should throw NotFoundException when client does not exist', async () => {
      clientsRepo.findOne.mockResolvedValue(null);

      await expect(
        service.createResponsavel(99, { nome: 'João', sobrenome: 'Silva' }),
      ).rejects.toThrow(NotFoundException);
      expect(responsaveisRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('updateResponsavel', () => {
    it('should update an existing responsavel', async () => {
      const responsavel = { id: 1, clientId: 1, nome: 'João', sobrenome: 'Silva', telefone: null };
      responsaveisRepo.findOne.mockResolvedValue(responsavel);
      responsaveisRepo.save.mockImplementation(async (r) => r);

      const result = await service.updateResponsavel(1, { telefone: '(11) 99999-0000' });

      expect(result.telefone).toBe('(11) 99999-0000');
      expect(responsavel.nome).toBe('João');
    });

    it('should throw NotFoundException when responsavel does not exist', async () => {
      responsaveisRepo.findOne.mockResolvedValue(null);

      await expect(service.updateResponsavel(99, { nome: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteResponsavel', () => {
    it('should delete an existing responsavel', async () => {
      responsaveisRepo.delete.mockResolvedValue({ affected: 1 });

      await expect(service.deleteResponsavel(1)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when responsavel does not exist', async () => {
      responsaveisRepo.delete.mockResolvedValue({ affected: 0 });

      await expect(service.deleteResponsavel(99)).rejects.toThrow(NotFoundException);
    });
  });
});
