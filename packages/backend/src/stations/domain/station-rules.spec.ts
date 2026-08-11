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

    it('should require endId when operadora is missing', () => {
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
        { siteId: '  SITE-1  ', endId: '  END-1  ', operadora: 'TIM', status: 'INATIVO' },
        1,
      );

      expect(station?.siteId).toBe('SITE-1');
      expect(station?.endId).toBe('END-1');
      expect(station?.status).toBe('ativo');
    });

    it('should clear endId for non-TIM rows', () => {
      const { station } = parseImportItem({ siteId: 'SITE-2', endId: 'END-2', operadora: 'CLARO' }, 2);
      expect(station?.endId).toBe('');
      expect(station?.operadora).toBe('CLARO');
    });

    it('should trim and parse optional fields', () => {
      const { station } = parseImportItem(
        {
          siteId: 'SITE-3',
          endId: 'END-3',
          endereco: '  Rua A, 10  ',
          latitude: '-1.5',
          longitude: '-40.2',
          observacoes: '  obs  ',
        },
        3,
      );

      expect(station?.endereco).toBe('Rua A, 10');
      expect(station?.latitude).toBe(-1.5);
      expect(station?.longitude).toBe(-40.2);
      expect(station?.observacoes).toBe('obs');
    });

    it('should ignore invalid coordinates and blank optional strings', () => {
      const { station } = parseImportItem(
        { siteId: 'SITE-4', endId: 'END-4', latitude: 'abc', longitude: '', endereco: '   ' },
        4,
      );

      expect(station?.latitude).toBeUndefined();
      expect(station?.longitude).toBeUndefined();
      expect(station?.endereco).toBeUndefined();
    });

    it('should return an error when siteId is missing', () => {
      const { station, error } = parseImportItem({ endId: 'END-5' }, 5);
      expect(station).toBeUndefined();
      expect(error).toBe('Linha 5: Site ID e End ID são obrigatórios.');
    });

    it('should return an error for a TIM row without endId', () => {
      const { error } = parseImportItem({ siteId: 'SITE-6', operadora: 'TIM' }, 6);
      expect(error).toBe('Linha 6: Site ID e End ID são obrigatórios.');
    });

    it('should return an error mentioning only Site ID for non-TIM rows', () => {
      const { error } = parseImportItem({ endId: 'END-7', operadora: 'VIVO' }, 7);
      expect(error).toBe('Linha 7: Site ID é obrigatório.');
    });
  });
});
