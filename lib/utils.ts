import { clsx, type ClassValue } from 'clsx'
import { TipoServico, TIPOS_SERVICO_LABELS, StatusAprovacao } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatTipoServico(tipo: TipoServico): string {
  return TIPOS_SERVICO_LABELS[tipo] ?? tipo
}

export function formatTiposServico(tipos: TipoServico[]): string {
  return tipos.map(formatTipoServico).join(', ')
}

export function formatStatusAprovacao(status: StatusAprovacao): string {
  const labels: Record<StatusAprovacao, string> = {
    pendente: 'Pendente',
    aprovado: 'Aprovado',
    reprovado: 'Reprovado',
  }
  return labels[status] ?? status
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return phone
}

export function whatsappLink(phone: string, msg?: string): string {
  const digits = phone.replace(/\D/g, '')
  const number = digits.startsWith('55') ? digits : `55${digits}`
  const text = msg ? encodeURIComponent(msg) : ''
  return `https://wa.me/${number}${text ? `?text=${text}` : ''}`
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/** Retorna true entre 19h e 6h — horário noturno */
export function isNightTime(): boolean {
  const h = new Date().getHours()
  return h >= 19 || h < 6
}

/** Fórmula de Haversine — retorna distância em km entre dois pontos geográficos */
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
