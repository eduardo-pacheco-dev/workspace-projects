import { Pdca } from './pdca.entity';
import { PdcaAction } from './pdca-action.entity';
import {
  applyActionStatusTimestamps,
  applyCycleConclusionDate,
  attachOverdueFlags,
  buildRestartProps,
  isActionOverdue,
  statusFromFase,
  validateTransition,
  PDCA_FASES,
} from './pdca-rules';

describe('Pdca domain rules', () => {
  describe('PDCA_FASES', () => {
    it('should list the phases in order', () => {
      expect(PDCA_FASES).toEqual(['plan', 'do', 'check', 'act']);
    });
  });

  describe('statusFromFase', () => {
    it('should map each phase to a status', () => {
      expect(statusFromFase('plan')).toBe('aberto');
      expect(statusFromFase('do')).toBe('em_execucao');
      expect(statusFromFase('check')).toBe('em_verificacao');
      expect(statusFromFase('act')).toBe('em_verificacao');
      expect(statusFromFase('outro')).toBe('aberto');
    });
  });

  describe('validateTransition', () => {
    it('should allow moving backwards without preconditions', () => {
      const pdca = new Pdca({ fase: 'do', statusCiclo: 'em_execucao' });
      expect(validateTransition(pdca, 'plan', { actionCount: 0, concludedCount: 0 })).toBeNull();
    });

    it('should require root cause to advance to do', () => {
      const pdca = new Pdca({ fase: 'plan', statusCiclo: 'aberto' });
      expect(validateTransition(pdca, 'do', { actionCount: 0, concludedCount: 0 })).toContain(
        'causa raiz',
      );
    });

    it('should require at least one action to advance to do', () => {
      const pdca = new Pdca({ fase: 'plan', statusCiclo: 'aberto', causaRaiz: 'causa' });
      expect(validateTransition(pdca, 'do', { actionCount: 0, concludedCount: 0 })).toContain(
        '5W2H',
      );
    });

    it('should require a concluded action to advance to check', () => {
      const pdca = new Pdca({ fase: 'do', statusCiclo: 'em_execucao', causaRaiz: 'causa' });
      expect(validateTransition(pdca, 'check', { actionCount: 1, concludedCount: 0 })).toContain(
        'concluída',
      );
    });

    it('should require results and validation to advance to act', () => {
      const pdca = new Pdca({ fase: 'check', statusCiclo: 'em_verificacao' });
      expect(validateTransition(pdca, 'act', { actionCount: 1, concludedCount: 1 })).toContain(
        'resultados',
      );

      pdca.resultadoCheck = 'ok';
      expect(validateTransition(pdca, 'act', { actionCount: 1, concludedCount: 1 })).toContain(
        'validação',
      );
    });

    it('should return null when all preconditions are met', () => {
      const pdca = new Pdca({
        fase: 'check',
        statusCiclo: 'em_verificacao',
        resultadoCheck: 'ok',
        statusValidacao: 'sucesso',
      });
      expect(validateTransition(pdca, 'act', { actionCount: 1, concludedCount: 1 })).toBeNull();
    });
  });

  describe('isActionOverdue', () => {
    it('should be true when prazo passed and not concluded', () => {
      expect(isActionOverdue({ whenPrazo: '2000-01-01', status: 'em_andamento' })).toBe(true);
    });

    it('should be false without a prazo or when concluded', () => {
      expect(isActionOverdue({ status: 'em_andamento' })).toBe(false);
      expect(isActionOverdue({ whenPrazo: '2000-01-01', status: 'concluido' })).toBe(false);
      expect(isActionOverdue({ whenPrazo: '2000-01-01', status: 'cancelado' })).toBe(false);
      expect(isActionOverdue({ whenPrazo: '2999-01-01', status: 'pendente' })).toBe(false);
    });
  });

  describe('applyActionStatusTimestamps', () => {
    it('should set the real conclusion date when concluded', () => {
      const action = new PdcaAction({ pdcaId: 1, what: 'A', status: 'em_andamento', dataConclusaoReal: null });
      applyActionStatusTimestamps(action);
      expect(action.dataConclusaoReal).toBeDefined();
    });

    it('should keep an existing conclusion date when reopened', () => {
      const action = new PdcaAction({ pdcaId: 1, what: 'A', status: 'em_andamento', dataConclusaoReal: '2026-01-01' });
      applyActionStatusTimestamps(action);
      expect(action.dataConclusaoReal).toBe('2026-01-01');
    });

    it('should set the real start date when started', () => {
      const action = new PdcaAction({ pdcaId: 1, what: 'A', status: 'pendente', dataInicioReal: null });
      action.status = 'em_andamento';
      applyActionStatusTimestamps(action);
      expect(action.dataInicioReal).toBeDefined();
    });
  });

  describe('applyCycleConclusionDate', () => {
    it('should set the conclusion date when cycle is concluded', () => {
      const pdca = new Pdca({ titulo: 'Ciclo', statusCiclo: 'concluido', dataConclusao: null });
      applyCycleConclusionDate(pdca);
      expect(pdca.dataConclusao).toBeDefined();
    });
  });

  describe('attachOverdueFlags', () => {
    it('should set the overdue flag on each action', () => {
      const actions = [
        new PdcaAction({ pdcaId: 1, what: 'A', status: 'em_andamento', whenPrazo: '2000-01-01' }),
        new PdcaAction({ pdcaId: 1, what: 'B', status: 'pendente' }),
      ];
      attachOverdueFlags(actions);
      expect(actions[0].atrasado).toBe(true);
      expect(actions[1].atrasado).toBe(false);
    });
  });

  describe('buildRestartProps', () => {
    it('should carry over the source fields and link the parent cycle', () => {
      const source = new Pdca({ id: 3, projectId: 2, titulo: 'Original', problema: 'P', statusCiclo: 'concluido' });
      const props = buildRestartProps(source);

      expect(props).toMatchObject({
        projectId: 2,
        titulo: 'Novo ciclo: Original',
        problema: 'P',
        cicloPaiId: 3,
        fase: 'plan',
        statusCiclo: 'aberto',
      });
    });
  });
});
