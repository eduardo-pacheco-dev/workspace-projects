import { Test } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PdcaService } from './pdca.service';
import { Pdca } from './domain/pdca.entity';
import { PdcaAction } from './domain/pdca-action.entity';
import { PDCA_REPOSITORY } from './domain/pdca.repository';

describe('PdcaService', () => {
  let service: PdcaService;

  const repo = {
    create: jest.fn(),
    save: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    delete: jest.fn(),
    countActions: jest.fn(),
    countActionsByStatus: jest.fn(),
    findActions: jest.fn(),
    createAction: jest.fn(),
    saveAction: jest.fn(),
    findActionById: jest.fn(),
    deleteAction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        PdcaService,
        { provide: PDCA_REPOSITORY, useValue: repo },
      ],
    }).compile();

    service = moduleRef.get(PdcaService);
  });

  describe('create', () => {
    it('should create a cycle with default fase and status', async () => {
      const saved = new Pdca({ id: 1, titulo: 'Reduzir falhas', fase: 'plan', statusCiclo: 'aberto' });
      repo.create.mockResolvedValue(saved);

      const result = await service.create({ titulo: 'Reduzir falhas' });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ titulo: 'Reduzir falhas', fase: 'plan', statusCiclo: 'aberto' }),
      );
      expect(result.fase).toBe('plan');
      expect(result.statusCiclo).toBe('aberto');
    });
  });

  describe('findAll', () => {
    it('should delegate to the repository', async () => {
      const data = [new Pdca({ id: 1, titulo: 'Ciclo A' })];
      repo.findAll.mockResolvedValue({ data, total: 1 });

      const query = { page: 1, limit: 10, search: 'falhas', projectId: 3, fase: 'do', status: 'em_execucao' };
      const result = await service.findAll(query);

      expect(repo.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual({ data, total: 1 });
    });
  });

  describe('findById', () => {
    it('should return the cycle with actions', async () => {
      const pdca = new Pdca({ id: 1, titulo: 'Ciclo A' });
      const actions = [new PdcaAction({ id: 1, pdcaId: 1, what: 'Ação 1', status: 'pendente' })];
      repo.findById.mockResolvedValue(pdca);
      repo.findActions.mockResolvedValue(actions);

      const result = await service.findById(1);

      expect(repo.findActions).toHaveBeenCalledWith(1);
      expect(result.actions).toEqual(actions);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update fields and set conclusion date when cycle is concluded', async () => {
      const pdca = new Pdca({ id: 1, titulo: 'Ciclo', fase: 'act', statusCiclo: 'em_verificacao' });
      repo.findById.mockResolvedValue(pdca);
      repo.save.mockImplementation(async (p) => p);

      const result = await service.update(1, { statusCiclo: 'concluido' });

      expect(result.statusCiclo).toBe('concluido');
      expect(result.dataConclusao).toBeDefined();
    });

    it('should throw when advancing to check without a concluded action', async () => {
      const pdca = new Pdca({ id: 1, fase: 'do', causaRaiz: 'causa', statusCiclo: 'em_execucao' });
      repo.findById.mockResolvedValue(pdca);
      repo.countActionsByStatus.mockResolvedValue(0);

      await expect(service.update(1, { fase: 'check' })).rejects.toThrow(BadRequestException);
    });

    it('should allow advancing to check when there is a concluded action', async () => {
      const pdca = new Pdca({ id: 1, fase: 'do', statusCiclo: 'em_execucao' });
      repo.findById.mockResolvedValue(pdca);
      repo.countActionsByStatus.mockResolvedValue(1);
      repo.save.mockImplementation(async (p) => p);

      const result = await service.update(1, { fase: 'check' });

      expect(result.fase).toBe('check');
      expect(result.statusCiclo).toBe('em_verificacao');
    });

    it('should require root cause and at least one action to advance to do', async () => {
      const pdca = new Pdca({ id: 1, fase: 'plan', statusCiclo: 'aberto' });
      repo.findById.mockResolvedValue(pdca);

      await expect(service.update(1, { fase: 'do' })).rejects.toThrow(
        'Para avançar para Do, preencha a análise da causa raiz',
      );
    });

    it('should throw NotFoundException when cycle does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.update(99, { titulo: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('restart', () => {
    it('should create a new linked cycle', async () => {
      const source = new Pdca({ id: 1, projectId: 2, titulo: 'Ciclo original', problema: 'Problema X' });
      repo.findById.mockResolvedValue(source);
      const novo = new Pdca({ id: 2, titulo: 'Novo ciclo: Ciclo original', cicloPaiId: 1 });
      repo.create.mockResolvedValue(novo);

      const result = await service.restart(1);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ cicloPaiId: 1, fase: 'plan', statusCiclo: 'aberto' }),
      );
      expect(result.cicloPaiId).toBe(1);
    });

    it('should throw NotFoundException when cycle does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.restart(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('actions', () => {
    it('should create an action with defaults', async () => {
      repo.findById.mockResolvedValue(new Pdca({ id: 1, titulo: 'Ciclo' }));
      repo.createAction.mockResolvedValue(
        new PdcaAction({ id: 1, pdcaId: 1, what: 'Executar', status: 'pendente', progresso: 0 }),
      );

      const result = await service.createAction(1, { what: 'Executar' });

      expect(repo.createAction).toHaveBeenCalledWith(
        expect.objectContaining({ pdcaId: 1, what: 'Executar', status: 'pendente', progresso: 0 }),
      );
      expect(result.status).toBe('pendente');
    });

    it('should set real conclusion date when action is concluded', async () => {
      const action = new PdcaAction({
        id: 1,
        pdcaId: 1,
        what: 'A',
        status: 'em_andamento',
        dataConclusaoReal: null,
      });
      repo.findById.mockResolvedValue(new Pdca({ id: 1, titulo: 'Ciclo' }));
      repo.findActionById.mockResolvedValue(action);
      repo.saveAction.mockImplementation(async (a) => a);

      const result = await service.updateAction(1, 1, { status: 'concluido' });

      expect(result.status).toBe('concluido');
      expect(result.dataConclusaoReal).toBeDefined();
      expect(result.atrasado).toBe(false);
    });

    it('should mark action as overdue when prazo passed', async () => {
      const action = new PdcaAction({
        id: 1,
        pdcaId: 1,
        what: 'A',
        status: 'em_andamento',
        whenPrazo: '2000-01-01',
        dataConclusaoReal: null,
      });
      repo.findById.mockResolvedValue(new Pdca({ id: 1, titulo: 'Ciclo' }));
      repo.findActionById.mockResolvedValue(action);
      repo.saveAction.mockImplementation(async (a) => a);

      const result = await service.updateAction(1, 1, { progresso: 50 });

      expect(result.atrasado).toBe(true);
      expect(result.status).toBe('atrasado');
    });

    it('should throw NotFoundException when action is not found', async () => {
      repo.findById.mockResolvedValue(new Pdca({ id: 1, titulo: 'Ciclo' }));
      repo.findActionById.mockResolvedValue(null);

      await expect(service.updateAction(1, 99, { what: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an existing cycle', async () => {
      repo.delete.mockResolvedValue(true);

      await expect(service.delete(1)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when cycle does not exist', async () => {
      repo.delete.mockResolvedValue(false);

      await expect(service.delete(99)).rejects.toThrow(NotFoundException);
    });
  });
});
