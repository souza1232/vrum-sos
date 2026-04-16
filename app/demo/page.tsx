'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Zap, Search, MapPin, Filter, MessageCircle, Eye, Clock,
  Building2, User, X, Wrench, ChevronLeft, Check, Send,
  Phone, Star, AlertTriangle
} from 'lucide-react'

// ── Dados fictícios ────────────────────────────────────────────────────────────

const MOCK_PROVIDERS = [
  {
    id: '1',
    nome: 'Carlos Mecânica Express',
    nome_empresa: 'Mecânica Express Ltda',
    tipo_prestador: 'empresa',
    cidade: 'São Paulo',
    estado: 'SP',
    tipos_servico: ['mecanico', 'eletricista'],
    atende_24h: true,
    atende_finais_semana: true,
    atende_feriados: false,
    atendimento_emergencial: true,
    whatsapp: '11999990001',
    telefone: '1133330001',
    horario_inicio: '07:00',
    horario_fim: '22:00',
    raio_km: 30,
    descricao: 'Especialistas em mecânica geral e elétrica automotiva. Mais de 15 anos no mercado com atendimento rápido e garantido.',
    pix: '11999990001',
    foto_url: null,
    status_aprovacao: 'aprovado',
    ativo: true,
    quantidade_equipe: 5,
    atende_multiplos_chamados: true,
    cnpj: '12.345.678/0001-90',
    cpf: null,
    trabalha_sozinho: false,
  },
  {
    id: '2',
    nome: 'João Borracheiro 24h',
    nome_empresa: null,
    tipo_prestador: 'autonomo',
    cidade: 'São Paulo',
    estado: 'SP',
    tipos_servico: ['borracheiro'],
    atende_24h: true,
    atende_finais_semana: true,
    atende_feriados: true,
    atendimento_emergencial: true,
    whatsapp: '11999990002',
    telefone: '1133330002',
    horario_inicio: null,
    horario_fim: null,
    raio_km: 20,
    descricao: 'Troca de pneus, remendo e calibragem. Atendo na sua localização, qualquer hora do dia.',
    pix: 'joaoborracheiro@pix',
    foto_url: null,
    status_aprovacao: 'aprovado',
    ativo: true,
    quantidade_equipe: null,
    atende_multiplos_chamados: false,
    cnpj: null,
    cpf: '123.456.789-00',
    trabalha_sozinho: true,
  },
  {
    id: '3',
    nome: 'Guincho Rápido SP',
    nome_empresa: 'GR Transportes',
    tipo_prestador: 'empresa',
    cidade: 'Guarulhos',
    estado: 'SP',
    tipos_servico: ['guincho', 'guincho_pesado'],
    atende_24h: true,
    atende_finais_semana: true,
    atende_feriados: true,
    atendimento_emergencial: true,
    whatsapp: '11999990003',
    telefone: '1133330003',
    horario_inicio: null,
    horario_fim: null,
    raio_km: 100,
    descricao: 'Guincho leve e pesado. Atendemos em toda a Grande São Paulo e interior. Frota própria com rastreamento.',
    pix: '11999990003',
    foto_url: null,
    status_aprovacao: 'aprovado',
    ativo: true,
    quantidade_equipe: 8,
    atende_multiplos_chamados: true,
    cnpj: '98.765.432/0001-11',
    cpf: null,
    trabalha_sozinho: false,
  },
  {
    id: '4',
    nome: 'Rogério Chaveiro',
    nome_empresa: null,
    tipo_prestador: 'autonomo',
    cidade: 'Campinas',
    estado: 'SP',
    tipos_servico: ['chaveiro'],
    atende_24h: false,
    atende_finais_semana: true,
    atende_feriados: false,
    atendimento_emergencial: false,
    whatsapp: '19999990004',
    telefone: '1933330004',
    horario_inicio: '08:00',
    horario_fim: '18:00',
    raio_km: 15,
    descricao: 'Cópia de chaves, conserto de fechaduras e abertura de veículos. Preço justo e serviço garantido.',
    pix: null,
    foto_url: null,
    status_aprovacao: 'aprovado',
    ativo: true,
    quantidade_equipe: null,
    atende_multiplos_chamados: false,
    cnpj: null,
    cpf: null,
    trabalha_sozinho: true,
  },
  {
    id: '5',
    nome: 'Elétrica Auto Top',
    nome_empresa: 'Auto Top Serviços',
    tipo_prestador: 'empresa',
    cidade: 'São Bernardo do Campo',
    estado: 'SP',
    tipos_servico: ['eletricista'],
    atende_24h: false,
    atende_finais_semana: false,
    atende_feriados: false,
    atendimento_emergencial: false,
    whatsapp: '11999990005',
    telefone: '1133330005',
    horario_inicio: '08:00',
    horario_fim: '17:00',
    raio_km: 25,
    descricao: 'Diagnóstico elétrico completo, instalação de som e acessórios, reparo de alternador e motor de partida.',
    pix: 'autotop@pix',
    foto_url: null,
    status_aprovacao: 'aprovado',
    ativo: true,
    quantidade_equipe: 3,
    atende_multiplos_chamados: true,
    cnpj: '11.222.333/0001-44',
    cpf: null,
    trabalha_sozinho: false,
  },
  {
    id: '6',
    nome: 'Ana Borracharia',
    nome_empresa: null,
    tipo_prestador: 'autonomo',
    cidade: 'Santo André',
    estado: 'SP',
    tipos_servico: ['borracheiro', 'mecanico'],
    atende_24h: false,
    atende_finais_semana: true,
    atende_feriados: false,
    atendimento_emergencial: true,
    whatsapp: '11999990006',
    telefone: '1133330006',
    horario_inicio: '07:00',
    horario_fim: '20:00',
    raio_km: 10,
    descricao: 'Borracharia completa com serviços de mecânica leve. Atendimento feminino e humanizado.',
    pix: '11999990006',
    foto_url: null,
    status_aprovacao: 'aprovado',
    ativo: true,
    quantidade_equipe: null,
    atende_multiplos_chamados: false,
    cnpj: null,
    cpf: null,
    trabalha_sozinho: true,
  },
]

