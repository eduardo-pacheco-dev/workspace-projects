export interface PasswordCriterion {
  label: string
  met: boolean
}

export interface PasswordStrength {
  score: number
  label: string
  criteria: PasswordCriterion[]
}

export function getPasswordStrength(password: string): PasswordStrength {
  const criteria: PasswordCriterion[] = [
    { label: 'Mínimo de 8 caracteres', met: password.length >= 8 },
    { label: 'Letra maiúscula', met: /[A-Z]/.test(password) },
    { label: 'Letra minúscula', met: /[a-z]/.test(password) },
    { label: 'Número', met: /\d/.test(password) },
    { label: 'Caractere especial', met: /[^A-Za-z0-9]/.test(password) },
  ]

  if (!password) return { score: 0, label: '', criteria }

  let score = 0
  criteria.forEach((c) => {
    if (c.met) score++
  })

  const max = criteria.length
  const normalized = Math.min(score / max, 1)
  const pct = Math.round(normalized * 100)

  if (pct < 25) return { score: pct, label: 'Muito fraca', criteria }
  if (pct < 50) return { score: pct, label: 'Fraca', criteria }
  if (pct < 75) return { score: pct, label: 'Média', criteria }
  return { score: pct, label: 'Forte', criteria }
}

export function getStrengthColor(score: number): string {
  if (score < 25) return 'error.main'
  if (score < 50) return 'warning.main'
  if (score < 75) return 'info.main'
  return 'success.main'
}
