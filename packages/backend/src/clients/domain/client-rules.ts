export const CLIENT_STATUSES = ['ativo', 'inativo'] as const;
export type ClientStatus = (typeof CLIENT_STATUSES)[number];
