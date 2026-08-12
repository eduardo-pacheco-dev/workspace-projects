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
        address: 'Av. Central, 100',
        latitude: -23.55,
        longitude: -46.63,
        mobileCarrier: 'CLARO',
        notes: 'obs',
        status: 'inativo',
        createdAt,
      });

      expect(station.id).toBe(7);
      expect(station.address).toBe('Av. Central, 100');
      expect(station.latitude).toBe(-23.55);
      expect(station.longitude).toBe(-46.63);
      expect(station.mobileCarrier).toBe('CLARO');
      expect(station.notes).toBe('obs');
      expect(station.status).toBe('inativo');
      expect(station.createdAt).toBe(createdAt);
    });

    it('should keep undefined for absent optional fields', () => {
      const station = new Station({ siteId: 'SITE-003' });
      expect(station.address).toBeUndefined();
      expect(station.latitude).toBeUndefined();
      expect(station.mobileCarrier).toBeUndefined();
    });

    it('should preserve technical fields', () => {
      const station = new Station({
        siteId: 'SITE-004',
        endId: 'END-004',
        elementType: 'Macro',
        technology: '4G',
        areaHolder: 'Detentora A',
        infraContractType: 'Locação',
        infraHolder: 'Infra B',
        infraType: 'Torre',
        evType: 'EV-01',
        evSupplier: 'Fornecedor X',
        regional: 'Norte',
        towerType: 'Torre treliçada',
        nominalAev: 120,
        groundArea: 45.5,
        structureHeight: 60,
        stationId: 'ST-999',
      });

      expect(station.elementType).toBe('Macro');
      expect(station.technology).toBe('4G');
      expect(station.areaHolder).toBe('Detentora A');
      expect(station.infraContractType).toBe('Locação');
      expect(station.infraHolder).toBe('Infra B');
      expect(station.infraType).toBe('Torre');
      expect(station.evType).toBe('EV-01');
      expect(station.evSupplier).toBe('Fornecedor X');
      expect(station.regional).toBe('Norte');
      expect(station.towerType).toBe('Torre treliçada');
      expect(station.nominalAev).toBe(120);
      expect(station.groundArea).toBe(45.5);
      expect(station.structureHeight).toBe(60);
      expect(station.stationId).toBe('ST-999');
    });
  });

  describe('isTim', () => {
    it('should be true for TIM', () => {
      expect(new Station({ siteId: 'A', mobileCarrier: 'TIM' }).isTim).toBe(true);
    });

    it('should be true when mobileCarrier is missing', () => {
      expect(new Station({ siteId: 'A' }).isTim).toBe(true);
    });

    it('should be true when mobileCarrier is blank', () => {
      expect(new Station({ siteId: 'A', mobileCarrier: '  ' }).isTim).toBe(true);
    });

    it('should be false for other operators', () => {
      expect(new Station({ siteId: 'A', mobileCarrier: 'VIVO' }).isTim).toBe(false);
    });
  });

  describe('applyEndIdRule', () => {
    it('should keep endId for TIM stations', () => {
      const station = new Station({ siteId: 'A', endId: 'END', mobileCarrier: 'TIM' });
      station.applyEndIdRule();
      expect(station.endId).toBe('END');
    });

    it('should clear endId for non-TIM operators', () => {
      const station = new Station({ siteId: 'A', endId: 'END', mobileCarrier: 'CLARO' });
      station.applyEndIdRule();
      expect(station.endId).toBe('');
    });
  });

  describe('fromProps', () => {
    it('should build a station applying the endId rule', () => {
      const station = Station.fromProps({ siteId: 'A', endId: 'END', mobileCarrier: 'Outras' });
      expect(station.endId).toBe('');
    });

    it('should keep endId for TIM stations', () => {
      const station = Station.fromProps({ siteId: 'A', endId: 'END', mobileCarrier: 'TIM' });
      expect(station.endId).toBe('END');
    });
  });
});
