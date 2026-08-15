import { Observation } from './serviceOrdersTypes'

export function exportObservationsToTxt(observations: Observation[], orderNumber: string): void {
  if (observations.length === 0) return
  const lines = observations.map((obs, index) => {
    const attachment = obs.originalName ? `Anexo: ${obs.originalName}` : 'Anexo: -'
    return [
      `${index + 1}. ${obs.title}`,
      `Data: ${new Date(obs.createdAt).toLocaleString('pt-BR')}`,
      `Descrição: ${obs.description || '-'}`,
      attachment,
    ].join('\n')
  })
  const header = `Observações da Ordem de Serviço ${orderNumber}`
  const separator = '='.repeat(header.length)
  const content = `${header}\n${separator}\n\n${lines.join('\n\n')}\n`

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `observacoes-${orderNumber}.txt`
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
