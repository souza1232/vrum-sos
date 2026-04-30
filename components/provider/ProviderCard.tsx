'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Provider, TIPOS_SERVICO_LABELS, TipoServico } from '@/types'
import { whatsappLink } from '@/lib/utils'
import { MapPin, Clock, MessageCircle, Eye, Building2, User, Zap, Star, Heart, Navigation } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'
import { isNightTime } from '@/lib/utils'

interface ProviderCardProps {
  provider: Provider & {
    avg_rating?: number
    total_reviews?: number
    distance_km?: number
  }
  userId?: string
  isFavorited?: boolean
  onToggleFavorite?: (providerId: string, isFav: boolean) => void
}

export default function ProviderCard({ provider, userId, isFavorited = false, onToggleFavorite }: ProviderCardProps) {
  const supabase = createClient()
  const [fav, setFav] = useState(isFavorited)
  const [favLoading, setFavLoading] = useState(false)
  const nightTime = isNightTime()
  const abertoAgora = nightTime && provider.atende_24h

  const wLink = provider.whatsapp
    ? whatsappLink(provider.whatsapp, `Olá ${provider.nome}, vi seu perfil no Vrum SOS e gostaria de solicitar um atendimento.`)
    : null

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!userId || favLoading) return
    setFavLoading(true)
    const newFav = !fav
    setFav(newFav)
    try {
      if (newFav) {
        await supabase.from('favorites').insert({ user_id: userId, provider_id: provider.id })
      } else {
        await supabase.from('favorites').delete().eq('user_id', userId).eq('provider_id', provider.id)
      }
      onToggleFavorite?.(provider.id, newFav)
    } catch {
      setFav(!newFav)
    } finally {
      setFavLoading(false)
    }
  }

  return (
    <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group ${
      abertoAgora ? 'border-green-400 ring-1 ring-green-300' : 'border-gray-200 hover:border-orange-200'
    }`}>
      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-orange-500 flex items-center justify-center relative">
              {provider.foto_url ? (
                <Image src={provider.foto_url} alt={provider.nome} fill className="object-cover" unoptimized />
              ) : (
                <span className="text-white font-bold text-lg">{provider.nome.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-white text-sm leading-tight">{provider.nome}</h3>
              {provider.nome_empresa && (
                <p className="text-gray-400 text-xs mt-0.5">{provider.nome_empresa}</p>
              )}
              {provider.avg_rating ? (
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs text-amber-300 font-semibold">{provider.avg_rating.toFixed(1)}</span>
                  {provider.total_reviews && (
                    <span className="text-xs text-gray-500">({provider.total_reviews})</span>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1 text-gray-400 text-xs">
              {provider.tipo_prestador === 'empresa'
                ? <><Building2 className="w-3.5 h-3.5" /><span>Empresa</span></>
                : <><User className="w-3.5 h-3.5" /><span>Autônomo</span></>}
            </div>
            {userId && (
              <button
                onClick={toggleFavorite}
                disabled={favLoading}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                  fav ? 'bg-red-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-red-400'
                }`}
                title={fav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
              >
                <Heart className={`w-3.5 h-3.5 ${fav ? 'fill-white' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="px-5 py-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-gray-500 text-sm">
            <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0" />
            <span>{provider.cidade}, {provider.estado}</span>
            {provider.raio_km && (
              <span className="text-gray-400">· {provider.raio_km}km</span>
            )}
          </div>
          {provider.distance_km !== undefined && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
              <Navigation className="w-3 h-3" />
              {provider.distance_km < 1
                ? `${Math.round(provider.distance_km * 1000)}m`
                : `${provider.distance_km.toFixed(0)}km`}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {provider.tipos_servico.slice(0, 3).map(tipo => (
            <Badge key={tipo} variant="info" size="sm">
              {TIPOS_SERVICO_LABELS[tipo as TipoServico] ?? tipo}
            </Badge>
          ))}
          {provider.tipos_servico.length > 3 && (
            <Badge variant="outline" size="sm">+{provider.tipos_servico.length - 3}</Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {abertoAgora && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-white bg-green-500 px-2.5 py-1 rounded-full animate-pulse">
              🌙 Aberto agora
            </span>
          )}
          {provider.atende_24h && !abertoAgora && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
              <Clock className="w-3 h-3" />24h
            </span>
          )}
          {provider.atende_finais_semana && (
            <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">Fim de semana</span>
          )}
          {provider.atende_feriados && (
            <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">Feriados</span>
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

      {/* Ações */}
      <div className="px-5 pb-5 flex gap-2">
        {wLink && (
          <a
            href={wLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
        )}
        <Link
          href={`/dashboard/providers/${provider.id}`}
          className="flex-1 flex items-center justify-center gap-2 border border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-700 hover:text-orange-700 text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          <Eye className="w-4 h-4" />
          Ver detalhes
        </Link>
      </div>
    </div>
  )
}
