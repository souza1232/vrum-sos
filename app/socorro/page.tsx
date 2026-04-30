'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Zap, AlertTriangle, MessageCircle, Phone, MapPin, ChevronRight } from 'lucide-react'
import { TIPOS_SERVICO_LABELS, TipoServico } from '@/types'
import { whatsappLink } from '@/lib/utils'
import { geocodeAddress } from '@/lib/geocoding'
import { isNightTime } from '@/lib/utils'

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const TIPOS = [
  { value: 'guincho',        label: 'Guincho',        cor: 'bg-red-500',    corLight: 'bg-red-50 border-red-300 text-red-700' },
  { value: 'mecanico',       label: 'Mecânico',        cor: 'bg-blue-500',   corLight: 'bg-blue-50 border-blue-300 text-blue-700' },
  { value: 'borracheiro',    label: 'Borracheiro',     cor: 'bg-green-500',  corLight: 'bg-green-50 border-green-300 text-green-700' },
  { value: 'chaveiro',       label: 'Chaveiro',        cor: 'bg-purple-500', corLight: 'bg-purple-50 border-purple-300 text-purple-700' },
  { value: 'eletricista',    label: 'Eletricista',     cor: 'bg-yellow-500', corLight: 'bg-yellow-50 border-yellow-300 text-yellow-700' },
  { value: 'guincho_pesado', label: 'Guincho Pesado',  cor: 'bg-orange-500', corLight: 'bg-orange-50 border-orange-300 text-orange-700' },
]

interface Provider {
  id: string
  nome: string
  nome_empresa: string | null
  whatsapp: string | null
  telefone: string | null
  cidade: string
  estado: string
  descricao: string | null
  foto_url: string | null
  atende_24h: boolean
  atendimento_emergencial: boolean
  latitude: number | null
  longitude: number | null
  distanciaKm?: number
}

