import { ServiceOrderObservation } from './observation.entity';
import { applyPositions, requireTitle } from './observation-rules';

describe('Observation domain rules', () => {
  describe('requireTitle', () => {
    it('should return the trimmed title', () => {
      expect(requireTitle('  Título  ')).toEqual({ title: 'Título' });
    });

    it('should return an error when the title is missing', () => {
      expect(requireTitle('')).toEqual({ error: 'Título é obrigatório.' });
      expect(requireTitle('   ')).toEqual({ error: 'Título é obrigatório.' });
      expect(requireTitle(undefined)).toEqual({ error: 'Título é obrigatório.' });
    });
  });

  describe('applyPositions', () => {
    it('should reorder the observations and report changes', () => {
      const observations = [
        new ServiceOrderObservation({ id: 1, serviceOrderId: 1, title: 'A', position: 0 }),
        new ServiceOrderObservation({ id: 2, serviceOrderId: 1, title: 'B', position: 1 }),
        new ServiceOrderObservation({ id: 3, serviceOrderId: 1, title: 'C', position: 2 }),
      ];

      const changed = applyPositions(observations, [3, 1, 2]);

      expect(changed).toBe(true);
      expect(observations.find((o) => o.id === 3)?.position).toBe(0);
      expect(observations.find((o) => o.id === 1)?.position).toBe(1);
      expect(observations.find((o) => o.id === 2)?.position).toBe(2);
    });

    it('should not report a change when the order is the same', () => {
      const observations = [
        new ServiceOrderObservation({ id: 1, serviceOrderId: 1, title: 'A', position: 0 }),
        new ServiceOrderObservation({ id: 2, serviceOrderId: 1, title: 'B', position: 1 }),
      ];

      expect(applyPositions(observations, [1, 2])).toBe(false);
    });

    it('should ignore ids that do not belong to the service order', () => {
      const observations = [new ServiceOrderObservation({ id: 1, serviceOrderId: 1, title: 'A', position: 0 })];

      expect(applyPositions(observations, [999])).toBe(false);
    });
  });
});
