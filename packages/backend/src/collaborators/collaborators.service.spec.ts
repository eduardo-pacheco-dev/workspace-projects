import { Test } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CollaboratorsService } from './collaborators.service';
import { Collaborator } from './domain/collaborator.entity';
import { COLLABORATOR_REPOSITORY } from './domain/collaborator.repository';

describe('CollaboratorsService', () => {
  let service: CollaboratorsService;

  const repo = {
    companyExists: jest.fn(),
    save: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        CollaboratorsService,
        { provide: COLLABORATOR_REPOSITORY, useValue: repo },
      ],
    }).compile();

    service = moduleRef.get(CollaboratorsService);
  });

  describe('create', () => {
    it('should create a collaborator with ativo default and generated codigo', async () => {
      repo.companyExists.mockResolvedValue(true);
      repo.save
        .mockResolvedValueOnce(
          new Collaborator({ id: 1, nome: 'João Silva', codigo: null, status: 'ativo', companyId: 1 }),
        )
        .mockResolvedValueOnce(
          new Collaborator({ id: 1, nome: 'João Silva', codigo: 'COL-0001', status: 'ativo', companyId: 1 }),
        );

      const result = await service.create({ nome: 'João Silva', companyId: 1 });

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ nome: 'João Silva', status: 'ativo', companyId: 1 }),
      );
      expect(repo.save).toHaveBeenCalledTimes(2);
      expect(result.codigo).toBe('COL-0001');
    });

    it('should not regenerate codigo when already present', async () => {
      repo.companyExists.mockResolvedValue(true);
      repo.save.mockResolvedValue(
        new Collaborator({ id: 1, nome: 'João', codigo: 'COL-0001', companyId: 1 }),
      );

      const result = await service.create({ nome: 'João', companyId: 1 });

      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(result.codigo).toBe('COL-0001');
    });

    it('should keep the provided status instead of the default', async () => {
      repo.companyExists.mockResolvedValue(true);
      repo.save
        .mockResolvedValueOnce(
          new Collaborator({ id: 1, nome: 'João', codigo: null, status: 'inativo', companyId: 1 }),
        )
        .mockResolvedValueOnce(
          new Collaborator({ id: 1, nome: 'João', codigo: 'COL-0001', status: 'inativo', companyId: 1 }),
        );

      const result = await service.create({ nome: 'João', status: 'inativo', companyId: 1 });

      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ status: 'inativo' }));
      expect(result.status).toBe('inativo');
    });

    it('should throw when company does not exist', async () => {
      repo.companyExists.mockResolvedValue(false);
      await expect(service.create({ nome: 'João', companyId: 99 })).rejects.toThrow(BadRequestException);
    });

    it('should reject non-master creating for another company', async () => {
      await expect(
        service.create({ nome: 'João', companyId: 2 }, { role: 'user', companyId: 1 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should force company for non-master', async () => {
      repo.companyExists.mockResolvedValue(true);
      repo.save.mockResolvedValue(
        new Collaborator({ id: 1, nome: 'João', codigo: 'COL-0001', companyId: 1 }),
      );

      const result = await service.create({ nome: 'João', companyId: 1 }, { role: 'user', companyId: 1 });

      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ companyId: 1 }));
      expect(result.companyId).toBe(1);
    });

    it('should create a freelancer with isFreelancer true and FR codigo', async () => {
      repo.companyExists.mockResolvedValue(true);
      repo.save
        .mockResolvedValueOnce(
          new Collaborator({ id: 1, nome: 'Carlos Silva', codigo: null, isFreelancer: true, companyId: 1 }),
        )
        .mockResolvedValueOnce(
          new Collaborator({ id: 1, nome: 'Carlos Silva', codigo: 'FR-0001', isFreelancer: true, companyId: 1 }),
        );

      const result = await service.create({
        nome: 'Carlos Silva',
        companyId: 1,
        isFreelancer: true,
        hourlyRate: 150,
        experienceLevel: 'senior',
        availability: 'available',
      });

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ isFreelancer: true, hourlyRate: 150 }),
      );
      expect(result.codigo).toBe('FR-0001');
    });

    it('should derive nome from firstName and lastName when creating a freelancer', async () => {
      repo.companyExists.mockResolvedValue(true);
      repo.save
        .mockResolvedValueOnce(
          new Collaborator({ id: 1, nome: 'Carlos Silva', codigo: null, isFreelancer: true, companyId: 1 }),
        )
        .mockResolvedValueOnce(
          new Collaborator({ id: 1, nome: 'Carlos Silva', codigo: 'FR-0001', isFreelancer: true, companyId: 1 }),
        );

      const result = await service.create({
        firstName: 'Carlos',
        lastName: 'Silva',
        companyId: 1,
        isFreelancer: true,
      });

      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ nome: 'Carlos Silva' }));
      expect(result.codigo).toBe('FR-0001');
    });

    it('should apply freelancer defaults for skills, portfolio, experienceLevel and availability', async () => {
      repo.companyExists.mockResolvedValue(true);
      repo.save
        .mockResolvedValueOnce(
          new Collaborator({ id: 1, nome: 'Carlos Silva', codigo: null, isFreelancer: true, companyId: 1 }),
        )
        .mockResolvedValueOnce(
          new Collaborator({ id: 1, nome: 'Carlos Silva', codigo: 'FR-0001', isFreelancer: true, companyId: 1 }),
        );

      await service.create({
        firstName: 'Carlos',
        lastName: 'Silva',
        companyId: 1,
        isFreelancer: true,
      });

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          skills: '[]',
          portfolio: '[]',
          experienceLevel: 'junior',
          availability: 'available',
        }),
      );
    });

    it('should not apply freelancer defaults for a collaborator', async () => {
      repo.companyExists.mockResolvedValue(true);
      repo.save
        .mockResolvedValueOnce(
          new Collaborator({ id: 1, nome: 'João', codigo: null, isFreelancer: false, companyId: 1 }),
        )
        .mockResolvedValueOnce(
          new Collaborator({ id: 1, nome: 'João', codigo: 'COL-0001', isFreelancer: false, companyId: 1 }),
        );

      await service.create({ nome: 'João', companyId: 1 });

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          skills: undefined,
          portfolio: undefined,
          experienceLevel: undefined,
          availability: undefined,
        }),
      );
    });
  });

  describe('findAllPaged', () => {
    it('should delegate to the repository without a company filter for master', async () => {
      const data = [new Collaborator({ id: 1, nome: 'João' })];
      repo.findAll.mockResolvedValue({ data, total: 1 });

      const result = await service.findAllPaged({ page: 1, limit: 10 }, { role: 'master', companyId: null });

      expect(repo.findAll).toHaveBeenCalledWith({ page: 1, limit: 10, companyId: undefined });
      expect(result).toEqual({ data, total: 1 });
    });

    it('should filter by company for non-master', async () => {
      repo.findAll.mockResolvedValue({ data: [], total: 0 });

      await service.findAllPaged({}, { role: 'user', companyId: 1 });

      expect(repo.findAll).toHaveBeenCalledWith({ companyId: 1 });
    });

    it('should use -1 as the company filter when there is no current user', async () => {
      repo.findAll.mockResolvedValue({ data: [], total: 0 });

      await service.findAllPaged({});

      expect(repo.findAll).toHaveBeenCalledWith({ companyId: -1 });
    });

    it('should pass the query filters through', async () => {
      repo.findAll.mockResolvedValue({ data: [], total: 0 });

      await service.findAllPaged({ search: 'joao', isFreelancer: true, sortBy: 'nome', sortOrder: 'ASC' }, {
        role: 'master',
        companyId: null,
      });

      expect(repo.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'joao', isFreelancer: true, sortBy: 'nome', sortOrder: 'ASC' }),
      );
    });
  });

  describe('getByIdOrFail', () => {
    it('should return the collaborator when found', async () => {
      const collaborator = new Collaborator({ id: 1, nome: 'João', companyId: 1 });
      repo.findById.mockResolvedValue(collaborator);

      await expect(service.getByIdOrFail(1)).resolves.toEqual(collaborator);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.getByIdOrFail(99)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for collaborator from another company (non-master)', async () => {
      repo.findById.mockResolvedValue(new Collaborator({ id: 1, nome: 'João', companyId: 2 }));
      await expect(service.getByIdOrFail(1, { role: 'user', companyId: 1 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFreelancerOrFail', () => {
    it('should return the freelancer when found', async () => {
      const freelancer = new Collaborator({ id: 1, nome: 'Carlos', isFreelancer: true, companyId: 1 });
      repo.findById.mockResolvedValue(freelancer);

      await expect(service.getFreelancerOrFail(1)).resolves.toEqual(freelancer);
    });

    it('should throw NotFoundException for a non-freelancer collaborator', async () => {
      repo.findById.mockResolvedValue(new Collaborator({ id: 1, nome: 'João', isFreelancer: false, companyId: 1 }));

      await expect(service.getFreelancerOrFail(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when freelancer does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.getFreelancerOrFail(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update existing collaborator', async () => {
      const collaborator = new Collaborator({ id: 1, nome: 'Antigo', cargo: null, companyId: 1 });
      repo.findById.mockResolvedValue(collaborator);
      repo.save.mockImplementation(async (c) => c);

      const result = await service.update(1, { cargo: 'Diretor' });

      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ cargo: 'Diretor' }));
      expect(result.cargo).toBe('Diretor');
    });

    it('should throw NotFoundException for missing collaborator', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update(99, { nome: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('should validate company on update', async () => {
      repo.findById.mockResolvedValue(new Collaborator({ id: 1, nome: 'João', companyId: 1 }));
      repo.companyExists.mockResolvedValue(true);
      repo.save.mockImplementation(async (c) => c);

      await service.update(1, { companyId: 2 });

      expect(repo.companyExists).toHaveBeenCalledWith(2);
    });

    it('should reject non-master moving a collaborator to another company', async () => {
      repo.findById.mockResolvedValue(new Collaborator({ id: 1, nome: 'João', companyId: 1 }));
      repo.companyExists.mockResolvedValue(true);

      await expect(
        service.update(1, { companyId: 2 }, { role: 'user', companyId: 1 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should derive nome when updating firstName/lastName', async () => {
      const collaborator = new Collaborator({
        id: 1,
        nome: 'Antigo Nome',
        firstName: 'Antigo',
        lastName: 'Nome',
        companyId: 1,
      });
      repo.findById.mockResolvedValue(collaborator);
      repo.save.mockImplementation(async (c) => c);

      const result = await service.update(1, { firstName: 'Novo' });

      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ nome: 'Novo Nome' }));
      expect(result.nome).toBe('Novo Nome');
    });

    it('should keep existing nome when firstName/lastName unchanged', async () => {
      const collaborator = new Collaborator({ id: 1, nome: 'João', companyId: 1 });
      repo.findById.mockResolvedValue(collaborator);
      repo.save.mockImplementation(async (c) => c);

      const result = await service.update(1, { cargo: 'Diretor' });

      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ nome: 'João' }));
      expect(result.nome).toBe('João');
    });
  });

  describe('delete', () => {
    it('should delete an existing collaborator', async () => {
      repo.findById.mockResolvedValue(new Collaborator({ id: 1, nome: 'João', companyId: 1 }));
      repo.delete.mockResolvedValue(true);
      await expect(service.delete(1)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when collaborator does not exist', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.delete(99)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for collaborator from another company (non-master)', async () => {
      repo.findById.mockResolvedValue(new Collaborator({ id: 1, nome: 'João', companyId: 2 }));
      await expect(service.delete(1, { role: 'user', companyId: 1 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateDocument', () => {
    it('should update the photo url', async () => {
      const collaborator = new Collaborator({ id: 1, nome: 'João', companyId: 1 });
      repo.findById.mockResolvedValue(collaborator);
      repo.save.mockImplementation(async (c) => c);

      const result = await service.updatePhoto(1, '/uploads/freelancer-1/photo-123.jpg');

      expect(result.foto).toBe('/uploads/freelancer-1/photo-123.jpg');
    });

    it('should store the nr10 document url', async () => {
      const collaborator = new Collaborator({ id: 1, nome: 'João', companyId: 1 });
      repo.findById.mockResolvedValue(collaborator);
      repo.save.mockImplementation(async (c) => c);

      const result = await service.updateDocument(1, 'nr10', '/uploads/freelancer-1/nr10-123.pdf');

      expect(result.nr10Arquivo).toBe('/uploads/freelancer-1/nr10-123.pdf');
    });

    it('should store the nr35 document url', async () => {
      const collaborator = new Collaborator({ id: 1, nome: 'João', companyId: 1 });
      repo.findById.mockResolvedValue(collaborator);
      repo.save.mockImplementation(async (c) => c);

      const result = await service.updateDocument(1, 'nr35', '/uploads/freelancer-1/nr35-123.pdf');

      expect(result.nr35Arquivo).toBe('/uploads/freelancer-1/nr35-123.pdf');
    });

    it('should keep rg, carteira and habilitacao unchanged', async () => {
      const collaborator = new Collaborator({ id: 1, nome: 'João', companyId: 1 });
      repo.findById.mockResolvedValue(collaborator);
      repo.save.mockImplementation(async (c) => c);

      const result = await service.updateDocument(1, 'rg', '/uploads/rg.pdf');
      const carteira = await service.updateDocument(1, 'carteira', '/uploads/carteira.pdf');
      const habilitacao = await service.updateDocument(1, 'habilitacao', '/uploads/habilitacao.pdf');

      expect(result.rgArquivo).toBe('/uploads/rg.pdf');
      expect(carteira.carteiraArquivo).toBe('/uploads/carteira.pdf');
      expect(habilitacao.habilitacaoArquivo).toBe('/uploads/habilitacao.pdf');
    });

    it('should store the aso, epi, ordemServico and contrato urls', async () => {
      const collaborator = new Collaborator({ id: 1, nome: 'João', companyId: 1 });
      repo.findById.mockResolvedValue(collaborator);
      repo.save.mockImplementation(async (c) => c);

      const aso = await service.updateDocument(1, 'aso', '/uploads/aso.pdf');
      const epi = await service.updateDocument(1, 'epi', '/uploads/epi.pdf');
      const os = await service.updateDocument(1, 'ordemServico', '/uploads/os.pdf');
      const contrato = await service.updateDocument(1, 'contrato', '/uploads/contrato.pdf');

      expect(aso.asoArquivo).toBe('/uploads/aso.pdf');
      expect(epi.epiArquivo).toBe('/uploads/epi.pdf');
      expect(os.ordemServicoArquivo).toBe('/uploads/os.pdf');
      expect(contrato.contratoArquivo).toBe('/uploads/contrato.pdf');
    });

    it('should throw for an invalid document type', async () => {
      repo.findById.mockResolvedValue(new Collaborator({ id: 1, nome: 'João', companyId: 1 }));

      await expect(service.updateDocument(1, 'invalid', '/x')).rejects.toThrow(NotFoundException);
    });
  });
});
