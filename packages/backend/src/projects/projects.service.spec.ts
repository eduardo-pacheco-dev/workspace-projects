import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Project } from './project.entity';
import { ProjectDocument } from './project-document.entity';
import { StationEntity } from '../stations/infrastructure/station.entity';
import { RadioLink } from '../radio-links/radio-link.entity';
import { Company } from '../companies/company.entity';

describe('ProjectsService', () => {
  let service: ProjectsService;

  const projectsRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const stationsRepo = { findOne: jest.fn() };
  const radioLinksRepo = { findOne: jest.fn() };
  const documentsRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };
  const companiesRepo = { findOne: jest.fn() };

  const buildQueryBuilder = (data: Project[], total: number) => {
    const qb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
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
        ProjectsService,
        { provide: getRepositoryToken(Project), useValue: projectsRepo },
        { provide: getRepositoryToken(StationEntity), useValue: stationsRepo },
        { provide: getRepositoryToken(RadioLink), useValue: radioLinksRepo },
        { provide: getRepositoryToken(ProjectDocument), useValue: documentsRepo },
        { provide: getRepositoryToken(Company), useValue: companiesRepo },
      ],
    }).compile();

    service = moduleRef.get(ProjectsService);
  });

  describe('create', () => {
    it('should create a project and set the default codigo', async () => {
      const project = { id: 1, nome: 'Projeto A' };
      projectsRepo.create.mockReturnValue(project);
      projectsRepo.save
        .mockResolvedValueOnce(project)
        .mockResolvedValueOnce({ ...project, codigo: 'PRJ-0001' });

      const result = await service.create({ nome: 'Projeto A' });

      expect(projectsRepo.create).toHaveBeenCalledWith({ nome: 'Projeto A' });
      expect(projectsRepo.save).toHaveBeenCalledTimes(2);
      expect(result.codigo).toBe('PRJ-0001');
    });

    it('should keep the codigo when already provided', async () => {
      const project = { id: 1, nome: 'Projeto A', codigo: 'ABC-1' };
      projectsRepo.create.mockReturnValue(project);
      projectsRepo.save.mockResolvedValue(project);

      const result = await service.create({ nome: 'Projeto A', codigo: 'ABC-1' });

      expect(projectsRepo.save).toHaveBeenCalledTimes(1);
      expect(result.codigo).toBe('ABC-1');
    });
  });

  describe('findAll', () => {
    it('should list projects with default sort', async () => {
      const data = [{ id: 1, nome: 'Projeto A' }];
      const qb = buildQueryBuilder(data as Project[], 1);
      projectsRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(projectsRepo.createQueryBuilder).toHaveBeenCalledWith('p');
      expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('p.companies', 'companies');
      expect(qb.orderBy).toHaveBeenCalledWith('p.id', 'ASC');
      expect(result).toEqual({ data, total: 1 });
    });

    it('should apply search, status and cliente filters', async () => {
      const qb = buildQueryBuilder([], 0);
      projectsRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ search: 'fibra', status: 'ativo', cliente: 'Vivo' });

      expect(qb.andWhere).toHaveBeenCalledWith(expect.stringContaining('p.nome LIKE :search'), {
        search: '%fibra%',
      });
      expect(qb.andWhere).toHaveBeenCalledWith('p.status = :status', { status: 'ativo' });
      expect(qb.andWhere).toHaveBeenCalledWith('p.cliente = :cliente', { cliente: 'Vivo' });
    });

    it('should restrict non-master users to their own company', async () => {
      const qb = buildQueryBuilder([], 0);
      projectsRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({}, { role: 'user', companyId: 5 });

      expect(qb.innerJoin).toHaveBeenCalledWith('p.companies', 'userCompany');
      expect(qb.andWhere).toHaveBeenCalledWith('userCompany.id = :companyId', { companyId: 5 });
    });

    it('should fall back to companyId -1 for a non-master without company', async () => {
      const qb = buildQueryBuilder([], 0);
      projectsRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({}, { role: 'user', companyId: null });

      expect(qb.andWhere).toHaveBeenCalledWith('userCompany.id = :companyId', { companyId: -1 });
    });

    it('should fall back to companyId -1 when the user has no company key', async () => {
      const qb = buildQueryBuilder([], 0);
      projectsRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({}, { role: 'user' } as any);

      expect(qb.andWhere).toHaveBeenCalledWith('userCompany.id = :companyId', { companyId: -1 });
    });

    it('should ignore unsupported sort columns and support DESC order', async () => {
      const qb = buildQueryBuilder([], 0);
      projectsRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ sortBy: 'DROP TABLE', sortOrder: 'DESC' });

      expect(qb.orderBy).toHaveBeenCalledWith('p.id', 'DESC');
    });
  });

  describe('findByCompany', () => {
    it('should list projects of a company with default sort', async () => {
      const data = [{ id: 1, nome: 'Projeto A' }];
      const qb = buildQueryBuilder(data as Project[], 1);
      projectsRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findByCompany(5, { page: 1, limit: 10 });

      expect(projectsRepo.createQueryBuilder).toHaveBeenCalledWith('p');
      expect(qb.innerJoin).toHaveBeenCalledWith('p.companies', 'c');
      expect(qb.where).toHaveBeenCalledWith('c.id = :companyId', { companyId: 5 });
      expect(qb.orderBy).toHaveBeenCalledWith('p.id', 'ASC');
      expect(result).toEqual({ data, total: 1 });
    });

    it('should apply search and status filters', async () => {
      const qb = buildQueryBuilder([], 0);
      projectsRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findByCompany(5, { search: 'fibra', status: 'ativo' });

      expect(qb.andWhere).toHaveBeenCalledWith(expect.stringContaining('p.nome LIKE :search'), {
        search: '%fibra%',
      });
      expect(qb.andWhere).toHaveBeenCalledWith('p.status = :status', { status: 'ativo' });
    });

    it('should ignore unsupported sort columns and support DESC order', async () => {
      const qb = buildQueryBuilder([], 0);
      projectsRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findByCompany(5, { sortBy: 'X', sortOrder: 'DESC' });

      expect(qb.orderBy).toHaveBeenCalledWith('p.id', 'DESC');
    });
  });

  describe('findById', () => {
    it('should return the project when found', async () => {
      const project = { id: 1, nome: 'Projeto A' };
      projectsRepo.findOne.mockResolvedValue(project);

      await expect(service.findById(1)).resolves.toEqual(project);
      expect(projectsRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when not found', async () => {
      projectsRepo.findOne.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an existing project', async () => {
      const project = { id: 1, nome: 'A', status: 'ativo' };
      projectsRepo.findOne.mockResolvedValue(project);
      projectsRepo.save.mockImplementation(async (p) => p);

      const result = await service.update(1, { status: 'inativo' });

      expect(result.status).toBe('inativo');
      expect(result.nome).toBe('A');
    });

    it('should throw NotFoundException when project does not exist', async () => {
      projectsRepo.findOne.mockResolvedValue(null);

      await expect(service.update(99, { nome: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an existing project', async () => {
      projectsRepo.delete.mockResolvedValue({ affected: 1 });

      await expect(service.delete(1)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when project does not exist', async () => {
      projectsRepo.delete.mockResolvedValue({ affected: 0 });

      await expect(service.delete(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('documents', () => {
    it('should list documents of a project', async () => {
      projectsRepo.findOne.mockResolvedValue({ id: 1 });
      documentsRepo.find.mockResolvedValue([{ id: 1, nome: 'Contrato' }]);

      const result = await service.findDocuments(1);

      expect(documentsRepo.find).toHaveBeenCalledWith({
        where: { projectId: 1 },
        order: { createdAt: 'ASC' },
      });
      expect(result).toHaveLength(1);
    });

    it('should create a document with default quantidade', async () => {
      projectsRepo.findOne.mockResolvedValue({ id: 1 });
      const doc = { id: 1, projectId: 1, nome: 'ART', quantidade: 1 };
      documentsRepo.create.mockReturnValue(doc);
      documentsRepo.save.mockResolvedValue(doc);

      const result = await service.createDocument(1, { nome: 'ART' });

      expect(documentsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ projectId: 1, nome: 'ART', quantidade: 1 }),
      );
      expect(result.quantidade).toBe(1);
    });

    it('should update a document scoped to the project', async () => {
      const doc = { id: 1, projectId: 1, nome: 'ART', quantidade: 1 };
      documentsRepo.findOne.mockResolvedValue(doc);
      documentsRepo.save.mockImplementation(async (d) => d);

      const result = await service.updateDocument(1, 1, { quantidade: 5 });

      expect(result.quantidade).toBe(5);
    });

    it('should keep quantidade when not provided in update', async () => {
      const doc = { id: 1, projectId: 1, nome: 'ART', quantidade: 3 };
      documentsRepo.findOne.mockResolvedValue(doc);
      documentsRepo.save.mockImplementation(async (d) => d);

      const result = await service.updateDocument(1, 1, { observacoes: 'atualizado' });

      expect(result.quantidade).toBe(3);
      expect(result.observacoes).toBe('atualizado');
    });

    it('should throw NotFoundException when document is not found', async () => {
      documentsRepo.findOne.mockResolvedValue(null);

      await expect(service.updateDocument(1, 99, { nome: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('should delete a document', async () => {
      documentsRepo.findOne.mockResolvedValue({ id: 1, projectId: 1 });

      await expect(service.deleteDocument(1, 1)).resolves.toBeUndefined();
      expect(documentsRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when deleting a non-existent document', async () => {
      documentsRepo.findOne.mockResolvedValue(null);

      await expect(service.deleteDocument(1, 99)).rejects.toThrow(NotFoundException);
      expect(documentsRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe('stations', () => {
    it('should add a station to the project', async () => {
      projectsRepo.findOne.mockResolvedValue({ id: 1, stations: [] });
      stationsRepo.findOne.mockResolvedValue({ id: 10, siteId: 'SITE-A' });
      projectsRepo.save.mockImplementation(async (p) => p);

      const result = await service.addStation(1, 10);

      expect(result.stations).toHaveLength(1);
      expect(result.stations[0].id).toBe(10);
    });

    it('should throw NotFoundException when project does not exist', async () => {
      projectsRepo.findOne.mockResolvedValue(null);

      await expect(service.findStations(99)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when station does not exist', async () => {
      projectsRepo.findOne.mockResolvedValue({ id: 1 });
      stationsRepo.findOne.mockResolvedValue(null);

      await expect(service.addStation(1, 99)).rejects.toThrow(NotFoundException);
    });

    it('should remove a station from the project', async () => {
      projectsRepo.findOne.mockResolvedValue({ id: 1, stations: [{ id: 10 }, { id: 11 }] });
      projectsRepo.save.mockImplementation(async (p) => p);

      const result = await service.removeStation(1, 10);

      expect(result.stations.map((s: any) => s.id)).toEqual([11]);
    });
  });

  describe('radio links', () => {
    it('should add a radio link to the project', async () => {
      projectsRepo.findOne.mockResolvedValue({ id: 1, radioLinks: [] });
      radioLinksRepo.findOne.mockResolvedValue({ id: 20, nome: 'ENLACE-1' });
      projectsRepo.save.mockImplementation(async (p) => p);

      const result = await service.addRadioLink(1, 20);

      expect(result.radioLinks).toHaveLength(1);
      expect(result.radioLinks[0].id).toBe(20);
    });

    it('should throw NotFoundException when project does not exist', async () => {
      projectsRepo.findOne.mockResolvedValue(null);

      await expect(service.findRadioLinks(99)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when radio link does not exist', async () => {
      projectsRepo.findOne.mockResolvedValue({ id: 1 });
      radioLinksRepo.findOne.mockResolvedValue(null);

      await expect(service.addRadioLink(1, 99)).rejects.toThrow(NotFoundException);
    });

    it('should remove a radio link from the project', async () => {
      projectsRepo.findOne.mockResolvedValue({ id: 1, radioLinks: [{ id: 20 }, { id: 21 }] });
      projectsRepo.save.mockImplementation(async (p) => p);

      const result = await service.removeRadioLink(1, 20);

      expect(result.radioLinks.map((r: any) => r.id)).toEqual([21]);
    });
  });

  describe('companies', () => {
    it('should list companies of a project', async () => {
      projectsRepo.findOne.mockResolvedValue({ id: 1, companies: [{ id: 5, nome: 'EA' }] });

      const result = await service.findCompanies(1);

      expect(projectsRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['companies'],
      });
      expect(result).toHaveLength(1);
    });

    it('should throw NotFoundException when project does not exist', async () => {
      projectsRepo.findOne.mockResolvedValue(null);

      await expect(service.findCompanies(99)).rejects.toThrow(NotFoundException);
    });

    it('should add a company to the project', async () => {
      projectsRepo.findOne.mockResolvedValue({ id: 1, companies: [] });
      companiesRepo.findOne.mockResolvedValue({ id: 5, nome: 'EA' });
      projectsRepo.save.mockImplementation(async (p) => p);

      const result = await service.addCompany(1, 5);

      expect(result.companies).toHaveLength(1);
    });

    it('should throw NotFoundException when company does not exist', async () => {
      projectsRepo.findOne.mockResolvedValue({ id: 1 });
      companiesRepo.findOne.mockResolvedValue(null);

      await expect(service.addCompany(1, 99)).rejects.toThrow(NotFoundException);
    });

    it('should remove a company from the project', async () => {
      projectsRepo.findOne.mockResolvedValue({ id: 1, companies: [{ id: 5 }, { id: 6 }] });
      projectsRepo.save.mockImplementation(async (p) => p);

      const result = await service.removeCompany(1, 5);

      expect(result.companies.map((c: any) => c.id)).toEqual([6]);
    });
  });
});
