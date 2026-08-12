import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { Client } from './domain/client.entity';
import { Responsavel } from './domain/responsavel.entity';
import { CLIENT_REPOSITORY } from './domain/client.repository';

describe('ClientsService', () => {
  let service: ClientsService;

  const repo = {
    create: jest.fn(),
    save: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    delete: jest.fn(),
    findResponsaveisByClient: jest.fn(),
    createResponsavel: jest.fn(),
    saveResponsavel: jest.fn(),
    findResponsavelById: jest.fn(),
    deleteResponsavel: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: CLIENT_REPOSITORY, useValue: repo },
      ],
    }).compile();

    service = moduleRef.get(ClientsService);
  });

  describe('create', () => {
    it('should create a client with ativo default', async () => {
      const saved = new Client({ id: 1, nome: 'Empresa A', status: 'ativo' });
      repo.create.mockResolvedValue(saved);

      const result = await service.create({ nome: 'Empresa A' });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ nome: 'Empresa A', status: 'ativo' }),
      );
      expect(result.status).toBe('ativo');
    });
  });

  describe('findAll', () => {
    it('should delegate to the repository', async () => {
      const data = [new Client({ id: 1, nome: 'Empresa A' })];
      repo.findAll.mockResolvedValue({ data, total: 1 });

      const query = { page: 1, limit: 10, search: 'empresa', status: 'ativo' };
      const result = await service.findAll(query);

      expect(repo.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual({ data, total: 1 });
    });
  });

  describe('findById', () => {
    it('should return the client when found', async () => {
      const client = new Client({ id: 1, nome: 'Empresa A' });
      repo.findById.mockResolvedValue(client);

      await expect(service.findById(1)).resolves.toEqual(client);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an existing client', async () => {
      const client = new Client({ id: 1, nome: 'Empresa A', cidade: 'SP' });
      repo.findById.mockResolvedValue(client);
      repo.save.mockImplementation(async (c) => c);

      const result = await service.update(1, { cidade: 'RJ' });

      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ cidade: 'RJ' }));
      expect(result.cidade).toBe('RJ');
      expect(result.nome).toBe('Empresa A');
    });

    it('should throw NotFoundException when client does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.update(99, { nome: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an existing client', async () => {
      repo.delete.mockResolvedValue(true);

      await expect(service.delete(1)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when client does not exist', async () => {
      repo.delete.mockResolvedValue(false);

      await expect(service.delete(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findResponsaveisByClient', () => {
    it('should list responsaveis of a client ordered by nome', async () => {
      repo.findById.mockResolvedValue(new Client({ id: 1, nome: 'Empresa A' }));
      const responsaveis = [
        new Responsavel({ id: 1, clientId: 1, nome: 'João', sobrenome: 'Silva' }),
        new Responsavel({ id: 2, clientId: 1, nome: 'Maria', sobrenome: 'Souza' }),
      ];
      repo.findResponsaveisByClient.mockResolvedValue(responsaveis);

      const result = await service.findResponsaveisByClient(1);

      expect(repo.findResponsaveisByClient).toHaveBeenCalledWith(1);
      expect(result).toEqual(responsaveis);
    });

    it('should throw NotFoundException when client does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findResponsaveisByClient(99)).rejects.toThrow(NotFoundException);
      expect(repo.findResponsaveisByClient).not.toHaveBeenCalled();
    });
  });

  describe('createResponsavel', () => {
    it('should create a responsavel for an existing client', async () => {
      repo.findById.mockResolvedValue(new Client({ id: 1, nome: 'Empresa A' }));
      repo.createResponsavel.mockResolvedValue(
        new Responsavel({ id: 1, clientId: 1, nome: 'João', sobrenome: 'Silva' }),
      );

      const result = await service.createResponsavel(1, {
        nome: 'João',
        sobrenome: 'Silva',
        funcao: 'Diretor',
      });

      expect(repo.createResponsavel).toHaveBeenCalledWith(
        expect.objectContaining({ clientId: 1, nome: 'João', sobrenome: 'Silva', funcao: 'Diretor' }),
      );
      expect(result.clientId).toBe(1);
    });

    it('should throw NotFoundException when client does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.createResponsavel(99, { nome: 'João', sobrenome: 'Silva' }),
      ).rejects.toThrow(NotFoundException);
      expect(repo.createResponsavel).not.toHaveBeenCalled();
    });
  });

  describe('updateResponsavel', () => {
    it('should update an existing responsavel', async () => {
      const responsavel = new Responsavel({ id: 1, clientId: 1, nome: 'João', sobrenome: 'Silva' });
      repo.findResponsavelById.mockResolvedValue(responsavel);
      repo.saveResponsavel.mockImplementation(async (r) => r);

      const result = await service.updateResponsavel(1, { telefone: '(11) 99999-0000' });

      expect(repo.saveResponsavel).toHaveBeenCalledWith(
        expect.objectContaining({ telefone: '(11) 99999-0000' }),
      );
      expect(result.telefone).toBe('(11) 99999-0000');
      expect(result.nome).toBe('João');
    });

    it('should throw NotFoundException when responsavel does not exist', async () => {
      repo.findResponsavelById.mockResolvedValue(null);

      await expect(service.updateResponsavel(99, { nome: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteResponsavel', () => {
    it('should delete an existing responsavel', async () => {
      repo.deleteResponsavel.mockResolvedValue(true);

      await expect(service.deleteResponsavel(1)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when responsavel does not exist', async () => {
      repo.deleteResponsavel.mockResolvedValue(false);

      await expect(service.deleteResponsavel(99)).rejects.toThrow(NotFoundException);
    });
  });
});
