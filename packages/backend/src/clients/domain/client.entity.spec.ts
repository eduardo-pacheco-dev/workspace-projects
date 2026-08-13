import { Client } from './client.entity';
import { Responsavel } from './responsavel.entity';
import { CLIENT_STATUSES } from './client-rules';

describe('Client domain', () => {
  describe('Client', () => {
    it('should default status to ativo', () => {
      const client = new Client({ nome: 'Empresa A' });
      expect(client.status).toBe('ativo');
    });

    it('should preserve provided values', () => {
      const client = new Client({ id: 1, nome: 'Empresa A', cidade: 'SP', status: 'inativo' });

      expect(client.id).toBe(1);
      expect(client.nome).toBe('Empresa A');
      expect(client.cidade).toBe('SP');
      expect(client.status).toBe('inativo');
    });
  });

  describe('Responsavel', () => {
    it('should preserve provided values', () => {
      const responsavel = new Responsavel({
        id: 2,
        clientId: 1,
        nome: 'João',
        sobrenome: 'Silva',
        funcao: 'Diretor',
      });

      expect(responsavel.clientId).toBe(1);
      expect(responsavel.nome).toBe('João');
      expect(responsavel.sobrenome).toBe('Silva');
      expect(responsavel.funcao).toBe('Diretor');
    });
  });

  describe('CLIENT_STATUSES', () => {
    it('should list the supported statuses', () => {
      expect(CLIENT_STATUSES).toEqual(['ativo', 'inativo']);
    });
  });
});
