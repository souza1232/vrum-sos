'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import StarRating from '@/components/ui/StarRating'
import Button from '@/components/ui/Button'
import { MessageSquarePlus } from 'lucide-react'

interface ReviewFormProps {
  providerId: string
  userId: string
  onSuccess: () => void
}

export default function ReviewForm({ providerId, userId, onSuccess }: ReviewFormProps) {
  const supabase = createClient()
  const [rating, setRating] = useState(0)
  const [comentario, setComentario] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) {
      setErro('Selecione uma nota de 1 a 5 estrelas.')
      return
    }

    setErro('')
    setLoading(true)

    const { error } = await supabase.from('reviews').upsert(
      {
        user_id: userId,
        provider_id: providerId,
        rating,
        comentario: comentario.trim() || null,
      },
      { onConflict: 'user_id,provider_id' }
    )

    setLoading(false)

    if (error) {
      setErro('Erro ao enviar avaliação. Tente novamente.')
    } else {
      setRating(0)
      setComentario('')
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Sua nota</p>
        <StarRating value={rating} onChange={setRating} size="lg" />
        {erro && <p className="text-xs text-red-500 mt-1">{erro}</p>}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          Comentário <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <textarea
          value={comentario}
          onChange={e => setComentario(e.target.value)}
          placeholder="Conte como foi o atendimento..."
          rows={3}
          maxLength={500}
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-400 text-right mt-0.5">{comentario.length}/500</p>
      </div>

      <Button type="submit" loading={loading} fullWidth>
        <MessageSquarePlus className="w-4 h-4" />
        Enviar avaliação
      </Button>
    </form>
  )
}
