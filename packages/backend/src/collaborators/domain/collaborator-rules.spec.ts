import { Collaborator } from './collaborator.entity';
import { buildNome, generateCodigo, isMaster } from './collaborator-rules';

describe('Collaborator domain', () => {
  describe('constructor', () => {
    it('should default status to ativo and isFreelancer to false', () => {
      const collaborator = new Collaborator({ nome: 'João' });
      expect(collaborator.status).toBe('ativo');
      expect(collaborator.isFreelancer).toBe(false);
    });

    it('should preserve provided values', () => {
      const collaborator = new Collaborator({
        id: 1,
        nome: 'Maria',
        firstName: 'Maria',
        lastName: 'Souza',
        hourlyRate: 120,
        companyId: 2,
        status: 'inativo',
      });

      expect(collaborator.id).toBe(1);
      expect(collaborator.firstName).toBe('Maria');
      expect(collaborator.lastName).toBe('Souza');
      expect(collaborator.hourlyRate).toBe(120);
      expect(collaborator.companyId).toBe(2);
      expect(collaborator.status).toBe('inativo');
    });
  });

  describe('buildNome', () => {
    it('should join firstName and lastName', () => {
      expect(buildNome('Carlos', 'Silva')).toBe('Carlos Silva');
    });

    it('should return empty when both are missing', () => {
      expect(buildNome()).toBe('');
      expect(buildNome(undefined, 'Silva')).toBe('Silva');
    });
  });

  describe('generateCodigo', () => {
    it('should generate FR codigo for freelancers', () => {
      expect(generateCodigo(true, 1)).toBe('FR-0001');
      expect(generateCodigo(true, 42)).toBe('FR-0042');
    });

    it('should generate COL codigo for collaborators', () => {
      expect(generateCodigo(false, 1)).toBe('COL-0001');
      expect(generateCodigo(false, 100)).toBe('COL-0100');
    });
  });

  describe('isMaster', () => {
    it('should be true for master', () => {
      expect(isMaster({ role: 'master' })).toBe(true);
    });

    it('should be false otherwise', () => {
      expect(isMaster({ role: 'user' })).toBe(false);
      expect(isMaster(undefined)).toBe(false);
      expect(isMaster(null)).toBe(false);
    });
  });
});
