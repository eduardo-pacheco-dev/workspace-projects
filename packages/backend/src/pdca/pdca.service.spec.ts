import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PdcaService } from './pdca.service';
import { Pdca } from './pdca.entity';
import { PdcaAction } from './pdca-action.entity';

describe('PdcaService', () => {
  let service: PdcaService;

  const pdcaRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const actionsRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
  };

  const buildQueryBuilder = (data: Pdca[], total: number) => {
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
        PdcaService,
        { provide: getRepositoryToken(Pdca), useValue: pdcaRepo },
        { provide: getRepositoryToken(PdcaAction), useValue: actionsRepo },
      ],
    }).compile();

    service = moduleRef.get(PdcaService);
  });

  describe('create', () => {
    it('should create a cycle with default fase and status', async () => {
      const saved = { id: 1, titulo: 'Reduzir falhas', fase: 'plan', statusCiclo: 'aberto' };
      pdcaRepo.create.mockReturnValue(saved);
      pdcaRepo.save.mockResolvedValue(saved);

      const result = await service.create({ titulo: 'Reduzir falhas' });

      expect(pdcaRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ titulo: 'Reduzir falhas', fase: 'plan', statusCiclo: 'aberto' }),
      );
      expect(result.fase).toBe('plan');
      expect(result.statusCiclo).toBe('aberto');
    });
  });

  describe('findAll', () => {
    it('should list cycles with default sort', async () => {
      const data = [{ id: 1, titulo: 'Ciclo A' }];
      const qb = buildQueryBuilder(data as Pdca[], 1);
      pdcaRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(pdcaRepo.createQueryBuilder).toHaveBeenCalledWith('p');
      expect(qb.orderBy).toHaveBeenCalledWith('p.id', 'ASC');
      expect(result).toEqual({ data, total: 1 });
    });

    it('should apply project, search, fase and status filters', async () => {
      const qb = buildQueryBuilder([], 0);
      pdcaRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ search: 'falhas', projectId: 3, fase: 'do', status: 'em_execucao' });

      expect(qb.where).toHaveBeenCalledWith('p.projectId = :projectId', { projectId: 3 });
      expect(qb.andWhere).toHaveBeenCalledWith(expect.stringContaining('p.titulo LIKE :search'), {
        search: '%falhas%',
      });
      expect(qb.andWhere).toHaveBeenCalledWith('p.fase = :fase', { fase: 'do' });
      expect(qb.andWhere).toHaveBeenCalledWith('p.statusCiclo = :status', { status: 'em_execucao' });
    });
  });

  describe('findById', () => {
    it('should return the cycle with actions', async () => {
      const actions = [{ id: 1, pdcaId: 1, what: 'Ação 1', status: 'pendente' }];
      pdcaRepo.findOne.mockResolvedValue({ id: 1, actions: [] });
      actionsRepo.find.mockResolvedValue(actions);

      const result = await service.findById(1);

      expect(result.actions).toEqual(actions);
      expect(actionsRepo.find).toHaveBeenCalledWith({ where: { pdcaId: 1 }, order: { createdAt: 'ASC' } });
    });

    it('should throw NotFoundException when not found', async () => {
      pdcaRepo.findOne.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update fields and set conclusion date when cycle is concluded', async () => {
      const pdca = { id: 1, titulo: 'Ciclo', fase: 'act', statusCiclo: 'em_verificacao' };
      pdcaRepo.findOne.mockResolvedValue(pdca);
      pdcaRepo.save.mockImplementation(async (p) => p);

      const result = await service.update(1, { statusCiclo: 'concluido' });

      expect(result.statusCiclo).toBe('concluido');
      expect(result.dataConclusao).toBeDefined();
    });

    it('should throw when advancing to check without a concluded action', async () => {
      const pdca = { id: 1, fase: 'do', causaRaiz: 'causa', statusCiclo: 'em_execucao' };
      pdcaRepo.findOne.mockResolvedValue(pdca);
      actionsRepo.count.mockResolvedValue(0);

      await expect(service.update(1, { fase: 'check' })).rejects.toThrow(BadRequestException);
    });

    it('should allow advancing to check when there is a concluded action', async () => {
      const pdca = { id: 1, fase: 'do', statusCiclo: 'em_execucao' };
      pdcaRepo.findOne.mockResolvedValue(pdca);
      actionsRepo.count.mockResolvedValue(1);

      const result = await service.update(1, { fase: 'check' });

      expect(result.fase).toBe('check');
      expect(result.statusCiclo).toBe('em_verificacao');
    });

    it('should require root cause and at least one action to advance to do', async () => {
      const pdca = { id: 1, fase: 'plan', statusCiclo: 'aberto' };
      pdcaRepo.findOne.mockResolvedValue(pdca);

      await expect(service.update(1, { fase: 'do' })).rejects.toThrow(
        'Para avançar para Do, preencha a análise da causa raiz',
      );
    });

    it('should throw NotFoundException when cycle does not exist', async () => {
      pdcaRepo.findOne.mockResolvedValue(null);

      await expect(service.update(99, { titulo: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('restart', () => {
    it('should create a new linked cycle', async () => {
      const source = { id: 1, projectId: 2, titulo: 'Ciclo original', problema: 'Problema X' };
      pdcaRepo.findOne.mockResolvedValue(source);
      const novo = { id: 2, titulo: 'Novo ciclo: Ciclo original', cicloPaiId: 1 };
      pdcaRepo.create.mockReturnValue(novo);
      pdcaRepo.save.mockResolvedValue(novo);

      const result = await service.restart(1);

      expect(pdcaRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ cicloPaiId: 1, fase: 'plan', statusCiclo: 'aberto' }),
      );
      expect(result.cicloPaiId).toBe(1);
    });
  });

  describe('actions', () => {
    it('should create an action with defaults', async () => {
      pdcaRepo.findOne.mockResolvedValue({ id: 1 });
      const saved = { id: 1, pdcaId: 1, what: 'Executar', status: 'pendente', progresso: 0 };
      actionsRepo.create.mockReturnValue(saved);
      actionsRepo.save.mockResolvedValue(saved);

      const result = await service.createAction(1, { what: 'Executar' });

      expect(actionsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ pdcaId: 1, what: 'Executar', status: 'pendente', progresso: 0 }),
      );
      expect(result.status).toBe('pendente');
    });

    it('should set real conclusion date when action is concluded', async () => {
      const action = { id: 1, pdcaId: 1, what: 'A', status: 'em_andamento', dataConclusaoReal: null };
      pdcaRepo.findOne.mockResolvedValue({ id: 1 });
      actionsRepo.findOne.mockResolvedValue(action);
      actionsRepo.save.mockImplementation(async (a) => a);

      const result = await service.updateAction(1, 1, { status: 'concluido' });

      expect(result.status).toBe('concluido');
      expect(result.dataConclusaoReal).toBeDefined();
      expect(result.atrasado).toBe(false);
    });

    it('should mark action as overdue when prazo passed', async () => {
      const action = {
        id: 1,
        pdcaId: 1,
        what: 'A',
        status: 'em_andamento',
        whenPrazo: '2000-01-01',
        dataConclusaoReal: null,
      };
      pdcaRepo.findOne.mockResolvedValue({ id: 1 });
      actionsRepo.findOne.mockResolvedValue(action);
      actionsRepo.save.mockImplementation(async (a) => a);

      const result = await service.updateAction(1, 1, { progresso: 50 });

      expect(result.atrasado).toBe(true);
      expect(result.status).toBe('atrasado');
    });

    it('should throw NotFoundException when action is not found', async () => {
      pdcaRepo.findOne.mockResolvedValue({ id: 1 });
      actionsRepo.findOne.mockResolvedValue(null);

      await expect(service.updateAction(1, 99, { what: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an existing cycle', async () => {
      pdcaRepo.delete.mockResolvedValue({ affected: 1 });

      await expect(service.delete(1)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when cycle does not exist', async () => {
      pdcaRepo.delete.mockResolvedValue({ affected: 0 });

      await expect(service.delete(99)).rejects.toThrow(NotFoundException);
    });
  });
});
