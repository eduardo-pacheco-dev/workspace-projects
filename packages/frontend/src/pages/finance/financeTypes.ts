export interface FinanceEntry {
  id: number
  type: string
  description: string
  category: string
  amount: number
  date: string
  paymentMethod: string | null
  status: string
  notes: string | null
  accountId: number | null
  account?: { id: number; name: string } | null
  cardId: number | null
  card?: { id: number; name: string } | null
  recurrence: string | null
  tags: string | null
  attachment: string | null
}

export interface BankAccount {
  id: number
  name: string
  bank: string | null
  balance: number
}

export interface CreditCard {
  id: number
  name: string
  bank: string | null
  brand: string | null
  limit: number
  closingDay: number
  dueDay: number
}

export interface Category {
  id: number
  name: string
}

export interface LimitReportItem {
  id: number
  category: string
  month: number
  year: number
  amount: number
  spent: number
  remaining: number
  percentage: number
}

export interface Summary {
  income: number
  expenses: number
  balance: number
  pending: number
}

export type SortOrder = 'ASC' | 'DESC'

export const entryTypeLabels: Record<string, string> = {
  income: 'Receita',
  expense: 'Despesa',
  transfer: 'Transferência',
}

export const entryTypeColors: Record<string, 'success' | 'error' | 'info' | 'default'> = {
  income: 'success',
  expense: 'error',
  transfer: 'info',
}

export const entryStatusLabels: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  canceled: 'Cancelado',
}

export const entryStatusColors: Record<string, 'default' | 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  paid: 'success',
  canceled: 'error',
}

export const brandLabels: Record<string, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  elo: 'Elo',
  amex: 'Amex',
  hipercard: 'Hipercard',
}

export function progressColor(percentage: number): 'error' | 'warning' | 'success' {
  if (percentage >= 100) return 'error'
  if (percentage >= 80) return 'warning'
  return 'success'
}
