import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Project } from './domain/project.entity';
import { ProjectDocument } from './domain/project-document.entity';
import { PROJECT_REPOSITORY } from './domain/project.repository';

describe('ProjectsService', () => {
  let service: ProjectsService;

  const repo = {
    create: jest.fn(),
    save: jest.fn(),
    findAll: jest.fn(),
    findByCompany: jest.fn(),
    findById: jest.fn(),
    delete: jest.fn(),
    findRelation: jest.fn(),
    findRelatedEntity: jest.fn(),
    findDocuments: jest.fn(),
    createDocument: jest.fn(),
    findDocumentById: jest.fn(),
    saveDocument: jest.fn(),
    deleteDocument: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: PROJECT_REPOSITORY, useValue: repo },
      ],
    }).compile();

    service = moduleRef.get(ProjectsService);
  });

  describe('create', () => {
    it('should create a project and set the default codigo', async () => {
      repo.create.mockResolvedValueOnce(new Project({ id: 1, nome: 'Projeto A' }));
      repo.save.mockResolvedValueOnce(new Project({ id: 1, nome: 'Projeto A', codigo: 'PRJ-0001' }));

      const result = await service.create({ nome: 'Projeto A' });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ nome: 'Projeto A', status: 'ativo' }),
      );
      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ codigo: 'PRJ-0001' }));
      expect(result.codigo).toBe('PRJ-0001');
    });

    it('should keep the codigo when already provided', async () => {
      repo.create.mockResolvedValue(new Project({ id: 1, nome: 'Projeto A', codigo: 'ABC-1' }));

      const result = await service.create({ nome: 'Projeto A', codigo: 'ABC-1' });

      expect(repo.save).not.toHaveBeenCalled();
      expect(result.codigo).toBe('ABC-1');
    });
  });

  describe('findAll', () => {
    it('should delegate without a company filter for master', async () => {
      const data = [new Project({ id: 1, nome: 'Projeto A' })];
      repo.findAll.mockResolvedValue({ data, total: 1 });

      const result = await service.findAll({ page: 1, limit: 10 }, { role: 'master', companyId: null });

      expect(repo.findAll).toHaveBeenCalledWith({ page: 1, limit: 10, companyId: undefined });
      expect(result).toEqual({ data, total: 1 });
    });

    it('should filter by company for non-master users', async () => {
      repo.findAll.mockResolvedValue({ data: [], total: 0 });

      await service.findAll({}, { role: 'user', companyId: 5 });

      expect(repo.findAll).toHaveBeenCalledWith({ companyId: 5 });
    });

    it('should fall back to companyId -1 for a non-master without company', async () => {
      repo.findAll.mockResolvedValue({ data: [], total: 0 });

      await service.findAll({}, { role: 'user', companyId: null });

      expect(repo.findAll).toHaveBeenCalledWith({ companyId: -1 });
    });
  });

  describe('findByCompany', () => {
    it('should delegate to the repository', async () => {
      const data = [new Project({ id: 1, nome: 'Projeto A' })];
      repo.findByCompany.mockResolvedValue({ data, total: 1 });

      const query = { page: 1, limit: 10, search: 'fibra' };
      const result = await service.findByCompany(5, query);

      expect(repo.findByCompany).toHaveBeenCalledWith(5, query);
      expect(result).toEqual({ data, total: 1 });
    });
  });

  describe('findById', () => {
    it('should return the project when found', async () => {
      const project = new Project({ id: 1, nome: 'Projeto A' });
      repo.findById.mockResolvedValue(project);

      await expect(service.findById(1)).resolves.toEqual(project);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an existing project', async () => {
      const project = new Project({ id: 1, nome: 'A', status: 'ativo' });
      repo.findById.mockResolvedValue(project);
      repo.save.mockImplementation(async (p) => p);

      const result = await service.update(1, { status: 'inativo' });

      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ status: 'inativo' }));
      expect(result.status).toBe('inativo');
      expect(result.nome).toBe('A');
    });

    it('should throw NotFoundException when project does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.update(99, { nome: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an existing project', async () => {
      repo.delete.mockResolvedValue(true);

      await expect(service.delete(1)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when project does not exist', async () => {
      repo.delete.mockResolvedValue(false);

      await expect(service.delete(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('documents', () => {
    it('should list documents of a project', async () => {
      repo.findById.mockResolvedValue(new Project({ id: 1 }));
      const docs = [new ProjectDocument({ id: 1, projectId: 1, nome: 'Contrato' })];
      repo.findDocuments.mockResolvedValue(docs);

      const result = await service.findDocuments(1);

      expect(repo.findDocuments).toHaveBeenCalledWith(1);
      expect(result).toHaveLength(1);
    });

    it('should create a document with default quantidade', async () => {
      repo.findById.mockResolvedValue(new Project({ id: 1 }));
      repo.createDocument.mockResolvedValue(new ProjectDocument({ id: 1, projectId: 1, nome: 'ART', quantidade: 1 }));

      const result = await service.createDocument(1, { nome: 'ART' });

      expect(repo.createDocument).toHaveBeenCalledWith(
        expect.objectContaining({ projectId: 1, nome: 'ART', quantidade: 1 }),
      );
      expect(result.quantidade).toBe(1);
    });

    it('should update a document scoped to the project', async () => {
      const doc = new ProjectDocument({ id: 1, projectId: 1, nome: 'ART', quantidade: 1 });
      repo.findDocumentById.mockResolvedValue(doc);
      repo.saveDocument.mockImplementation(async (d) => d);

      const result = await service.updateDocument(1, 1, { quantidade: 5 });

      expect(result.quantidade).toBe(5);
    });

    it('should keep quantidade when not provided in update', async () => {
      const doc = new ProjectDocument({ id: 1, projectId: 1, nome: 'ART', quantidade: 3 });
      repo.findDocumentById.mockResolvedValue(doc);
      repo.saveDocument.mockImplementation(async (d) => d);

      const result = await service.updateDocument(1, 1, { observacoes: 'atualizado' });

      expect(result.quantidade).toBe(3);
      expect(result.observacoes).toBe('atualizado');
    });

    it('should throw NotFoundException when document is not found', async () => {
      repo.findDocumentById.mockResolvedValue(null);

      await expect(service.updateDocument(1, 99, { nome: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('should delete a document', async () => {
      repo.deleteDocument.mockResolvedValue(true);

      await expect(service.deleteDocument(1, 1)).resolves.toBeUndefined();
      expect(repo.deleteDocument).toHaveBeenCalledWith(1, 1);
    });

    it('should throw NotFoundException when deleting a non-existent document', async () => {
      repo.deleteDocument.mockResolvedValue(false);

      await expect(service.deleteDocument(1, 99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('stations', () => {
    it('should add a station to the project', async () => {
      repo.findById.mockResolvedValue(new Project({ id: 1 }));
      repo.findRelatedEntity.mockResolvedValue({ id: 10, siteId: 'SITE-A' });
      repo.findRelation.mockResolvedValue([]);
      repo.save.mockImplementation(async (p) => p);

      const result = await service.addStation(1, 10);

      expect(repo.findRelatedEntity).toHaveBeenCalledWith('station', 10);
      expect(repo.findRelation).toHaveBeenCalledWith(1, 'stations');
      expect(result.stations).toHaveLength(1);
      expect(result.stations?.[0].id).toBe(10);
    });

    it('should throw NotFoundException when project does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findStations(99)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when station does not exist', async () => {
      repo.findById.mockResolvedValue(new Project({ id: 1 }));
      repo.findRelatedEntity.mockResolvedValue(null);

      await expect(service.addStation(1, 99)).rejects.toThrow(NotFoundException);
    });

    it('should remove a station from the project', async () => {
      repo.findById.mockResolvedValue(new Project({ id: 1 }));
      repo.findRelation.mockResolvedValue([{ id: 10 }, { id: 11 }]);
      repo.save.mockImplementation(async (p) => p);

      const result = await service.removeStation(1, 10);

      expect(result.stations?.map((s) => s.id)).toEqual([11]);
    });
  });

  describe('radio links', () => {
    it('should add a radio link to the project', async () => {
      repo.findById.mockResolvedValue(new Project({ id: 1 }));
      repo.findRelatedEntity.mockResolvedValue({ id: 20, nome: 'ENLACE-1' });
      repo.findRelation.mockResolvedValue([]);
      repo.save.mockImplementation(async (p) => p);

      const result = await service.addRadioLink(1, 20);

      expect(repo.findRelatedEntity).toHaveBeenCalledWith('radioLink', 20);
      expect(result.radioLinks).toHaveLength(1);
      expect(result.radioLinks?.[0].id).toBe(20);
    });

    it('should throw NotFoundException when radio link does not exist', async () => {
      repo.findById.mockResolvedValue(new Project({ id: 1 }));
      repo.findRelatedEntity.mockResolvedValue(null);

      await expect(service.addRadioLink(1, 99)).rejects.toThrow(NotFoundException);
    });

    it('should remove a radio link from the project', async () => {
      repo.findById.mockResolvedValue(new Project({ id: 1 }));
      repo.findRelation.mockResolvedValue([{ id: 20 }, { id: 21 }]);
      repo.save.mockImplementation(async (p) => p);

      const result = await service.removeRadioLink(1, 20);

      expect(result.radioLinks?.map((r) => r.id)).toEqual([21]);
    });
  });

  describe('companies', () => {
    it('should list companies of a project', async () => {
      repo.findById.mockResolvedValue(new Project({ id: 1 }));
      repo.findRelation.mockResolvedValue([{ id: 5, nome: 'EA' }]);

      const result = await service.findCompanies(1);

      expect(repo.findRelation).toHaveBeenCalledWith(1, 'companies');
      expect(result).toHaveLength(1);
    });

    it('should add a company to the project', async () => {
      repo.findById.mockResolvedValue(new Project({ id: 1 }));
      repo.findRelatedEntity.mockResolvedValue({ id: 5, nome: 'EA' });
      repo.findRelation.mockResolvedValue([]);
      repo.save.mockImplementation(async (p) => p);

      const result = await service.addCompany(1, 5);

      expect(repo.findRelatedEntity).toHaveBeenCalledWith('company', 5);
      expect(result.companies).toHaveLength(1);
    });

    it('should throw NotFoundException when company does not exist', async () => {
      repo.findById.mockResolvedValue(new Project({ id: 1 }));
      repo.findRelatedEntity.mockResolvedValue(null);

      await expect(service.addCompany(1, 99)).rejects.toThrow(NotFoundException);
    });

    it('should remove a company from the project', async () => {
      repo.findById.mockResolvedValue(new Project({ id: 1 }));
      repo.findRelation.mockResolvedValue([{ id: 5 }, { id: 6 }]);
      repo.save.mockImplementation(async (p) => p);

      const result = await service.removeCompany(1, 5);

      expect(result.companies?.map((c) => c.id)).toEqual([6]);
    });
  });
});
