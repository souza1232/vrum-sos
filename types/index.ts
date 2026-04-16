// =============================================================
// Vrum SOS - Tipos globais do sistema
// =============================================================

export type TipoUsuario = 'user' | 'provider' | 'admin'
export type StatusAprovacao = 'pendente' | 'aprovado' | 'reprovado'
export type TipoPrestador = 'autonomo' | 'empresa'
export type StatusSolicitacao = 'pendente' | 'em_andamento' | 'concluido' | 'cancelado'

export type TipoServico =
  | 'mecanico'
  | 'eletricista'
  | 'chaveiro'
  | 'borracheiro'
  | 'guincho'
  | 'guincho_pesado'

export const TIPOS_SERVICO_LABELS: Record<TipoServico, string> = {
  mecanico: 'Mecânico',
  eletricista: 'Eletricista Automotivo',
  chaveiro: 'Chaveiro',
  borracheiro: 'Borracheiro',
  guincho: 'Guincho',
  guincho_pesado: 'Guincho Pesado / Plataforma',
}

export const TIPOS_SERVICO_LIST: TipoServico[] = [
  'mecanico',
  'eletricista',
  'chaveiro',
  'borracheiro',
  'guincho',
  'guincho_pesado',
]

export const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

// =============================================================
// Database types (espelham as tabelas do Supabase)
// =============================================================

export interface Profile {
  id: string
  nome: string
  email: string
  tipo_usuario: TipoUsuario
  created_at: string
}

export interface Provider {
  id: string
  profile_id: string

  // Dados básicos
  nome: string
  email: string
  telefone: string | null
  whatsapp: string | null
  cidade: string
  estado: string

  // Serviços
  tipos_servico: TipoServico[]

  // Tipo prestador
  tipo_prestador: TipoPrestador
  nome_empresa: string | null
  cnpj: string | null
  quantidade_equipe: number | null
  atende_multiplos_chamados: boolean

  // Autônomo
  cpf: string | null
  trabalha_sozinho: boolean

  // Disponibilidade
  atende_24h: boolean
  atende_finais_semana: boolean
  atende_feriados: boolean
  atendimento_emergencial: boolean
  horario_inicio: string | null
  horario_fim: string | null
  raio_km: number

  // Info extra
  descricao: string | null
  pix: string | null
  foto_url: string | null

  // Localização geográfica
  latitude: number | null
  longitude: number | null

  // Status
  status_aprovacao: StatusAprovacao
  ativo: boolean
  created_at: string
}

export interface ServiceRequest {
  id: string
  user_id: string
  provider_id: string
  tipo_servico: string
  cidade: string
  observacao: string | null
  status: StatusSolicitacao
  created_at: string
  // joins opcionais
  provider?: Provider
  user?: Profile
}

// =============================================================
// Form types
// =============================================================

export interface RegisterUserForm {
  nome: string
  email: string
  senha: string
  confirmar_senha: string
}

export interface LoginForm {
  email: string
  senha: string
}

export interface ProviderRegisterForm {
  // Auth
  email: string
  senha: string
  confirmar_senha: string

  // Básico
  nome: string
  telefone: string
  whatsapp: string
  cidade: string
  estado: string

  // Serviços
  tipos_servico: TipoServico[]

  // Tipo
  tipo_prestador: TipoPrestador
  nome_empresa?: string
  cnpj?: string
  quantidade_equipe?: number
  atende_multiplos_chamados?: boolean
  cpf?: string
  trabalha_sozinho?: boolean

  // Disponibilidade
  atende_24h: boolean
  atende_finais_semana: boolean
  atende_feriados: boolean
  atendimento_emergencial: boolean
  horario_inicio?: string
  horario_fim?: string
  raio_km: number

  // Extra
  descricao?: string
  pix?: string
}

export interface ProviderFilters {
  cidade?: string
  tipo_servico?: TipoServico | ''
  busca?: string
  min_rating?: number
  userLat?: number
  userLng?: number
}

export interface ServiceRequestForm {
  provider_id: string
  tipo_servico: string
  cidade: string
  observacao?: string
}
