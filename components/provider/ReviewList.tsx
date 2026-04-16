'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import StarRating, { StarDisplay } from '@/components/ui/StarRating'
import { PageSpinner } from '@/components/ui/Spinner'
import ReviewForm from './ReviewForm'
import { formatDate } from '@/lib/utils'
import { Star, MessageSquare, BarChart2 } from 'lucide-react'

interface Review {
  id: string
  rating: number
  comentario: string | null
  created_at: string
  user: { nome: string } | null
}

interface ReviewListProps {
  providerId: string
  currentUserId?: string | null
}

export default function ReviewList({ providerId, currentUserId }: ReviewListProps) {
  const supabase = createClient()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [userAlreadyReviewed, setUserAlreadyReviewed] = useState(false)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('reviews')
      .select('id, rating, comentario, created_at, user:profiles!reviews_user_id_fkey(nome)')
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false })

    if (data) {
      setReviews(data as unknown as Review[])
      if (currentUserId) {
        setUserAlreadyReviewed(data.some((r: any) => r.user_id === currentUserId))
      }
    }
    setLoading(false)
  }, [providerId, currentUserId])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  // Métricas
  const avg = reviews.length
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0

  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0,
  }))

  return (
    <div className="space-y-6">
      {/* Resumo de avaliações */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-orange-500" />
            Avaliações
          </h3>

          <div className="flex items-start gap-8">
            {/* Nota geral */}
            <div className="text-center flex-shrink-0">
              <p className="text-5xl font-black text-slate-900">{avg.toFixed(1)}</p>
              <StarRating value={Math.round(avg)} readonly size="sm" />
              <p className="text-xs text-gray-400 mt-1">{reviews.length} avaliação{reviews.length !== 1 ? 'ões' : ''}</p>
            </div>

            {/* Distribuição */}
            <div className="flex-1 space-y-1.5">
              {distribution.map(d => (
                <div key={d.star} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-3">{d.star}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${d.pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-4 text-right">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Formulário de avaliação */}
      {currentUserId && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          {showForm || userAlreadyReviewed ? (
            <>
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-orange-500" />
                {userAlreadyReviewed ? 'Sua avaliação' : 'Avaliar prestador'}
              </h3>
              <ReviewForm
                providerId={providerId}
                userId={currentUserId}
                onSuccess={() => {
                  fetchReviews()
                  setShowForm(false)
                  setUserAlreadyReviewed(true)
                }}
              />
            </>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:border-orange-300 hover:text-orange-500 transition-colors"
            >
              <Star className="w-4 h-4" />
              Avaliar este prestador
            </button>
          )}
        </div>
      )}

      {/* Lista de avaliações */}
      {loading ? (
        <PageSpinner />
      ) : reviews.length === 0 ? (
        <div className="text-center py-10">
          <Star className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Nenhuma avaliação ainda.</p>
          <p className="text-xs text-gray-400 mt-0.5">Seja o primeiro a avaliar!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-slate-700 font-bold text-sm">
                      {(r.user?.nome ?? 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{r.user?.nome ?? 'Usuário'}</p>
                    <p className="text-xs text-gray-400">{formatDate(r.created_at)}</p>
                  </div>
                </div>
                <StarRating value={r.rating} readonly size="sm" />
              </div>

              {r.comentario && (
                <p className="text-sm text-gray-600 leading-relaxed">{r.comentario}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
