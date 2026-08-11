import { Station } from './station.entity';

describe('Station domain entity', () => {
  describe('constructor', () => {
    it('should default status to ativo and endId to empty string', () => {
      const station = new Station({ siteId: 'SITE-001' });

      expect(station.siteId).toBe('SITE-001');
      expect(station.endId).toBe('');
      expect(station.status).toBe('ativo');
    });

    it('should preserve provided optional values', () => {
      const createdAt = new Date('2026-01-01');
      const station = new Station({
        id: 7,
        siteId: 'SITE-002',
        endId: 'END-002',
        endereco: 'Av. Central, 100',
        latitude: -23.55,
        longitude: -46.63,
        operadora: 'CLARO',
        observacoes: 'obs',
        status: 'inativo',
        createdAt,
      });

      expect(station.id).toBe(7);
      expect(station.endereco).toBe('Av. Central, 100');
      expect(station.latitude).toBe(-23.55);
      expect(station.longitude).toBe(-46.63);
      expect(station.operadora).toBe('CLARO');
      expect(station.observacoes).toBe('obs');
      expect(station.status).toBe('inativo');
      expect(station.createdAt).toBe(createdAt);
    });

    it('should keep undefined for absent optional fields', () => {
      const station = new Station({ siteId: 'SITE-003' });
      expect(station.endereco).toBeUndefined();
      expect(station.latitude).toBeUndefined();
      expect(station.operadora).toBeUndefined();
    });
  });

  describe('isTim', () => {
    it('should be true for TIM', () => {
      expect(new Station({ siteId: 'A', operadora: 'TIM' }).isTim).toBe(true);
    });

    it('should be true when operadora is missing', () => {
      expect(new Station({ siteId: 'A' }).isTim).toBe(true);
    });

    it('should be true when operadora is blank', () => {
      expect(new Station({ siteId: 'A', operadora: '  ' }).isTim).toBe(true);
    });

    it('should be false for other operators', () => {
      expect(new Station({ siteId: 'A', operadora: 'VIVO' }).isTim).toBe(false);
    });
  });

  describe('applyEndIdRule', () => {
    it('should keep endId for TIM stations', () => {
      const station = new Station({ siteId: 'A', endId: 'END', operadora: 'TIM' });
      station.applyEndIdRule();
      expect(station.endId).toBe('END');
    });

    it('should clear endId for non-TIM operators', () => {
      const station = new Station({ siteId: 'A', endId: 'END', operadora: 'CLARO' });
      station.applyEndIdRule();
      expect(station.endId).toBe('');
    });
  });

  describe('fromProps', () => {
    it('should build a station applying the endId rule', () => {
      const station = Station.fromProps({ siteId: 'A', endId: 'END', operadora: 'Outras' });
      expect(station.endId).toBe('');
    });

    it('should keep endId for TIM stations', () => {
      const station = Station.fromProps({ siteId: 'A', endId: 'END', operadora: 'TIM' });
      expect(station.endId).toBe('END');
    });
  });
});
