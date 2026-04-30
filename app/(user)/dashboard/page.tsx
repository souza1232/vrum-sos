'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Provider, ProviderFilters, TipoServico } from '@/types'
import UserLayout from '@/components/layout/UserLayout'
import ProviderCard from '@/components/provider/ProviderCard'
import ProviderFiltersComponent from '@/components/provider/ProviderFilters'
import ProviderMapWrapper from '@/components/map/ProviderMapWrapper'
import SkeletonCard from '@/components/ui/SkeletonCard'
import LooviCarousel from '@/components/ui/LooviCarousel'
import { SearchX, Wrench, LayoutGrid, Map } from 'lucide-react'
import { haversineDistance, isNightTime } from '@/lib/utils'

type ProviderWithMeta = Provider & {
  avg_rating?: number
  total_reviews?: number
  distance_km?: number
}

export default function DashboardPage() {
  const supabase = createClient()
  const [providers, setProviders] = useState<ProviderWithMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [filterLoading, setFilterLoading] = useState(false)
  const [profile, setProfile] = useState<{ id: string; nome: string; tipo_usuario: 'user' | 'provider' | 'admin' } | null>(null)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [activeFilters, setActiveFilters] = useState<ProviderFilters>({})

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: profileData }, { data: favData }] = await Promise.all([
        supabase.from('profiles').select('id, nome, tipo_usuario').eq('id', user.id).single(),
        supabase.from('favorites').select('provider_id').eq('user_id', user.id),
      ])

      setProfile(profileData as any)
      if (favData) setFavoriteIds(new Set(favData.map((f: any) => f.provider_id)))
      await fetchProviders({})
    }
    init()
  }, [])

  async function fetchProviders(filters: ProviderFilters) {
    setFilterLoading(true)
    setActiveFilters(filters)
    try {
      let query = supabase
        .from('providers')
        .select('*')
        .eq('status_aprovacao', 'aprovado')
        .eq('ativo', true)
        .order('created_at', { ascending: false })

      if (filters.cidade) query = query.ilike('cidade', `%${filters.cidade}%`)
      if (filters.tipo_servico) query = query.contains('tipos_servico', [filters.tipo_servico])
      if (filters.busca) query = query.ilike('nome', `%${filters.busca}%`)

      const { data, error } = await query
      if (error || !data) return

      // Buscar ratings de todos os providers encontrados
      const providerIds = data.map((p: any) => p.id)
      const { data: reviews } = await supabase
        .from('reviews')
        .select('provider_id, rating')
        .in('provider_id', providerIds)

      // Agrupar ratings por provider
      const ratingsMap: Record<string, { sum: number; count: number }> = {}
      reviews?.forEach((r: any) => {
        if (!ratingsMap[r.provider_id]) ratingsMap[r.provider_id] = { sum: 0, count: 0 }
        ratingsMap[r.provider_id].sum += r.rating
        ratingsMap[r.provider_id].count += 1
      })

      // Montar providers com metadata
      let enriched: ProviderWithMeta[] = data.map((p: any) => {
        const ratingData = ratingsMap[p.id]
        const avg_rating = ratingData ? ratingData.sum / ratingData.count : undefined
        const total_reviews = ratingData?.count

        let distance_km: number | undefined
        if (filters.userLat && filters.userLng && p.latitude && p.longitude) {
          distance_km = haversineDistance(filters.userLat, filters.userLng, p.latitude, p.longitude)
        }

        return { ...p, avg_rating, total_reviews, distance_km }
      })

      // Filtrar por avaliação mínima
      if (filters.min_rating && filters.min_rating > 0) {
        enriched = enriched.filter(p => (p.avg_rating ?? 0) >= filters.min_rating!)
      }

      // Quando GPS ativo: filtra pelo raio de atendimento e ordena por distância
      if (filters.userLat && filters.userLng) {
        enriched = enriched.filter(p => {
          if (!p.latitude || !p.longitude || p.distance_km === undefined) return true
          return p.distance_km <= p.raio_km
        })
        enriched.sort((a, b) => {
          const da = a.distance_km ?? Infinity
          const db = b.distance_km ?? Infinity
          return da - db
        })
      }

      // Boost noturno: das 19h às 6h, prestadores 24h sobem para o topo
      if (isNightTime()) {
        enriched.sort((a, b) => {
          if (a.atende_24h && !b.atende_24h) return -1
          if (!a.atende_24h && b.atende_24h) return 1
          return 0
        })
      }

      setProviders(enriched)
    } finally {
      setLoading(false)
      setFilterLoading(false)
    }
  }

  const handleFilter = useCallback((filters: ProviderFilters) => {
    fetchProviders(filters)
  }, [])

  function handleToggleFavorite(providerId: string, isFav: boolean) {
    setFavoriteIds(prev => {
      const next = new Set(prev)
      if (isFav) next.add(providerId)
      else next.delete(providerId)
      return next
    })
  }

  const providersWithCoords = providers.filter(p => p.latitude && p.longitude)

  if (loading) return (
    <UserLayout tipoUsuario={profile?.tipo_usuario} nomeUsuario={profile?.nome} activeTab="dashboard">
      <div className="mb-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse mb-2" />
        <div className="h-4 bg-gray-100 rounded w-64 animate-pulse" />
      </div>
      <div className="mb-6 h-32 bg-white rounded-2xl border border-gray-200 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </UserLayout>
  )

  return (
    <UserLayout tipoUsuario={profile?.tipo_usuario} nomeUsuario={profile?.nome} activeTab="dashboard">
      {/* Saudação */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Olá, {profile?.nome?.split(' ')[0] ?? 'usuário'} 👋
        </h1>
        <p className="text-gray-500 mt-1">Encontre o prestador automotivo que você precisa.</p>
      </div>

      {/* Banner Loovi */}
      <div className="mb-6">
        <LooviCarousel />
      </div>

      {/* Filtros */}
      <div className="mb-6">
        <ProviderFiltersComponent onFilter={handleFilter} loading={filterLoading} />
      </div>

      {/* Header dos resultados */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-700">
          {providers.length > 0
            ? `${providers.length} prestador${providers.length !== 1 ? 'es' : ''} encontrado${providers.length !== 1 ? 's' : ''}`
            : 'Prestadores disponíveis'}
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Wrench className="w-4 h-4 text-orange-400" />
            <span>Somente aprovados</span>
          </div>
          {/* Toggle lista / mapa */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />Lista
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'map' ? 'bg-white text-slate-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Map className="w-3.5 h-3.5" />Mapa
            </button>
          </div>
        </div>
      </div>

      {filterLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : providers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <SearchX className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-700 mb-1">Nenhum prestador encontrado</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Tente ajustar os filtros ou remover a busca por cidade/serviço.
          </p>
        </div>
      ) : viewMode === 'map' ? (
        <div>
          {providersWithCoords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 rounded-2xl border border-gray-200">
              <Map className="w-10 h-10 text-gray-300 mb-3" />
              <h3 className="font-semibold text-gray-600 mb-1">Sem localização disponível</h3>
              <p className="text-sm text-gray-400 max-w-sm">
                Nenhum dos prestadores encontrados possui coordenadas cadastradas.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-gray-400 mb-2">
                {providersWithCoords.length} de {providers.length} prestadores com localização no mapa
              </p>
              <ProviderMapWrapper
                providers={providersWithCoords}
                center={
                  activeFilters.userLat && activeFilters.userLng
                    ? [activeFilters.userLat, activeFilters.userLng]
                    : [-15.7801, -47.9292]
                }
                zoom={activeFilters.userLat ? 10 : 5}
                className="h-[350px] sm:h-[600px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {providers.map(provider => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              userId={profile?.id}
              isFavorited={favoriteIds.has(provider.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </UserLayout>
  )
}
