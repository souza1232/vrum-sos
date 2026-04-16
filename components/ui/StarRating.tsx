'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  totalReviews?: number
}

export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
  showValue = false,
  totalReviews,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0)

  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-7 h-7' }
  const starSize = sizes[size]

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => {
          const filled = star <= (hovered || value)
          return (
            <button
              key={star}
              type="button"
              disabled={readonly}
              onClick={() => onChange?.(star)}
              onMouseEnter={() => !readonly && setHovered(star)}
              onMouseLeave={() => !readonly && setHovered(0)}
              className={cn(
                'transition-colors',
                readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'
              )}
            >
              <Star
                className={cn(
                  starSize,
                  filled ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'
                )}
              />
            </button>
          )
        })}
      </div>

      {showValue && value > 0 && (
        <div className="flex items-center gap-1 ml-1">
          <span className="text-sm font-semibold text-gray-800">{value.toFixed(1)}</span>
          {totalReviews !== undefined && (
            <span className="text-xs text-gray-400">({totalReviews})</span>
          )}
        </div>
      )}
    </div>
  )
}

// Componente compacto para exibir estrelas em cards
export function StarDisplay({ rating, total }: { rating: number; total?: number }) {
  if (!rating) return null
  return (
    <div className="flex items-center gap-1">
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      <span className="text-xs font-semibold text-gray-700">{rating.toFixed(1)}</span>
      {total !== undefined && <span className="text-xs text-gray-400">({total})</span>}
    </div>
  )
}