const TIPO_LABELS: Record<string, string> = {
  mecanico: 'Mecânico',
  eletricista: 'Eletricista Auto',
  chaveiro: 'Chaveiro',
  borracheiro: 'Borracheiro',
  guincho: 'Guincho',
  guincho_pesado: 'Guincho Pesado',
}

const TIPOS = Object.entries(TIPO_LABELS)

// ── Componentes internos ───────────────────────────────────────────────────────

function ProviderCard({ provider, onDetail }: { provider: any; onDetail: (p: any) => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200 overflow-hidden group">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">{provider.nome.charAt(0)}</span>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm leading-tight">{provider.nome}</h3>
              {provider.nome_empresa && (
                <p className="text-gray-400 text-xs mt-0.5">{provider.nome_empresa}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 text-gray-400 text-xs flex-shrink-0">
            {provider.tipo_prestador === 'empresa'
              ? <><Building2 className="w-3.5 h-3.5" /><span>Empresa</span></>
              : <><User className="w-3.5 h-3.5" /><span>Autônomo</span></>}
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-3">
        <div className="flex items-center gap-1.5 text-gray-500 text-sm">
          <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0" />
          <span>{provider.cidade}, {provider.estado}</span>
          <span className="text-gray-400">· {provider.raio_km}km</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {provider.tipos_servico.slice(0, 3).map((t: string) => (
            <span key={t} className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
              {TIPO_LABELS[t] ?? t}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {provider.atende_24h && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
              <Clock className="w-3 h-3" />24h
            </span>
          )}
          {provider.atende_finais_semana && (
            <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">Fim de semana</span>
          )}
          {provider.atendimento_emergencial && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
              <Zap className="w-3 h-3" />Emergência
            </span>
          )}
        </div>

        {provider.descricao && (
          <p className="text-xs text-gray-500 line-clamp-2">{provider.descricao}</p>
        )}
      </div>

      <div className="px-5 pb-5 flex gap-2">
        <a
          href={`https://wa.me/55${provider.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          <MessageCircle className="w-4 h-4" />WhatsApp
        </a>
        <button
          onClick={() => onDetail(provider)}
          className="flex-1 flex items-center justify-center gap-2 border border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-700 hover:text-orange-700 text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          <Eye className="w-4 h-4" />Ver detalhes
        </button>
      </div>
    </div>
  )
}

function ProviderDetail({ provider, onBack }: { provider: any; onBack: () => void }) {
  const [obs, setObs] = useState('')
  const [sent, setSent] = useState(false)

  return (
    <div>
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" />Voltar para a listagem
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-2xl font-black text-white">
                  {provider.nome.charAt(0)}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{provider.nome}</h1>
                  {provider.nome_empresa && <p className="text-gray-300 text-sm">{provider.nome_empresa}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      {provider.tipo_prestador === 'empresa' ? <Building2 className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                      {provider.tipo_prestador === 'empresa' ? 'Empresa' : 'Autônomo'}
                    </span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{provider.cidade}, {provider.estado}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 space-y-5">
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Serviços</h3>
                <div className="flex flex-wrap gap-2">
                  {provider.tipos_servico.map((t: string) => (
                    <span key={t} className="text-sm font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                      {TIPO_LABELS[t] ?? t}
                    </span>
                  ))}
                </div>
              </div>

              {provider.descricao && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sobre</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{provider.descricao}</p>
                </div>
              )}

              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Disponibilidade</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Atende 24h', value: provider.atende_24h },
                    { label: 'Fins de semana', value: provider.atende_finais_semana },
                    { label: 'Feriados', value: provider.atende_feriados },
                    { label: 'Emergências', value: provider.atendimento_emergencial },
                  ].map(item => (
                    <div key={item.label} className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${item.value ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                      <Check className={`w-4 h-4 ${item.value ? 'text-green-500' : 'text-gray-300'}`} />
                      {item.label}
                    </div>
                  ))}
                </div>
                {provider.horario_inicio && (
                  <p className="text-sm text-gray-600 mt-2 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-orange-400" />
                    Horário: {provider.horario_inicio} às {provider.horario_fim}
                  </p>
                )}
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-orange-400" />Raio: {provider.raio_km}km
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
            <h3 className="font-semibold text-slate-900 text-sm">Contato direto</h3>
            <a href={`tel:${provider.telefone}`} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                <Phone className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Telefone</p>
                <p className="text-sm font-medium text-gray-900">{provider.telefone}</p>
              </div>
            </a>
            <a href={`https://wa.me/55${provider.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
              <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-green-600">WhatsApp</p>
                <p className="text-sm font-medium text-green-800">{provider.whatsapp}</p>
              </div>
            </a>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
            <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500" />Solicitar atendimento
            </h3>
            {sent ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <Check className="w-6 h-6 text-green-500 mx-auto mb-1" />
                <p className="text-sm font-medium text-green-700">Solicitação enviada!</p>
              </div>
            ) : (
              <>
                <textarea
                  value={obs}
                  onChange={e => setObs(e.target.value)}
                  placeholder="Descreva o problema (opcional)..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
                <button
                  onClick={() => setSent(true)}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                >
                  <Send className="w-4 h-4" />Solicitar atendimento
                </button>
                <p className="text-xs text-gray-400 text-center">Demo — nenhum dado é salvo</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Página principal ────────────────────────────────────────────────────────────

export default function DemoPage() {
  const [busca, setBusca] = useState('')
  const [cidade, setCidade] = useState('')
  const [tipo, setTipo] = useState('')
  const [detail, setDetail] = useState<any>(null)

  const filtered = MOCK_PROVIDERS.filter(p => {
    const matchBusca = !busca || p.nome.toLowerCase().includes(busca.toLowerCase())
    const matchCidade = !cidade || p.cidade.toLowerCase().includes(cidade.toLowerCase())
    const matchTipo = !tipo || p.tipos_servico.includes(tipo)
    return matchBusca && matchCidade && matchTipo
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">
              Vrum <span className="text-orange-500">SOS</span>
            </span>
            <span className="ml-2 text-xs font-semibold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">DEMO</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">Usuário Demo</span>
          </div>
        </div>
      </header>

      {/* Sub nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-200 w-fit mb-6">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-orange-500 text-white">
            <Search className="w-4 h-4" />Buscar prestadores
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
            <Filter className="w-4 h-4" />Minhas solicitações
          </button>
        </nav>
      </div>

      {/* Aviso demo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
          <p className="text-sm text-orange-700">
            <strong>Modo demo</strong> — dados fictícios para visualização. Para usar de verdade, configure o Supabase.
          </p>
          <Link href="/" className="ml-auto text-xs font-semibold text-orange-600 hover:text-orange-700 whitespace-nowrap flex items-center gap-1">
            <X className="w-3.5 h-3.5" />Fechar demo
          </Link>
        </div>
      </div>

      {/* Conteúdo */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {detail ? (
          <ProviderDetail provider={detail} onBack={() => setDetail(null)} />
        ) : (
          <>
            {/* Saudação */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Olá, Usuário 👋</h1>
              <p className="text-gray-500 mt-1">Encontre o prestador automotivo que você precisa.</p>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-4 h-4 text-orange-500" />
                <h2 className="font-semibold text-gray-700 text-sm">Filtrar prestadores</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                    placeholder="Buscar por nome..."
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={cidade}
                    onChange={e => setCidade(e.target.value)}
                    placeholder="Filtrar por cidade..."
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <select
                  value={tipo}
                  onChange={e => setTipo(e.target.value)}
                  className="flex-1 px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-700"
                >
                  <option value="">Todos os serviços</option>
                  {TIPOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                {(busca || cidade || tipo) && (
                  <button
                    onClick={() => { setBusca(''); setCidade(''); setTipo('') }}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 px-3 py-2.5 border border-gray-300 rounded-lg"
                  >
                    <X className="w-4 h-4" />Limpar
                  </button>
                )}
              </div>
            </div>

            {/* Resultados */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-700">
                {filtered.length} prestador{filtered.length !== 1 ? 'es' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
              </h2>
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-gray-400">Somente aprovados</span>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-700 mb-1">Nenhum prestador encontrado</h3>
                <p className="text-sm text-gray-500">Ajuste os filtros para ver mais resultados.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map(p => (
                  <ProviderCard key={p.id} provider={p} onDetail={setDetail} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
