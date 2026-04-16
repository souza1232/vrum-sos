'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Provider } from '@/types'
import UserLayout from '@/components/layout/UserLayout'
import ProviderCard from '@/components/provider/ProviderCard'
import SkeletonCard from '@/components/ui/SkeletonCard'
import { Heart } from 'lucide-react'
import Link from 'next/link'

type ProviderWithMeta = Provider & { avg_rating?: number; total_reviews?: number }

export default function FavoritosPage() {
  const supabase = createClient()
  const [providers, setProviders] = useState<ProviderWithMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<{ id: string; nome: string; tipo_usuario: 'user' | 'provider' | 'admin' } | null>(null)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, nome, tipo_usuario')
        .eq('id', user.id)
        .single()

      setProfile(profileData as any)

      const { data: favData } = await supabase
        .from('favorites')
        .select('provider_id, providers(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (favData && favData.length > 0) {
        const provs = favData.map((f: any) => f.providers).filter(Boolean) as Provider[]
        setFavoriteIds(new Set(provs.map(p => p.id)))

        // Buscar ratings
        const ids = provs.map(p => p.id)
        const { data: reviews } = await supabase
          .from('reviews')
          .select('provider_id, rating')
          .in('provider_id', ids)

        const ratingsMap: Record<string, { sum: number; count: number }> = {}
        reviews?.forEach((r: any) => {
          if (!ratingsMap[r.provider_id]) ratingsMap[r.provider_id] = { sum: 0, count: 0 }
          ratingsMap[r.provider_id].sum += r.rating
          ratingsMap[r.provider_id].count += 1
        })

        const enriched = provs.map(p => ({
          ...p,
          avg_rating: ratingsMap[p.id] ? ratingsMap[p.id].sum / ratingsMap[p.id].count : undefined,
          total_reviews: ratingsMap[p.id]?.count,
        }))

        setProviders(enriched)
      }

      setLoading(false)
    }
    load()
  }, [])

  function handleToggleFavorite(providerId: string, isFav: boolean) {
    if (!isFav) {
      setProviders(prev => prev.filter(p => p.id !== providerId))
      setFavoriteIds(prev => { const next = new Set(prev); next.delete(providerId); return next })
    }
  }

  if (loading) return (
    <UserLayout tipoUsuario={profile?.tipo_usuario} nomeUsuario={profile?.nome} activeTab="favoritos">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </UserLayout>
  )

  return (
    <UserLayout tipoUsuario={profile?.tipo_usuario} nomeUsuario={profile?.nome} activeTab="favoritos">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          Meus Favoritos
        </h1>
        <p className="text-gray-500 mt-1">Prestadores que você salvou para acesso rápido.</p>
      </div>

      {providers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-red-300" />
          </div>
          <h3 className="font-semibold text-gray-700 mb-1">Nenhum favorito ainda</h3>
          <p className="text-sm text-gray-500 max-w-sm mb-4">
            Clique no coração nos cards dos prestadores para salvá-los aqui.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            Explorar prestadores
          </Link>
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
