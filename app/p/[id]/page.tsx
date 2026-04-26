import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { TIPOS_SERVICO_LABELS, TipoServico } from '@/types'
import Footer from '@/components/layout/Footer'
import {
  Zap, MapPin, Phone, MessageCircle, Star, Building2, User,
  Shield, ArrowLeft, Share2, CheckCircle,
} from 'lucide-react'
import { whatsappLink } from '@/lib/utils'

const APP_URL = 'https://vrumsos.com.br'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient()
  const { data: p } = await supabase
    .from('providers')
    .select('nome, nome_empresa, cidade, estado, tipos_servico, descricao')
    .eq('id', params.id)
    .eq('status_aprovacao', 'aprovado')
    .eq('ativo', true)
    .single()

  if (!p) return { title: 'Prestador não encontrado | Vrum SOS' }

  const nome = p.nome_empresa || p.nome
  const servicos = (p.tipos_servico as TipoServico[])
    .map(t => TIPOS_SERVICO_LABELS[t])
    .join(', ')

  return {
    title: `${nome} — ${servicos} em ${p.cidade}`,
    description: p.descricao || `${nome} oferece ${servicos} em ${p.cidade}, ${p.estado}. Contato direto pelo WhatsApp.`,
    openGraph: {
      title: `${nome} | Vrum SOS`,
      description: `${servicos} em ${p.cidade}, ${p.estado}`,
    },
  }
}