function SocorroContent() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const tipoInicial = searchParams.get('tipo') ?? ''

  const [step, setStep] = useState<'form' | 'lista'>('form')
  const [providers, setProviders] = useState<Provider[]>([])
  const [form, setForm] = useState({
    nome_cliente: '',
    telefone_cliente: '',
    tipo_servico: tipoInicial,
    cidade: '',
    observacao: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome_cliente || !form.telefone_cliente || !form.tipo_servico || !form.cidade) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }
    setLoading(true)
    setError('')

    // Busca todos os prestadores aprovados com esse serviço (sem filtro de cidade)
    const { data, error: err } = await supabase
      .from('providers')
      .select('id, nome, nome_empresa, whatsapp, telefone, cidade, estado, descricao, foto_url, atende_24h, atendimento_emergencial, latitude, longitude')
      .eq('status_aprovacao', 'aprovado')
      .eq('ativo', true)
      .contains('tipos_servico', [form.tipo_servico])

    setLoading(false)

    if (err) {
      setError('Erro ao buscar prestadores. Tente novamente.')
      return
    }

    let lista: Provider[] = data ?? []

    // Ordena por proximidade se conseguir geocodificar a cidade do cliente
    const coords = await geocodeAddress(`${form.cidade}, Brasil`)
    if (coords) {
      lista = lista.map(p => ({
        ...p,
        distanciaKm: p.latitude && p.longitude
          ? Math.round(haversineKm(coords.lat, coords.lng, p.latitude, p.longitude))
          : undefined,
      }))
      lista.sort((a, b) => {
        if (a.distanciaKm == null && b.distanciaKm == null) return 0
        if (a.distanciaKm == null) return 1
        if (b.distanciaKm == null) return -1
        return a.distanciaKm - b.distanciaKm
      })
    } else {
      // Sem coordenadas: cidade exata primeiro, depois os demais
      lista.sort((a, b) => {
        const aLocal = a.cidade.toLowerCase().includes(form.cidade.toLowerCase())
        const bLocal = b.cidade.toLowerCase().includes(form.cidade.toLowerCase())
        if (aLocal && !bLocal) return -1
        if (!aLocal && bLocal) return 1
        return 0
      })
    }

    // Boost noturno: das 19h às 6h, prestadores 24h sobem para o topo
    if (isNightTime()) {
      lista.sort((a, b) => {
        if (a.atende_24h && !b.atende_24h) return -1
        if (!a.atende_24h && b.atende_24h) return 1
        return 0
      })
    }

    setProviders(lista)
    setStep('lista')

    // Registra o chamado e dispara push (fire and forget)
    supabase.from('service_requests').insert({
      nome_cliente: form.nome_cliente,
      telefone_cliente: form.telefone_cliente,
      tipo_servico: form.tipo_servico,
      cidade: form.cidade,
      observacao: form.observacao || null,
      status: 'pendente',
    }).then(() => {
      fetch('/api/push/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoServico: form.tipo_servico,
          cidade: form.cidade,
          title: `🚨 Chamado SOS — ${TIPOS_SERVICO_LABELS[form.tipo_servico as TipoServico]}`,
          body: `${form.nome_cliente} precisa de ajuda em ${form.cidade}`,
        }),
      })
    })
  }

  const tipoAtual = TIPOS.find(t => t.value === form.tipo_servico)

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="border-b border-gray-800 px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-black text-white">Vrum <span className="text-orange-500">SOS</span></span>
        </Link>
      </header>

      <div className="flex-1 flex items-start justify-center p-4 pt-8">
        <div className="w-full max-w-md">

          {/* STEP 1: Formulário */}
          {step === 'form' && (
            <div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-black text-white mb-2">Precisa de socorro?</h1>
                <p className="text-gray-400">Preencha e mostramos os prestadores disponíveis agora.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">O que você precisa? *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {TIPOS.map(t => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, tipo_servico: t.value }))}
                        className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all ${
                          form.tipo_servico === t.value
                            ? `${t.cor} text-white scale-105`
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-1.5 block">Sua cidade *</label>
                  <input
                    type="text"
                    placeholder="Ex: Caravelas, BA"
                    value={form.cidade}
                    onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-1.5 block">Seu nome *</label>
                  <input
                    type="text"
                    placeholder="Como devemos te chamar?"
                    value={form.nome_cliente}
                    onChange={e => setForm(f => ({ ...f, nome_cliente: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-1.5 block">Seu WhatsApp *</label>
                  <input
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={form.telefone_cliente}
                    onChange={e => setForm(f => ({ ...f, telefone_cliente: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-1.5 block">
                    Descreva o problema <span className="text-gray-500 font-normal">(opcional)</span>
                  </label>
                  <textarea
                    placeholder="Ex: Pneu furado na rodovia, preciso de guincho..."
                    value={form.observacao}
                    onChange={e => setForm(f => ({ ...f, observacao: e.target.value }))}
                    rows={2}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none"
                  />
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-black text-lg py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Buscando prestadores...</span>
                  ) : (
                    <>
                      <span>🚨 Buscar socorro agora</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: Lista de prestadores */}
          {step === 'lista' && (
            <div>
              <div className="mb-6">
                <button
                  onClick={() => setStep('form')}
                  className="text-gray-400 text-sm hover:text-white mb-4 flex items-center gap-1"
                >
                  ← Voltar
                </button>
                <h2 className="text-2xl font-black text-white">
                  {providers.length > 0
                    ? `${providers.length} prestador${providers.length > 1 ? 'es' : ''} próximo${providers.length > 1 ? 's' : ''}`
                    : 'Nenhum prestador disponível'}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {tipoAtual?.label} — mais próximos de <strong className="text-white">{form.cidade}</strong>
                </p>
              </div>

              {providers.length === 0 ? (
                <div className="bg-gray-800 rounded-2xl p-8 text-center">
                  <p className="text-4xl mb-3">😔</p>
                  <p className="text-white font-semibold mb-1">Nenhum prestador cadastrado ainda</p>
                  <p className="text-gray-400 text-sm mb-6">
                    Ainda não temos prestadores de {tipoAtual?.label.toLowerCase()} na plataforma. Tente outro tipo de serviço.
                  </p>
                  <button
                    onClick={() => setStep('form')}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                  >
                    Voltar e tentar outro serviço
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {providers.map(p => {
                    const nome = p.nome_empresa || p.nome
                    const avaliarUrl = `${process.env.NEXT_PUBLIC_APP_URL}/avaliar/${p.id}`
                    const msg = `Olá ${nome}! Vi seu contato no Vrum SOS e preciso de ${TIPOS_SERVICO_LABELS[form.tipo_servico as TipoServico]} em ${form.cidade}. Meu nome é ${form.nome_cliente}.${form.observacao ? ` Problema: ${form.observacao}` : ''}\n\nApós o atendimento, poderia me avaliar aqui? ${avaliarUrl}`

                    return (
                      <div key={p.id} className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
                        <div className="flex items-start gap-3 mb-4">
                          {p.foto_url ? (
                            <img
                              src={p.foto_url}
                              alt={nome}
                              className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gray-700 flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-lg">{nome.charAt(0)}</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-white">{nome}</p>
                              {p.atende_24h && (
                                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">24h</span>
                              )}
                              {p.atendimento_emergencial && (
                                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold">Emergência</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <p className="text-gray-400 text-sm">{p.cidade} — {p.estado}</p>
                              {p.distanciaKm != null && (
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                  p.distanciaKm <= 30
                                    ? 'bg-green-900 text-green-300'
                                    : p.distanciaKm <= 100
                                    ? 'bg-yellow-900 text-yellow-300'
                                    : 'bg-gray-700 text-gray-300'
                                }`}>
                                  ~{p.distanciaKm} km
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {p.descricao && (
                          <p className="text-gray-400 text-sm mb-4 line-clamp-2">{p.descricao}</p>
                        )}

                        <div className="flex gap-2">
                          {p.whatsapp && (
                            <a
                              href={whatsappLink(p.whatsapp, msg)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                              <MessageCircle className="w-4 h-4" />
                              WhatsApp
                            </a>
                          )}
                          {p.telefone && (
                            <a
                              href={`tel:${p.telefone}`}
                              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                              <Phone className="w-4 h-4" />
                              Ligar
                            </a>
                          )}
                        </div>
                        <a
                          href={`/avaliar/${p.id}`}
                          className="block text-center text-xs text-gray-500 hover:text-orange-400 transition-colors pt-1"
                        >
                          ⭐ Avaliar após o atendimento
                        </a>
                      </div>
                    )
                  })}

                  <p className="text-center text-gray-500 text-xs pt-2">
                    Entre em contato com o prestador diretamente pelo WhatsApp ou telefone.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default function SocorroPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900" />}>
      <SocorroContent />
    </Suspense>
  )
}
