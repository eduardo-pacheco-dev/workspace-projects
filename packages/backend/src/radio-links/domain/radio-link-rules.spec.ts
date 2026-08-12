import { RadioLink } from './radio-link.entity';
import {
  applyStationSnapshot,
  buildStationIndex,
  parseImportItem,
  resolveStation,
  RADIO_LINK_OPERADORAS,
} from './radio-link-rules';
import { StationRef } from './radio-link.repository';

describe('RadioLink domain rules', () => {
  describe('RADIO_LINK_OPERADORAS', () => {
    it('should list the supported operators', () => {
      expect(RADIO_LINK_OPERADORAS).toEqual(['TIM', 'CLARO', 'VIVO', 'Outras']);
    });
  });

  describe('parseImportItem', () => {
    it('should normalize a valid row', () => {
      const { radioLink } = parseImportItem(
        { nome: '  ENLACE-1  ', frequencia: '23 GHz', latitudeA: '-23.55', status: 'inativo' },
        1,
      );

      expect(radioLink?.nome).toBe('ENLACE-1');
      expect(radioLink?.frequencia).toBe('23 GHz');
      expect(radioLink?.latitudeA).toBe(-23.55);
      expect(radioLink?.status).toBe('inativo');
    });

    it('should default status to ativo', () => {
      const { radioLink } = parseImportItem({ nome: 'ENLACE-2' }, 2);
      expect(radioLink?.status).toBe('ativo');
    });

    it('should return an error when nome is missing', () => {
      const { radioLink, error } = parseImportItem({ nome: '   ' }, 3);
      expect(radioLink).toBeUndefined();
      expect(error).toBe('Linha 3: Nome é obrigatório.');
    });
  });

  describe('buildStationIndex and resolveStation', () => {
    const stations: StationRef[] = [
      { id: 1, siteId: 'SITE-A', endId: 'END-A', address: 'Av A', mobileCarrier: 'TIM' },
      { id: 2, siteId: 'SITE-B', endId: 'END-B', address: 'Av B', mobileCarrier: 'CLARO' },
    ];
    const index = buildStationIndex(stations);

    it('should resolve a TIM station by siteId and endId', () => {
      expect(resolveStation(index, 'SITE-A', 'END-A', 'TIM')?.id).toBe(1);
    });

    it('should fall back to siteId for a TIM station without a matching endId', () => {
      expect(resolveStation(index, 'SITE-A', 'OUTRO', 'TIM')?.id).toBe(1);
    });

    it('should resolve a non-TIM station by siteId', () => {
      expect(resolveStation(index, 'SITE-B', 'END-B', 'CLARO')?.id).toBe(2);
    });

    it('should return null when the station is not found', () => {
      expect(resolveStation(index, 'SITE-NAO-EXISTE', undefined, 'TIM')).toBeNull();
      expect(resolveStation(index, undefined, undefined, 'TIM')).toBeNull();
    });
  });

  describe('applyStationSnapshot', () => {
    it('should copy the station data to the A snapshot', () => {
      const radioLink = new RadioLink({ nome: 'ENLACE' });
      applyStationSnapshot(radioLink, { id: 5, siteId: 'SITE-1', endId: 'END-1', address: 'Av', mobileCarrier: 'TIM' }, 'A');

      expect(radioLink.stationAId).toBe(5);
      expect(radioLink.siteIdA).toBe('SITE-1');
      expect(radioLink.endIdA).toBe('END-1');
      expect(radioLink.enderecoA).toBe('Av');
      expect(radioLink.operadoraA).toBe('TIM');
    });

    it('should copy the station data to the B snapshot', () => {
      const radioLink = new RadioLink({ nome: 'ENLACE' });
      applyStationSnapshot(radioLink, { id: 6, siteId: 'SITE-2', endId: 'END-2', mobileCarrier: 'CLARO' }, 'B');

      expect(radioLink.stationBId).toBe(6);
      expect(radioLink.siteIdB).toBe('SITE-2');
      expect(radioLink.operadoraB).toBe('CLARO');
    });
  });
});