export default async function PerfilPrestadorPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: provider } = await supabase
    .from('providers')
    .select('*')
    .eq('id', params.id)
    .eq('status_aprovacao', 'aprovado')
    .eq('ativo', true)
    .single()

  if (!provider) notFound()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating, comentario, avaliador_nome, created_at')
    .eq('provider_id', params.id)
    .order('created_at', { ascending: false })

  const avgRating = reviews && reviews.length > 0
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
    : null

  const wLink = provider.whatsapp
    ? whatsappLink(provider.whatsapp, `Olá ${provider.nome}, vi seu perfil no Vrum SOS e preciso de ajuda!`)
    : null

  const shareUrl = `${APP_URL}/p/${params.id}`
  const shareWpp = `https://wa.me/?text=${encodeURIComponent(`Achei esse prestador no Vrum SOS:\n*${provider.nome_empresa || provider.nome}* — ${provider.cidade}\n${shareUrl}`)}`

  const disponibilidades = [
    provider.atende_24h && '24 horas',
    provider.atende_finais_semana && 'Fins de semana',
    provider.atende_feriados && 'Feriados',
    provider.atendimento_emergencial && 'Emergência',
  ].filter(Boolean) as string[]

  const servicos = (provider.tipos_servico as TipoServico[])
    ?.map((t: TipoServico) => TIPOS_SERVICO_LABELS[t])
    .join(', ') ?? ''

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'AutomotiveBusiness',
    name: provider.nome_empresa || provider.nome,
    description: provider.descricao || `${servicos} em ${provider.cidade}, ${provider.estado}`,
    url: `${APP_URL}/p/${params.id}`,
    ...(provider.foto_url ? { image: provider.foto_url } : {}),
    ...(provider.telefone ? { telephone: provider.telefone } : {}),
    address: {
      '@type': 'PostalAddress',
      addressLocality: provider.cidade,
      addressRegion: provider.estado,
      addressCountry: 'BR',
    },
    ...(provider.latitude && provider.longitude ? {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: provider.latitude,
        longitude: provider.longitude,
      },
    } : {}),
    ...(provider.atende_24h ? { openingHours: 'Mo-Su 00:00-24:00' } : {}),
    ...(avgRating && reviews?.length ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating.toFixed(1),
        reviewCount: reviews.length,
        bestRating: 5,
        worstRating: 1,
      },
    } : {}),
    ...(reviews && reviews.length > 0 ? {
      review: reviews.slice(0, 5).map((r: any) => ({
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: r.rating,
          bestRating: 5,
          worstRating: 1,
        },
        author: {
          '@type': 'Person',
          name: r.avaliador_nome || 'Cliente anônimo',
        },
        datePublished: new Date(r.created_at).toISOString().split('T')[0],
        ...(r.comentario ? { reviewBody: r.comentario } : {}),
      })),
    } : {}),
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* NAVBAR */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Vrum <span className="text-orange-400">SOS</span></span>
          </Link>
          <Link href="/buscar" className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar à busca
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">

        {/* CARD PRINCIPAL */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">

          {/* Header com foto */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-8">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-orange-500 flex items-center justify-center relative">
                {provider.foto_url ? (
                  <Image src={provider.foto_url} alt={provider.nome} fill className="object-cover" unoptimized />
                ) : (
                  <span className="text-white font-black text-3xl">{provider.nome.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-black text-white leading-tight">{provider.nome}</h1>
                {provider.nome_empresa && (
                  <p className="text-gray-300 text-sm mt-0.5">{provider.nome_empresa}</p>
                )}
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-gray-400 text-xs flex items-center gap-1">
                    {provider.tipo_prestador === 'empresa'
                      ? <Building2 className="w-3 h-3" />
                      : <User className="w-3 h-3" />}
                    {provider.tipo_prestador === 'empresa' ? 'Empresa' : 'Autônomo'}
                  </span>
                  <span className="text-gray-400 text-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{provider.cidade}, {provider.estado}
                  </span>
                  {avgRating && (
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-amber-300 text-xs font-semibold">
                        {avgRating.toFixed(1)} ({reviews?.length} avaliações)
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Botões de contato */}
          <div className="px-6 py-5 border-b border-gray-100 flex gap-3">
            {wLink && (
              <a
                href={wLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            )}
            {provider.telefone && (
              <a
                href={`tel:${provider.telefone}`}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-3 rounded-xl transition-colors"
              >
                <Phone className="w-4 h-4" />
                Ligar
              </a>
            )}
            <a
              href={shareWpp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold px-4 py-3 rounded-xl transition-colors text-sm"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Compartilhar</span>
            </a>
          </div>

          {/* Serviços */}
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Serviços</h2>
            <div className="flex flex-wrap gap-2">
              {provider.tipos_servico?.map((t: string) => (
                <span key={t} className="bg-blue-50 text-blue-700 text-sm px-3 py-1.5 rounded-full font-medium">
                  {TIPOS_SERVICO_LABELS[t as TipoServico] ?? t}
                </span>
              ))}
            </div>
          </div>

          {/* Disponibilidade */}
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Disponibilidade</h2>
            <div className="flex flex-wrap gap-2">
              {disponibilidades.map(d => (
                <span key={d} className="flex items-center gap-1.5 bg-green-50 text-green-700 text-sm px-3 py-1.5 rounded-full font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {d}
                </span>
              ))}
              <span className="flex items-center gap-1.5 bg-gray-50 text-gray-600 text-sm px-3 py-1.5 rounded-full font-medium">
                <MapPin className="w-3.5 h-3.5" />
                Atende até {provider.raio_km}km
              </span>
            </div>
          </div>

          {/* Descrição */}
          {provider.descricao && (
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Sobre</h2>
              <p className="text-gray-700 text-sm leading-relaxed">{provider.descricao}</p>
            </div>
          )}

          {/* Verificado */}
          <div className="px-6 py-4 flex items-center gap-2 bg-green-50">
            <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-sm text-green-700 font-medium">Prestador verificado pelo Vrum SOS</span>
          </div>
        </div>

        {/* AVALIAÇÕES */}
        {reviews && reviews.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="font-bold text-slate-900 mb-4">
              Avaliações
              <span className="text-gray-400 font-normal text-sm ml-2">({reviews.length})</span>
            </h2>
            <div className="space-y-4">
              {reviews.map((r: any, i: number) => (
                <div key={i} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${s < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`}
                      />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">
                      {new Date(r.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {r.comentario && (
                    <p className="text-sm text-gray-600">{r.comentario}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA busca */}
        <div className="bg-slate-900 rounded-2xl p-6 text-center">
          <p className="text-white font-semibold mb-1">Precisa de outro serviço?</p>
          <p className="text-gray-400 text-sm mb-4">Encontre mais prestadores na sua cidade.</p>
          <Link
            href="/buscar"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            Buscar prestadores
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
