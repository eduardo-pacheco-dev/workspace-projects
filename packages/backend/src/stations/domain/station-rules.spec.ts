import {
  buildStationKey,
  normalizeStatus,
  parseCoordinate,
  parseImportItem,
  requiresEndId,
} from './station-rules';

describe('station-rules', () => {
  describe('requiresEndId', () => {
    it('should require endId for TIM', () => {
      expect(requiresEndId('TIM')).toBe(true);
    });

    it('should require endId when mobileCarrier is missing', () => {
      expect(requiresEndId()).toBe(true);
      expect(requiresEndId(undefined)).toBe(true);
    });

    it('should not require endId for other operators', () => {
      expect(requiresEndId('CLARO')).toBe(false);
      expect(requiresEndId('VIVO')).toBe(false);
    });
  });

  describe('buildStationKey', () => {
    it('should build the siteId::endId key', () => {
      expect(buildStationKey('SITE-1', 'END-1')).toBe('SITE-1::END-1');
    });
  });

  describe('normalizeStatus', () => {
    it('should normalize to inativo only when value is inativo', () => {
      expect(normalizeStatus('inativo')).toBe('inativo');
      expect(normalizeStatus('ativo')).toBe('ativo');
      expect(normalizeStatus('INATIVO')).toBe('ativo');
      expect(normalizeStatus(undefined)).toBe('ativo');
      expect(normalizeStatus('')).toBe('ativo');
    });
  });

  describe('parseCoordinate', () => {
    it('should parse numeric strings', () => {
      expect(parseCoordinate('-23.55')).toBe(-23.55);
      expect(parseCoordinate(10)).toBe(10);
    });

    it('should return undefined for empty, invalid or null values', () => {
      expect(parseCoordinate('')).toBeUndefined();
      expect(parseCoordinate('abc')).toBeUndefined();
      expect(parseCoordinate(null)).toBeUndefined();
      expect(parseCoordinate(undefined)).toBeUndefined();
    });
  });

  describe('parseImportItem', () => {
    it('should build a normalized station for a valid TIM row', () => {
      const { station } = parseImportItem(
        { siteId: '  SITE-1  ', endId: '  END-1  ', mobileCarrier: 'TIM', status: 'INATIVO' },
        1,
      );

      expect(station?.siteId).toBe('SITE-1');
      expect(station?.endId).toBe('END-1');
      expect(station?.status).toBe('ativo');
    });

    it('should clear endId for non-TIM rows', () => {
      const { station } = parseImportItem({ siteId: 'SITE-2', endId: 'END-2', mobileCarrier: 'CLARO' }, 2);
      expect(station?.endId).toBe('');
      expect(station?.mobileCarrier).toBe('CLARO');
    });

    it('should trim and parse optional fields', () => {
      const { station } = parseImportItem(
        {
          siteId: 'SITE-3',
          endId: 'END-3',
          address: '  Rua A, 10  ',
          latitude: '-1.5',
          longitude: '-40.2',
          notes: '  obs  ',
        },
        3,
      );

      expect(station?.address).toBe('Rua A, 10');
      expect(station?.latitude).toBe(-1.5);
      expect(station?.longitude).toBe(-40.2);
      expect(station?.notes).toBe('obs');
    });

    it('should ignore invalid coordinates and blank optional strings', () => {
      const { station } = parseImportItem(
        { siteId: 'SITE-4', endId: 'END-4', latitude: 'abc', longitude: '', address: '   ' },
        4,
      );

      expect(station?.latitude).toBeUndefined();
      expect(station?.longitude).toBeUndefined();
      expect(station?.address).toBeUndefined();
    });

    it('should return an error when siteId is missing', () => {
      const { station, error } = parseImportItem({ endId: 'END-5' }, 5);
      expect(station).toBeUndefined();
      expect(error).toBe('Linha 5: Site ID e End ID são obrigatórios.');
    });

    it('should return an error for a TIM row without endId', () => {
      const { error } = parseImportItem({ siteId: 'SITE-6', mobileCarrier: 'TIM' }, 6);
      expect(error).toBe('Linha 6: Site ID e End ID são obrigatórios.');
    });

    it('should parse the technical fields', () => {
      const { station } = parseImportItem(
        {
          siteId: 'SITE-8',
          endId: 'END-8',
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
          nominalAev: '120.5',
          groundArea: 45,
          structureHeight: '60',
          stationId: 'ST-999',
        },
        8,
      );

      expect(station?.elementType).toBe('Macro');
      expect(station?.technology).toBe('4G');
      expect(station?.areaHolder).toBe('Detentora A');
      expect(station?.infraContractType).toBe('Locação');
      expect(station?.infraHolder).toBe('Infra B');
      expect(station?.infraType).toBe('Torre');
      expect(station?.evType).toBe('EV-01');
      expect(station?.evSupplier).toBe('Fornecedor X');
      expect(station?.regional).toBe('Norte');
      expect(station?.towerType).toBe('Torre treliçada');
      expect(station?.nominalAev).toBe(120.5);
      expect(station?.groundArea).toBe(45);
      expect(station?.structureHeight).toBe(60);
      expect(station?.stationId).toBe('ST-999');
    });

    it('should return an error mentioning only Site ID for non-TIM rows', () => {
      const { error } = parseImportItem({ endId: 'END-7', mobileCarrier: 'VIVO' }, 7);
      expect(error).toBe('Linha 7: Site ID é obrigatório.');
    });
  });
});
