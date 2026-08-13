import { ServiceOrderObservation } from './observation.entity';

export function requireTitle(value: string | undefined): { title?: string; error?: string } {
  const title = value?.trim();
  if (!title) {
    return { error: 'Título é obrigatório.' };
  }
  return { title };
}

export function applyPositions(
  observations: ServiceOrderObservation[],
  ids: number[],
): boolean {
  const byId = new Map(observations.map((observation) => [observation.id, observation]));

  let changed = false;
  for (let i = 0; i < ids.length; i++) {
    const observation = byId.get(ids[i]);
    if (observation && observation.position !== i) {
      observation.position = i;
      changed = true;
    }
  }
  return changed;
}
