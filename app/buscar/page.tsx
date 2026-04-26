'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { TIPOS_SERVICO_LABELS, TipoServico } from '@/types'
import Footer from '@/components/layout/Footer'
import LooviCarousel from '@/components/ui/LooviCarousel'
import {
  Zap, Search, MapPin, Phone, MessageCircle, Star,
  Building2, User, Clock, Filter, X, LocateFixed, Loader2
} from 'lucide-react'
import { whatsappLink, formatPhone } from '@/lib/utils'

const TIPOS = Object.entries(TIPOS_SERVICO_LABELS) as [TipoServico, string][]

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

async function geocodificarCidade(cidade: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const q = encodeURIComponent(`${cidade}, Brazil`)
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`)
    const data = await res.json()
    if (!data?.length) return null
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch {
    return null
  }
}

function BuscarContent() {
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [cidade, setCidade] = useState(searchParams.get('cidade') ?? '')
  const [tipoServico, setTipoServico] = useState(searchParams.get('tipo') ?? '')
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [buscou, setBuscou] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoErro, setGeoErro] = useState('')
  const [clienteCoords, setClienteCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [wppToast, setWppToast] = useState<{ id: string; nome: string; link: string } | null>(null)

  useEffect(() => {
    if (searchParams.get('cidade') || searchParams.get('tipo')) {
      buscar()
    }
  }, [])

  async function buscar(override?: { cidade?: string; tipoServico?: string; coords?: { lat: number; lng: number } | null }) {
    setLoading(true)
    setBuscou(true)

    const cidadeEfetiva = override?.cidade !== undefined ? override.cidade : cidade
    const tipoEfetivo = override?.tipoServico !== undefined ? override.tipoServico : tipoServico
    const coordsOverride = override && 'coords' in override ? override.coords : undefined

    try {
      // Resolver coordenadas do cliente
      let coords = coordsOverride !== undefined ? coordsOverride : clienteCoords
      if (!coords && cidadeEfetiva.trim()) {
        coords = await geocodificarCidade(cidadeEfetiva.trim())
      }

      // Buscar prestadores — sem filtro de cidade se temos coordenadas (filtraremos por raio)
      let query = supabase
        .from('providers')
        .select('*')
        .eq('status_aprovacao', 'aprovado')
        .eq('ativo', true)

      if (tipoEfetivo) query = query.contains('tipos_servico', [tipoEfetivo])

      // Filtro por texto só quando não há coordenadas
      if (!coords && cidadeEfetiva.trim()) {
        query = query.ilike('cidade', `%${cidadeEfetiva.trim()}%`)
      }

      query = query.order('created_at', { ascending: false })

      const { data } = await query
      if (!data) return

      // Calcular distância e filtrar por raio quando temos coordenadas
      let resultado = data as any[]
      if (coords) {
        resultado = data
          .map((p: any) => ({
            ...p,
            distancia_km: p.latitude && p.longitude
              ? Math.round(haversineKm(coords!.lat, coords!.lng, p.latitude, p.longitude))
              : null,
          }))
          .filter((p: any) => {
            if (p.distancia_km === null) {
              return !cidadeEfetiva.trim() || p.cidade.toLowerCase().includes(cidadeEfetiva.trim().toLowerCase())
            }
            return p.distancia_km <= p.raio_km
          })
          .sort((a: any, b: any) => (a.distancia_km ?? 9999) - (b.distancia_km ?? 9999))
      }

      // Ratings
      const ids = resultado.map((p: any) => p.id)
      const { data: reviews } = ids.length
        ? await supabase.from('reviews').select('provider_id, rating').in('provider_id', ids)
        : { data: [] }

      const ratingsMap: Record<string, { sum: number; count: number }> = {}
      reviews?.forEach((r: any) => {
        if (!ratingsMap[r.provider_id]) ratingsMap[r.provider_id] = { sum: 0, count: 0 }
        ratingsMap[r.provider_id].sum += r.rating
        ratingsMap[r.provider_id].count += 1
      })

      setProviders(resultado.map((p: any) => ({
        ...p,
        avg_rating: ratingsMap[p.id] ? ratingsMap[p.id].sum / ratingsMap[p.id].count : null,
        total_reviews: ratingsMap[p.id]?.count ?? 0,
      })))
    } finally {
      setLoading(false)
    }
  }

  async function detectarLocalizacao() {
    if (!navigator.geolocation) {
      setGeoErro('Seu navegador não suporta geolocalização')
      return
    }
    setGeoLoading(true)
    setGeoErro('')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          setClienteCoords({ lat: latitude, lng: longitude })
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=pt-BR`,
            { headers: { 'User-Agent': 'VrumSOS/1.0' } }
          )
          const data = await res.json()
          const nomeCidade =
            data.address?.city ||
            data.address?.town ||
            data.address?.municipality ||
            data.address?.county ||
            ''
          if (nomeCidade) {
            setCidade(nomeCidade)
            setGeoErro('')
          } else {
            setGeoErro('Não foi possível identificar sua cidade')
          }
        } catch {
          setGeoErro('Erro ao obter localização')
        } finally {
          setGeoLoading(false)
        }
      },
      () => {
        setGeoErro('Permissão negada. Digite sua cidade manualmente.')
        setGeoLoading(false)
      },
      { timeout: 10000 }
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    buscar()
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* NAVBAR */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Vrum <span className="text-orange-400">SOS</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white hidden sm:block">Entrar</Link>
            <Link href="/register" className="text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg">Criar conta</Link>
          </div>
        </div>
      </nav>

      {/* BUSCA */}
      <div className="bg-slate-900 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-black text-white text-center mb-2">
            Encontre um prestador agora
          </h1>
          <p className="text-gray-400 text-center text-sm mb-6">Sem cadastro — veja o WhatsApp e ligue direto!</p>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Cidade (ex: Londrina)"
                value={cidade}
                onChange={e => setCidade(e.target.value)}
                className="flex-1 text-sm text-gray-700 outline-none placeholder-gray-400"
              />
              {cidade
                ? <button type="button" onClick={() => setCidade('')}><X className="w-3.5 h-3.5 text-gray-400" /></button>
                : (
                  <button
                    type="button"
                    onClick={detectarLocalizacao}
                    disabled={geoLoading}
                    title="Usar minha localização"
                    className="text-orange-500 hover:text-orange-600 flex-shrink-0"
                  >
                    {geoLoading
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <LocateFixed className="w-4 h-4" />
                    }
                  </button>
                )
              }
            </div>
            <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <select
                value={tipoServico}
                onChange={e => setTipoServico(e.target.value)}
                className="flex-1 text-sm text-gray-700 outline-none bg-transparent"
              >
                <option value="">Todos os serviços</option>
                {TIPOS.map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl transition-colors"
            >
              <Search className="w-4 h-4" />
              Buscar
            </button>
          </form>
          {geoErro && (
            <p className="text-center text-xs text-red-400 mt-3">{geoErro}</p>
          )}
        </div>
      </div>

      {/* BANNER LOOVI — largura total */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
        <LooviCarousel />
      </div>

      {/* RESULTADOS */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse h-48" />
            ))}
          </div>
        ) : !buscou ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-orange-500" />
            </div>
            <h2 className="font-bold text-slate-900 text-lg mb-2">Busque um prestador</h2>
            <p className="text-gray-500 text-sm">Digite a cidade e/ou tipo de serviço acima.</p>
          </div>
        ) : providers.length === 0 ? (
          <div className="py-12 max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="font-bold text-slate-900 text-lg mb-1">Nenhum prestador encontrado</h2>
              <p className="text-gray-500 text-sm">
                {cidade && tipoServico
                  ? `Sem ${TIPOS_SERVICO_LABELS[tipoServico as TipoServico] ?? tipoServico} em ${cidade}.`
                  : cidade
                  ? `Sem prestadores em ${cidade}.`
                  : 'Nenhum resultado para essa busca.'}
              </p>
            </div>

            {/* Sugestões */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Tente uma dessas opções</p>

              {tipoServico && (
                <button
                  onClick={() => { setTipoServico(''); buscar({ tipoServico: '' }) }}
                  className="w-full flex items-center gap-3 bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50 rounded-xl px-4 py-3.5 transition-colors text-left"
                >
                  <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Search className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Buscar todos os serviços</p>
                    <p className="text-xs text-gray-500">Remover filtro de {TIPOS_SERVICO_LABELS[tipoServico as TipoServico] ?? tipoServico}</p>
                  </div>
                </button>
              )}

              {cidade && (
                <button
                  onClick={() => { setCidade(''); setClienteCoords(null); buscar({ cidade: '', coords: null }) }}
                  className="w-full flex items-center gap-3 bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50 rounded-xl px-4 py-3.5 transition-colors text-left"
                >
                  <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Buscar em qualquer cidade</p>
                    <p className="text-xs text-gray-500">Ver todos os prestadores disponíveis no Brasil</p>
                  </div>
                </button>
              )}

              {tipoServico && cidade && (
                <button
                  onClick={() => { setTipoServico(''); setCidade(''); setClienteCoords(null); buscar({ tipoServico: '', cidade: '', coords: null }) }}
                  className="w-full flex items-center gap-3 bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50 rounded-xl px-4 py-3.5 transition-colors text-left"
                >
                  <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <X className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Limpar todos os filtros</p>
                    <p className="text-xs text-gray-500">Ver todos os prestadores cadastrados</p>
                  </div>
                </button>
              )}

              <div className="pt-2 border-t border-gray-100 text-center">
                <Link href="/provider-register" className="text-sm font-semibold text-orange-500 hover:text-orange-600">
                  É prestador? Cadastre-se grátis e apareça aqui →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{providers.length} prestador(es) encontrado(s)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {providers.map(p => {
                    const wLink = p.whatsapp ? whatsappLink(p.whatsapp, `Olá ${p.nome}, vi seu perfil no Vrum SOS e preciso de ajuda!`) : null
                    return (
                      <div key={p.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4 flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-orange-500 flex items-center justify-center relative">
                            {p.foto_url ? (
                              <Image src={p.foto_url} alt={p.nome} fill className="object-cover" unoptimized />
                            ) : (
                              <span className="text-white font-black text-xl">{p.nome.charAt(0)}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white text-sm truncate">{p.nome}</p>
                            {p.nome_empresa && <p className="text-gray-300 text-xs truncate">{p.nome_empresa}</p>}
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-gray-400 text-xs flex items-center gap-1">
                                {p.tipo_prestador === 'empresa' ? <Building2 className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                {p.tipo_prestador === 'empresa' ? 'Empresa' : 'Autônomo'}
                              </span>
                              <span className="text-gray-400 text-xs flex items-center gap-1">
                                <MapPin className="w-3 h-3" />{p.cidade}
                              </span>
                            </div>
                          </div>
                          {p.avg_rating && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="text-amber-300 text-xs font-semibold">{p.avg_rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>

                        {/* Serviços */}
                        <div className="px-5 py-3 border-b border-gray-100">
                          <div className="flex flex-wrap gap-1.5">
                            {p.tipos_servico?.slice(0, 3).map((t: string) => (
                              <span key={t} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                {TIPOS_SERVICO_LABELS[t as TipoServico] ?? t}
                              </span>
                            ))}
                            {p.tipos_servico?.length > 3 && (
                              <span className="text-xs text-gray-400">+{p.tipos_servico.length - 3}</span>
                            )}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="px-5 py-3 flex items-center gap-3 text-xs text-gray-500">
                          {p.atende_24h && <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-green-500" />24h</span>}
                          {p.distancia_km != null
                            ? <span className="flex items-center gap-1 text-orange-500 font-semibold"><MapPin className="w-3 h-3" />{p.distancia_km}km de você</span>
                            : <span><MapPin className="w-3 h-3 inline mr-0.5" />Raio {p.raio_km}km</span>
                          }
                        </div>

                        {/* Botões */}
                        <div className="px-5 pb-3 flex gap-2">
                          {wLink && (
                            <button
                              onClick={() => {
                                window.open(wLink, '_blank')
                                setWppToast({ id: p.id, nome: p.nome_empresa || p.nome, link: wLink })
                              }}
                              className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white font-semibold text-xs py-2.5 rounded-xl transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              WhatsApp
                            </button>
                          )}
                          {p.telefone && (
                            <a
                              href={`tel:${p.telefone}`}
                              className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs py-2.5 rounded-xl transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              Ligar
                            </a>
                          )}
                        </div>
                        <div className="px-5 pb-5">
                          <Link
                            href={`/p/${p.id}`}
                            className="w-full flex items-center justify-center text-xs text-gray-500 hover:text-orange-500 transition-colors py-1.5"
                          >
                            Ver perfil completo →
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* CTA cadastro */}
                <div className="mt-10 bg-slate-900 rounded-2xl p-6 text-center">
                  <p className="text-white font-semibold mb-1">Quer mais recursos?</p>
                  <p className="text-gray-400 text-sm mb-4">Crie uma conta grátis para enviar mensagens, avaliar prestadores e muito mais.</p>
                  <Link href="/register" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors">
                    Criar conta grátis
                  </Link>
                </div>
              </>
            )}
          </div>

      <Footer />

      {/* TOAST — lembrete de avaliar após WhatsApp */}
      {wppToast && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 bg-slate-900 rounded-2xl shadow-2xl p-4 flex items-start gap-3 animate-fade-in">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold">WhatsApp aberto com {wppToast.nome}</p>
            <p className="text-gray-400 text-xs mt-0.5">Após o atendimento, avalie e ajude outros motoristas!</p>
            <Link
              href={`/avaliar/${wppToast.id}`}
              className="inline-flex items-center gap-1 mt-2 text-orange-400 hover:text-orange-300 text-xs font-semibold"
            >
              <Star className="w-3 h-3" />
              Avaliar prestador →
            </Link>
          </div>
          <button
            onClick={() => setWppToast(null)}
            className="text-gray-500 hover:text-gray-300 flex-shrink-0 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}

export default function BuscarPage() {
  return (
    <Suspense>
      <BuscarContent />
    </Suspense>
  )
}
