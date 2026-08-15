export interface PaginatedData<T> {
  data: T[]
  total: number
}

export function normalizeList<T>(res: T[] | { data?: T[]; total?: number } | undefined | null): PaginatedData<T> {
  if (Array.isArray(res)) return { data: res, total: res.length }
  return { data: res?.data ?? [], total: res?.total ?? 0 }
}
